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
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./livestock.db"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # QR Codes
    QR_CODE_BASE_URL: str = "http://localhost:5173/animals/scan"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
