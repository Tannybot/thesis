"""
Application configuration using Pydantic Settings.
Loads values from .env file with type validation.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "LivestockTracker"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    APP_URL: Optional[str] = None
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
    CORS_ORIGINS: Optional[str] = None

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
        return self

    @property
    def allowed_origins(self) -> list[str]:
        origins = {self.FRONTEND_URL.rstrip("/")}
        if self.CORS_ORIGINS:
            origins.update(origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip())
        if self.APP_ENV != "production":
            origins.update({"http://localhost:5173", "http://localhost:3000"})
        return sorted(origins)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
