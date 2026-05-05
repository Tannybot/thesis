"""
Application configuration using Pydantic Settings.
Loads values from .env file with type validation.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
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
    QR_CODE_BASE_URL: str = "https://livetrack.com/animals/qr"  # Private production QR scan route

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

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
