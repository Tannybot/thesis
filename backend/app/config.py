"""
Application configuration using Pydantic Settings.
Loads values from .env file with type validation.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "HerdScan"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    APP_URL: Optional[str] = None
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/livetrack"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Initial admin account
    DEFAULT_ADMIN_EMAIL: str = "admin@livestock.com"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"
    DEFAULT_ADMIN_NAME: str = "System Administrator"
    RESET_DEFAULT_ADMIN_PASSWORD: bool = True

    # CORS
    FRONTEND_URL: str = "https://thesis-eight-bice.vercel.app"  # Production frontend domain
    CORS_ORIGINS: Optional[str] = None
    CORS_ORIGIN_REGEX: Optional[str] = None

    # API abuse protection
    RATE_LIMIT_ENABLED: bool = True
    GLOBAL_RATE_LIMIT_PER_MINUTE: int = 100
    LOGIN_RATE_LIMIT_PER_MINUTE: int = 5
    LOGIN_RATE_LIMIT_PER_HOUR: int = 20
    AUTH_RATE_LIMIT_PER_MINUTE: int = 10
    EXPENSIVE_RATE_LIMIT_PER_MINUTE: int = 30
    SAME_ENDPOINT_RATE_LIMIT_PER_MINUTE: int = 45
    MAX_REQUEST_BODY_BYTES: int = 1_048_576
    REQUEST_TIMEOUT_SECONDS: int = 30
    ACCOUNT_LOCKOUT_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 15

    # QR Codes
    QR_BASE_URL: Optional[str] = None
    QR_CODE_BASE_URL: str = "https://livetrack.com/trace"  # Production QR scan route

    # Local AI text generation
    AI_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"
    OLLAMA_TIMEOUT_SECONDS: int = 60

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_flag(cls, value):
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod"}:
                return False
            if normalized in {"debug", "development", "dev"}:
                return True
        return value

    @model_validator(mode="after")
    def apply_production_url_aliases(self):
        if self.APP_URL:
            self.FRONTEND_URL = self.APP_URL.rstrip("/")
        if self.QR_BASE_URL:
            self.QR_CODE_BASE_URL = f"{self.QR_BASE_URL.rstrip('/')}/trace"
        if self.APP_ENV.lower() in {"production", "prod"} and self.SECRET_KEY == "change-me-in-production":
            raise ValueError("SECRET_KEY must be set from environment variables in production")
        return self

    @property
    def allowed_origins(self) -> list[str]:
        origins = {
            "http://localhost:5173",
            "https://thesis-eight-bice.vercel.app",
            self.FRONTEND_URL.rstrip("/"),
        }
        if self.CORS_ORIGINS:
            origins.update(origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip())
        return sorted(origins)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
