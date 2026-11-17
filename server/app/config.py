import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "University Library Management System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database: Supports Supabase PostgreSQL URL or local PostgreSQL/SQLite fallback
    # Example Supabase: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./library.db")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "libook-super-secret-jwt-key-cse412-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Default Admin Credentials for initial setup
    ADMIN_DEFAULT_USERNAME: str = os.getenv("ADMIN_DEFAULT_USERNAME", "admin")
    ADMIN_DEFAULT_PASSWORD: str = os.getenv("ADMIN_DEFAULT_PASSWORD", "Admin123!")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# Normalize PostgreSQL driver for SQLAlchemy if needed
def get_db_url() -> str:
    url = settings.DATABASE_URL
    # Supabase provides postgres:// or postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+psycopg2://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url
