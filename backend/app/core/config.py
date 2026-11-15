"""
ASTRA HEALTH - Core Application Configuration
Loads settings from environment variables or .env file with fallback defaults.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Path to the backend root directory (where .env resides)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

# Load .env if present
if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE)


class Settings:
    """Application configuration settings."""

    # Project metadata
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ASTRA HEALTH API")
    VERSION: str = os.getenv("VERSION", "0.1.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")

    # Server settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS settings
    @property
    def cors_origins(self) -> List[str]:
        raw_origins = os.getenv(
            "BACKEND_CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.67:3000",
        )
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    # PostgreSQL configuration
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "astra_health")

    # Database URL
    @property
    def database_url(self) -> str:
        # If DATABASE_URL is set in environment, use it directly
        explicit_url = os.getenv("DATABASE_URL")
        if explicit_url:
            return explicit_url
        # Otherwise construct standard psycopg PostgreSQL connection string
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Database connection pool
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "10"))


settings = Settings()
