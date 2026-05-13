"""Request security middleware for rate limits, body limits, and timeouts."""
from __future__ import annotations

import asyncio
import logging
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Callable

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RateLimitRule:
    name: str
    limit: int
    window_seconds: int
    key: Callable[[Request, str], str]


class InMemoryRateLimiter:
    """Small in-process limiter. Use Redis/platform protection for multi-instance production."""

    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        now = time.monotonic()
        bucket = self._events[key]
        cutoff = now - window_seconds
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()

        if len(bucket) >= limit:
            retry_after = max(1, int(window_seconds - (now - bucket[0])))
            return False, retry_after

        bucket.append(now)
        return True, 0


limiter = InMemoryRateLimiter()


class RequestBodyTooLarge(Exception):
    pass


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"


def _path_group(path: str) -> str:
    if path.startswith("/api/auth/login"):
        return "auth-login"
    if path.startswith("/api/auth/register"):
        return "auth-register"
    if path.startswith("/api/ai"):
        return "ai"
    if path.startswith("/api/qr-codes") or path.startswith("/api/trace"):
        return "qr"
    if path.startswith("/api/dashboard"):
        return "dashboard"
    return "api"


def _rules_for_request(request: Request, ip: str) -> list[RateLimitRule]:
    path = request.url.path
    method = request.method.upper()
    group = _path_group(path)
    rules = [
        RateLimitRule(
            name="global",
            limit=settings.GLOBAL_RATE_LIMIT_PER_MINUTE,
            window_seconds=60,
            key=lambda _request, client_ip: f"global:{client_ip}",
        ),
        RateLimitRule(
            name="same-endpoint",
            limit=settings.SAME_ENDPOINT_RATE_LIMIT_PER_MINUTE,
            window_seconds=60,
            key=lambda _request, client_ip: f"same:{client_ip}:{method}:{path}",
        ),
    ]

    if group == "auth-login":
        rules.extend([
            RateLimitRule(
                name="login-minute",
                limit=settings.LOGIN_RATE_LIMIT_PER_MINUTE,
                window_seconds=60,
                key=lambda _request, client_ip: f"login:m:{client_ip}",
            ),
            RateLimitRule(
                name="login-hour",
                limit=settings.LOGIN_RATE_LIMIT_PER_HOUR,
                window_seconds=3600,
                key=lambda _request, client_ip: f"login:h:{client_ip}",
            ),
        ])
    elif group == "auth-register":
        rules.append(RateLimitRule(
            name="auth-register",
            limit=settings.AUTH_RATE_LIMIT_PER_MINUTE,
            window_seconds=60,
            key=lambda _request, client_ip: f"register:{client_ip}",
        ))
    elif group in {"ai", "qr", "dashboard"}:
        rules.append(RateLimitRule(
            name=f"{group}-expensive",
            limit=settings.EXPENSIVE_RATE_LIMIT_PER_MINUTE,
            window_seconds=60,
            key=lambda _request, client_ip: f"expensive:{group}:{client_ip}",
        ))

    return rules


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method.upper() == "OPTIONS":
            return await call_next(request)

        path = request.url.path
        ip = get_client_ip(request)

        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > settings.MAX_REQUEST_BODY_BYTES:
                    logger.warning("Request body rejected: ip=%s path=%s bytes=%s", ip, path, content_length)
                    return JSONResponse(status_code=413, content={"detail": "Request body too large"})
            except ValueError:
                logger.warning("Suspicious content-length header: ip=%s path=%s", ip, path)
                return JSONResponse(status_code=400, content={"detail": "Invalid request"})

        original_receive = request._receive
        received_bytes = 0

        async def limited_receive():
            nonlocal received_bytes
            message = await original_receive()
            if message.get("type") == "http.request":
                received_bytes += len(message.get("body", b""))
                if received_bytes > settings.MAX_REQUEST_BODY_BYTES:
                    raise RequestBodyTooLarge()
            return message

        request._receive = limited_receive

        if settings.RATE_LIMIT_ENABLED and path.startswith("/api"):
            for rule in _rules_for_request(request, ip):
                allowed, retry_after = limiter.check(rule.key(request, ip), rule.limit, rule.window_seconds)
                if not allowed:
                    logger.warning("Rate limit exceeded: rule=%s ip=%s path=%s", rule.name, ip, path)
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests. Please try again later."},
                        headers={"Retry-After": str(retry_after)},
                    )

        try:
            return await asyncio.wait_for(call_next(request), timeout=settings.REQUEST_TIMEOUT_SECONDS)
        except RequestBodyTooLarge:
            logger.warning("Streamed request body rejected: ip=%s path=%s", ip, path)
            return JSONResponse(status_code=413, content={"detail": "Request body too large"})
        except asyncio.TimeoutError:
            logger.warning("Request timeout: ip=%s path=%s", ip, path)
            return JSONResponse(status_code=504, content={"detail": "Request timed out"})
