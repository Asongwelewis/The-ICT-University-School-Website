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
    JWT_ALGORITHM: str = "HS256"  # For backward compatibility
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=5, le=1440)  # 5 min to 24 hours
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql://user:password@localhost/school_erp",
        description="PostgreSQL database connection URL"
    )
    SUPABASE_URL: Optional[str] = Field(default=None, description="Supabase project URL")
    SUPABASE_KEY: Optional[str] = Field(default=None, description="Supabase service role key")
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None, description="Supabase anonymous key")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(default=None, description="Supabase service role key")
    SUPABASE_JWT_SECRET: Optional[str] = Field(default=None, description="Supabase JWT secret")
    
    # Redis Configuration
    REDIS_URL: str = Field(
        default="redis://localhost:6379",
        description="Redis connection URL for caching"
    )
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    # Development Configuration
    DEBUG: bool = Field(default=False, description="Enable debug mode")
    HOST: str = Field(default="127.0.0.1", description="Host to bind the server to")
    PORT: int = Field(default=8000, description="Port to bind the server to")

    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as a list."""
        if not self.BACKEND_CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """Ensure secret key is secure in production."""
        environment = info.data.get("ENVIRONMENT", "development")
        
        if environment == "production":
            if not v or len(v) < 32:
                raise ValueError(
                    "SECRET_KEY must be set to a secure value in production (min 32 characters)"
                )
            # Check for common insecure patterns
            insecure_patterns = [
                "your-secret-key",
                "change-me",
                "secret",
                "password",
                "123456"
            ]
            if any(pattern in v.lower() for pattern in insecure_patterns):
                raise ValueError(
                    "SECRET_KEY appears to use an insecure pattern. Use a cryptographically secure random string."
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
        extra = "ignore"  # Allow extra environment variables


# Global settings instance
settings = Settings()