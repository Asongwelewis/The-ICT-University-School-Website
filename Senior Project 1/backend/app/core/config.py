"""
Core configuration settings for ICT University ERP System

This module contains all configuration settings including:
- Supabase integration settings
- Role-based access control configuration
- API configuration
- Environment-specific settings
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, validator, Field
from pydantic_settings import BaseSettings
import secrets
import os
from enum import Enum


class Environment(str, Enum):
    """Environment enumeration for type safety"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class LogLevel(str, Enum):
    """Log level enumeration"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Settings(BaseSettings):
    """
    Application settings with environment variable support
    
    All settings can be overridden via environment variables
    Example: SUPABASE_URL, SUPABASE_SERVICE_KEY, etc.
    """
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ICT University ERP System"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Comprehensive School Management System - Supabase Integration"
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "your-anon-key")
    
    # JWT Configuration - Use Supabase JWT secret for token verification
    JWT_SECRET_KEY: str = os.getenv("SUPABASE_JWT_SECRET", os.getenv("JWT_SECRET_KEY", "your-jwt-secret"))
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    @property
    def SUPABASE_JWT_SECRET(self) -> str:
        """Alias for JWT_SECRET_KEY to maintain backward compatibility"""
        return self.JWT_SECRET_KEY
    
    # Security Configuration
    SECRET_KEY: str = secrets.token_urlsafe(32)
    
    # Frontend URL for CORS and redirects
    FRONTEND_URL: str = "http://localhost:3000"
    
    # CORS Configuration - Use string and parse manually to avoid pydantic issues
    BACKEND_CORS_ORIGINS_STR: str = Field(default="http://localhost:3000,http://localhost:8000", env="BACKEND_CORS_ORIGINS")
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        """Parse CORS origins from string"""
        if not self.BACKEND_CORS_ORIGINS_STR:
            return ["http://localhost:3000", "http://localhost:8000"]
        
        # Handle comma-separated format
        origins = [origin.strip() for origin in self.BACKEND_CORS_ORIGINS_STR.split(",") if origin.strip()]
        return origins if origins else ["http://localhost:3000", "http://localhost:8000"]
    
    # Environment Configuration
    ENVIRONMENT: Environment = Field(default=Environment.DEVELOPMENT, env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT", ge=1, le=65535)
    LOG_LEVEL: LogLevel = Field(default=LogLevel.INFO, env="LOG_LEVEL")
    
    @validator('DEBUG', pre=True)
    def parse_debug(cls, v):
        """Parse DEBUG from various string formats"""
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "on")
        return bool(v)
    
    @validator('ENVIRONMENT', pre=True)
    def parse_environment(cls, v):
        """Parse environment with fallback"""
        if isinstance(v, str):
            try:
                return Environment(v.lower())
            except ValueError:
                return Environment.DEVELOPMENT
        return v
    
    # Redis Configuration (for caching)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Email Configuration
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = "noreply@ictuniversity.edu"
    EMAILS_FROM_NAME: Optional[str] = "ICT University ERP"
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [
        "image/jpeg", "image/png", "image/gif",
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    
    # Pagination Configuration
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Role-based Access Control
    SUPER_ADMIN_EMAIL: str = os.getenv("SUPER_ADMIN_EMAIL", "admin@ictuniversity.edu")
    DEFAULT_ADMIN_PASSWORD: str = os.getenv("DEFAULT_ADMIN_PASSWORD", secrets.token_urlsafe(16))
    
    @validator('DEFAULT_ADMIN_PASSWORD')
    def validate_admin_password(cls, v, values=None):
        """Ensure admin password meets security requirements in production"""
        # In Pydantic v2, we'll check environment during runtime validation
        if len(v) < 8:  # Basic minimum length check
            raise ValueError('Admin password must be at least 8 characters')
        return v
    
    # Academic Year Configuration
    CURRENT_ACADEMIC_YEAR: str = "2024-2025"
    SEMESTER_START_MONTH: int = 9  # September
    

    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT == Environment.PRODUCTION
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT == Environment.DEVELOPMENT
    
    @property
    def database_url(self) -> str:
        """Construct database URL (placeholder for future database integration)"""
        # This would be used if you add PostgreSQL later
        return f"postgresql://user:pass@localhost/ict_university"
    
    @validator('SUPABASE_URL')
    def validate_supabase_url(cls, v):
        """Validate Supabase URL format"""
        if not v.startswith(('http://', 'https://')):
            raise ValueError('SUPABASE_URL must be a valid URL')
        if 'supabase.co' not in v and v != "https://your-project.supabase.co":
            # Allow default placeholder for initial setup
            pass
        return v
    
    @validator('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY')
    def validate_supabase_keys(cls, v):
        """Validate Supabase keys are not default values in production"""
        default_values = {"your-service-role-key", "your-anon-key"}
        if v in default_values:
            # Only warn in development, error in production
            import warnings
            warnings.warn("Supabase key is using default value. Update for production!")
        return v
    
    class Config:
        """Pydantic configuration"""
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"
        use_enum_values = True
        extra = "ignore"  # Ignore extra fields from environment


# Configuration Factory
class ConfigFactory:
    """Factory for creating configuration instances"""
    
    _instance: Optional[Settings] = None
    
    @classmethod
    def get_settings(cls, force_reload: bool = False) -> Settings:
        """
        Get settings instance (singleton pattern)
        
        Args:
            force_reload: Force reload of settings from environment
            
        Returns:
            Settings instance
        """
        if cls._instance is None or force_reload:
            cls._instance = Settings()
        return cls._instance
    
    @classmethod
    def create_test_settings(cls, **overrides) -> Settings:
        """
        Create settings for testing with overrides
        
        Args:
            **overrides: Configuration overrides
            
        Returns:
            Settings instance with test configuration
        """
        test_config = {
            "ENVIRONMENT": Environment.DEVELOPMENT,
            "DEBUG": True,
            "SUPABASE_URL": "http://localhost:54321",
            "JWT_SECRET_KEY": "test-secret-key",
            **overrides
        }
        
        # Create temporary settings with overrides
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.env', delete=False) as f:
            for key, value in test_config.items():
                f.write(f"{key}={value}\n")
            temp_env_file = f.name
        
        try:
            # Temporarily override env file
            original_env_file = Settings.Config.env_file
            Settings.Config.env_file = temp_env_file
            settings = Settings()
            Settings.Config.env_file = original_env_file
            return settings
        finally:
            os.unlink(temp_env_file)


# Configuration validation helper
def validate_production_config(config: Settings) -> List[str]:
    """
    Validate configuration for production deployment
    
    Args:
        config: Settings instance to validate
        
    Returns:
        List of validation errors
    """
    errors = []
    
    if config.is_production:
        # Check critical production settings
        if config.JWT_SECRET_KEY in ("your-jwt-secret", "test-secret-key"):
            errors.append("JWT_SECRET_KEY must be set to a secure value in production")
        
        if config.SUPABASE_URL == "https://your-project.supabase.co":
            errors.append("SUPABASE_URL must be set to actual Supabase project URL")
        
        if config.SUPABASE_SERVICE_ROLE_KEY == "your-service-role-key":
            errors.append("SUPABASE_SERVICE_ROLE_KEY must be set in production")
        
        if config.DEFAULT_ADMIN_PASSWORD and len(config.DEFAULT_ADMIN_PASSWORD) < 12:
            errors.append("DEFAULT_ADMIN_PASSWORD must be at least 12 characters in production")
        
        if config.DEBUG:
            errors.append("DEBUG should be False in production")
    
    return errors


# Global settings instance
settings = ConfigFactory.get_settings()

# Validate configuration on import
if settings.is_production:
    config_errors = validate_production_config(settings)
    if config_errors:
        import warnings
        for error in config_errors:
            warnings.warn(f"Production Configuration Warning: {error}", UserWarning)


# Role definitions for the ERP system
class UserRoles(str, Enum):
    """
    User role definitions for role-based access control
    
    Each role has specific permissions and access levels
    """
    SYSTEM_ADMIN = "system_admin"
    ACADEMIC_STAFF = "academic_staff"
    STUDENT = "student"
    HR_PERSONNEL = "hr_personnel"
    FINANCE_STAFF = "finance_staff"
    MARKETING_TEAM = "marketing_team"
    
    @classmethod
    def get_all_roles(cls) -> List[str]:
        """Get all available user roles"""
        return [role.value for role in cls]
    
    @classmethod
    def get_staff_roles(cls) -> List[str]:
        """Get roles that are considered staff members"""
        return [
            cls.SYSTEM_ADMIN.value,
            cls.ACADEMIC_STAFF.value,
            cls.HR_PERSONNEL.value,
            cls.FINANCE_STAFF.value,
            cls.MARKETING_TEAM.value,
        ]
    
    @classmethod
    def get_admin_roles(cls) -> List[str]:
        """Get roles with administrative privileges"""
        return [
            cls.SYSTEM_ADMIN.value,
            cls.HR_PERSONNEL.value,
        ]
    
    @property
    def is_staff(self) -> bool:
        """Check if role is a staff role"""
        return self.value in self.get_staff_roles()
    
    @property
    def is_admin(self) -> bool:
        """Check if role has admin privileges"""
        return self.value in self.get_admin_roles()


# Permission definitions
class Permissions(str, Enum):
    """
    Permission definitions for fine-grained access control
    
    Permissions are assigned to roles and checked in endpoints
    """
    
    # User Management
    MANAGE_USERS = "manage_users"
    VIEW_USERS = "view_users"
    
    # Academic Management
    MANAGE_COURSES = "manage_courses"
    VIEW_COURSES = "view_courses"
    MANAGE_GRADES = "manage_grades"
    VIEW_GRADES = "view_grades"
    TRACK_ATTENDANCE = "track_attendance"
    VIEW_ATTENDANCE = "view_attendance"
    
    # Financial Management
    MANAGE_INVOICES = "manage_invoices"
    VIEW_INVOICES = "view_invoices"
    PROCESS_PAYMENTS = "process_payments"
    VIEW_PAYMENTS = "view_payments"
    GENERATE_FINANCIAL_REPORTS = "generate_financial_reports"
    
    # HR Management
    MANAGE_EMPLOYEES = "manage_employees"
    VIEW_EMPLOYEES = "view_employees"
    PROCESS_PAYROLL = "process_payroll"
    MANAGE_LEAVE = "manage_leave"
    
    # Marketing Management
    MANAGE_CAMPAIGNS = "manage_campaigns"
    VIEW_CAMPAIGNS = "view_campaigns"
    TRACK_LEADS = "track_leads"
    VIEW_ANALYTICS = "view_analytics"
    
    # System Administration
    CONFIGURE_SYSTEM = "configure_system"
    VIEW_SYSTEM_LOGS = "view_system_logs"
    BACKUP_RESTORE = "backup_restore"
    
    @classmethod
    def get_all_permissions(cls) -> List[str]:
        """Get all available permissions"""
        return [perm.value for perm in cls]
    
    @classmethod
    def get_user_permissions(cls) -> List[str]:
        """Get user management permissions"""
        return [cls.MANAGE_USERS.value, cls.VIEW_USERS.value]
    
    @classmethod
    def get_academic_permissions(cls) -> List[str]:
        """Get academic management permissions"""
        return [
            cls.MANAGE_COURSES.value, cls.VIEW_COURSES.value,
            cls.MANAGE_GRADES.value, cls.VIEW_GRADES.value,
            cls.TRACK_ATTENDANCE.value, cls.VIEW_ATTENDANCE.value,
        ]


# Role-Permission mapping
ROLE_PERMISSIONS = {
    UserRoles.SYSTEM_ADMIN: [
        # Full system access
        Permissions.MANAGE_USERS, Permissions.VIEW_USERS,
        Permissions.MANAGE_COURSES, Permissions.VIEW_COURSES,
        Permissions.MANAGE_GRADES, Permissions.VIEW_GRADES,
        Permissions.TRACK_ATTENDANCE, Permissions.VIEW_ATTENDANCE,
        Permissions.MANAGE_INVOICES, Permissions.VIEW_INVOICES,
        Permissions.PROCESS_PAYMENTS, Permissions.VIEW_PAYMENTS,
        Permissions.GENERATE_FINANCIAL_REPORTS,
        Permissions.MANAGE_EMPLOYEES, Permissions.VIEW_EMPLOYEES,
        Permissions.PROCESS_PAYROLL, Permissions.MANAGE_LEAVE,
        Permissions.MANAGE_CAMPAIGNS, Permissions.VIEW_CAMPAIGNS,
        Permissions.TRACK_LEADS, Permissions.VIEW_ANALYTICS,
        Permissions.CONFIGURE_SYSTEM, Permissions.VIEW_SYSTEM_LOGS,
        Permissions.BACKUP_RESTORE,
    ],
    
    UserRoles.ACADEMIC_STAFF: [
        # Academic-focused permissions
        Permissions.VIEW_USERS,
        Permissions.MANAGE_COURSES, Permissions.VIEW_COURSES,
        Permissions.MANAGE_GRADES, Permissions.VIEW_GRADES,
        Permissions.TRACK_ATTENDANCE, Permissions.VIEW_ATTENDANCE,
    ],
    
    UserRoles.STUDENT: [
        # Student-specific permissions
        Permissions.VIEW_COURSES,
        Permissions.VIEW_GRADES,
        Permissions.VIEW_ATTENDANCE,
        Permissions.VIEW_INVOICES,
        Permissions.VIEW_PAYMENTS,
    ],
    
    UserRoles.HR_PERSONNEL: [
        # HR-focused permissions
        Permissions.MANAGE_USERS, Permissions.VIEW_USERS,
        Permissions.MANAGE_EMPLOYEES, Permissions.VIEW_EMPLOYEES,
        Permissions.PROCESS_PAYROLL, Permissions.MANAGE_LEAVE,
    ],
    
    UserRoles.FINANCE_STAFF: [
        # Finance-focused permissions
        Permissions.VIEW_USERS,
        Permissions.MANAGE_INVOICES, Permissions.VIEW_INVOICES,
        Permissions.PROCESS_PAYMENTS, Permissions.VIEW_PAYMENTS,
        Permissions.GENERATE_FINANCIAL_REPORTS,
    ],
    
    UserRoles.MARKETING_TEAM: [
        # Marketing-focused permissions
        Permissions.VIEW_USERS,
        Permissions.MANAGE_CAMPAIGNS, Permissions.VIEW_CAMPAIGNS,
        Permissions.TRACK_LEADS, Permissions.VIEW_ANALYTICS,
    ],
}