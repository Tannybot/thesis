"""
Application configuration using Pydantic Settings.
Loads values from .env file with type validation.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "LivestockTracker"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/livetrack"

    # JWT
    SECRET_KEY: str = "your-secure-secret-key-here"  # Generate a cryptographically secure 256-bit string
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    FRONTEND_URL: str = "https://livetrack.com"  # Production frontend domain

    # QR Codes
    QR_CODE_BASE_URL: str = "https://livetrack.com/animals"  # Production domain

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
