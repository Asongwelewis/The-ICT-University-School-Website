"""
Configuration settings for the School ERP API.

This module handles all application configuration including database connections,
security settings, and environment-specific variables.
"""
import secrets
from typing import List, Union, Optional
from pydantic import AnyHttpUrl, field_validator, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with validation and security best practices."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "School ERP API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="Environment: development, staging, production")
    
    # Security Configuration
    SECRET_KEY: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        description="Secret key for JWT token signing. Must be set in production!"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=5, le=1440)  # 5 min to 24 hours
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost/school_erp",
        description="PostgreSQL database connection URL"
    )
    SUPABASE_URL: Optional[str] = Field(default=None, description="Supabase project URL")
    SUPABASE_KEY: Optional[str] = Field(default=None, description="Supabase service role key")
    
    # Redis Configuration
    REDIS_URL: str = Field(
        default="redis://localhost:6379",
        description="Redis connection URL for caching"
    )
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = Field(
        default_factory=list,
        description="List of allowed CORS origins"
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS origins from string or list format."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(f"Invalid CORS origins format: {v}")

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """Ensure secret key is secure in production."""
        if info.data.get("ENVIRONMENT") == "production":
            if v == "your-secret-key-change-in-production" or len(v) < 32:
                raise ValueError(
                    "SECRET_KEY must be set to a secure value in production (min 32 characters)"
                )
        return v

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate database URL format."""
        if not v.startswith(("postgresql://", "postgresql+asyncpg://")):
            raise ValueError("DATABASE_URL must be a valid PostgreSQL connection string")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "forbid"  # Prevent typos in environment variables


# Global settings instance
settings = Settings()