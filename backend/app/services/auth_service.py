"""
Auth service — handles user registration, login, and token generation.
"""
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.role import Role
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.config import settings

logger = logging.getLogger(__name__)

GENERIC_LOGIN_ERROR = "Invalid credentials or temporarily locked account."


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_aware_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _reject_login() -> None:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=GENERIC_LOGIN_ERROR,
    )


def register_user(db: Session, data: RegisterRequest) -> User:
    """Register a new public user with the fixed user role."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    role = db.query(Role).filter(Role.name == "user").first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default user role is not configured"
        )

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role_id=role.id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: LoginRequest) -> TokenResponse:
    """Authenticate user and return JWT tokens."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        logger.warning("Login failed: account not found")
        _reject_login()

    now = _utc_now()
    locked_until = _as_aware_utc(user.locked_until)
    if locked_until and locked_until > now:
        logger.warning("Login blocked: account_id=%s locked_until=%s", user.id, locked_until.isoformat())
        _reject_login()

    if not verify_password(data.password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= settings.ACCOUNT_LOCKOUT_ATTEMPTS:
            user.locked_until = now + timedelta(minutes=settings.ACCOUNT_LOCKOUT_MINUTES)
            logger.warning("Account locked after failed logins: account_id=%s", user.id)
        else:
            logger.warning("Login failed: account_id=%s attempts=%s", user.id, user.failed_login_attempts)
        db.commit()
        _reject_login()

    if not user.is_active:
        logger.warning("Login blocked: account_id=%s inactive", user.id)
        _reject_login()

    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    # Create tokens with user info in payload
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.name,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )
