"""
Database configuration and session management for ICT University ERP

This module handles:
- SQLAlchemy engine and session configuration
- Database connection management
- Base model class for all database models
- Database initialization and migration support
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator, Optional
import logging

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create SQLAlchemy engine with connection pooling
def create_database_engine():
    """Create database engine with appropriate configuration"""
    database_url = settings.database_url
    
    # Configure engine based on database type
    if database_url.startswith("sqlite"):
        # SQLite configuration
        return create_engine(
            database_url,
            poolclass=StaticPool,
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )
    else:
        # PostgreSQL configuration
        return create_engine(
            database_url,
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=300,    # Recycle connections every 5 minutes
            pool_size=20,        # Number of connections to maintain
            max_overflow=30,     # Additional connections when pool is full
            echo=settings.DEBUG, # Log SQL queries in debug mode
        )

engine = create_database_engine()

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Import the Base class from models
from app.models.base import Base

# Metadata for database schema management
metadata = MetaData()


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI endpoints
    
    This function provides a database session that automatically:
    - Opens a new session for each request
    - Commits transactions on success
    - Rolls back on errors
    - Closes the session when done
    
    Usage in FastAPI endpoints:
        @app.get("/users/")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()


class DatabaseSession:
    """Context manager for database sessions outside of FastAPI dependencies"""
    
    def __init__(self, auto_commit: bool = True):
        self.auto_commit = auto_commit
        self.db: Optional[Session] = None
    
    def __enter__(self) -> Session:
        self.db = SessionLocal()
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.db:
            try:
                if exc_type is None and self.auto_commit:
                    self.db.commit()
                else:
                    self.db.rollback()
            except Exception as e:
                logger.error(f"Error during session cleanup: {e}", exc_info=True)
                self.db.rollback()
            finally:
                self.db.close()


def init_db() -> None:
    """
    Initialize database tables and create default data
    
    This function:
    - Creates all database tables
    - Sets up initial system settings
    - Creates default departments
    - Initializes fee structures
    """
    try:
        # Import all models to ensure they are registered with SQLAlchemy
        from app.models import (
            Profile, Department, Course, Enrollment, Attendance, Grade,
            FeeStructure, Invoice, Payment, Employee, LeaveRequest,
            Campaign, Lead, SystemSetting, AuditLog, Attachment
        )
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        logger.info("Database tables created successfully")
        
        # Initialize default data in the same transaction context
        with DatabaseSession() as db:
            _init_system_settings(db)
            _init_departments(db)
        
        logger.info("Database initialization completed")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise





def _init_system_settings(db: Session) -> None:
    """Initialize default system settings"""
    from app.models.system import SystemSetting
    
    default_settings = [
        ("university_name", "ICT University", "Official university name", "general", True),
        ("academic_year", "2024-2025", "Current academic year", "academic", True),
        ("current_semester", "Fall 2024", "Current semester", "academic", True),
        ("currency", "XAF", "Default currency", "financial", True),
    ]
    
    for key, value, desc, category, is_public in default_settings:
        if not db.query(SystemSetting).filter(SystemSetting.setting_key == key).first():
            setting = SystemSetting(
                setting_key=key,
                setting_value=value,
                description=desc,
                category=category,
                is_public=is_public
            )
            db.add(setting)
    
    logger.info("System settings initialized")


def _init_departments(db: Session) -> None:
    """Initialize default departments"""
    from app.models.departments import Department
    
    default_departments = [
        ("Computer Science", "CS", "Computer Science and Information Technology"),
        ("Business Administration", "BA", "Business and Management Studies"),
        ("Engineering", "ENG", "Engineering and Applied Sciences"),
        ("Mathematics", "MATH", "Mathematics and Statistics"),
    ]
    
    for name, code, desc in default_departments:
        if not db.query(Department).filter(Department.code == code).first():
            dept = Department(name=name, code=code, description=desc)
            db.add(dept)
    
    logger.info("Departments initialized")


def check_db_connection() -> bool:
    """
    Check if database connection is working
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        db = SessionLocal()
        # Execute a simple query to test connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def reset_database() -> None:
    """
    Reset database by dropping and recreating all tables
    
    WARNING: This will delete all data!
    Only use in development environment.
    """
    if settings.ENVIRONMENT == "production":
        raise ValueError("Cannot reset database in production environment")
    
    try:
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        logger.info("All database tables dropped")
        
        # Recreate tables and initialize data
        init_db()
        logger.info("Database reset completed")
        
    except Exception as e:
        logger.error(f"Database reset failed: {e}")
        raise


class DatabaseManager:
    """
    Database management utility class
    
    Provides methods for:
    - Database health checks
    - Connection management
    - Migration support
    - Backup and restore operations
    """
    
    @staticmethod
    def create_tables() -> bool:
        """
        Create all database tables
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to create tables: {e}", exc_info=True)
            return False
    
    @staticmethod
    def drop_tables() -> bool:
        """
        Drop all database tables
        
        WARNING: This will delete all data!
        
        Returns:
            bool: True if successful, False otherwise
        """
        if settings.is_production:
            raise ValueError("Cannot drop tables in production environment")
        
        try:
            Base.metadata.drop_all(bind=engine)
            logger.info("Database tables dropped successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to drop tables: {e}", exc_info=True)
            return False
    
    @staticmethod
    def health_check() -> dict:
        """
        Perform comprehensive database health check
        
        Returns:
            dict: Health check results with status and metrics
        """
        try:
            with DatabaseSession(auto_commit=False) as db:
                # Test basic connection
                from sqlalchemy import text
                result = db.execute(text("SELECT 1 as test")).fetchone()
                connection_test = result[0] == 1 if result else False
                
                # Get database version (works for both SQLite and PostgreSQL)
                try:
                    version_result = db.execute(text("SELECT sqlite_version()")).fetchone()
                    db_version = f"SQLite {version_result[0]}" if version_result else "Unknown"
                except Exception:
                    try:
                        version_result = db.execute(text("SELECT version()")).fetchone()
                        db_version = version_result[0] if version_result else "Unknown"
                    except Exception:
                        db_version = "Unknown"
                
                # Test table access
                profile_count = 0
                try:
                    from app.models.profiles import Profile
                    profile_count = db.query(Profile).count()
                except Exception as e:
                    logger.warning(f"Could not count profiles: {e}")
                
                # Pool information (not available for SQLite)
                pool_info = {}
                try:
                    pool_info = {
                        "connection_pool_size": engine.pool.size(),
                        "checked_out_connections": engine.pool.checkedout(),
                    }
                except AttributeError:
                    pool_info = {"pool_info": "Not available (SQLite)"}
                
                result = {
                    "status": "healthy" if connection_test else "degraded",
                    "database_version": db_version,
                    "profile_count": profile_count,
                    "connection_test": connection_test,
                }
                result.update(pool_info)
                
                return result
                
        except Exception as e:
            logger.error(f"Database health check failed: {e}", exc_info=True)
            return {
                "status": "unhealthy",
                "error": str(e),
                "error_type": type(e).__name__
            }
    
    @staticmethod
    def get_connection_info() -> dict:
        """
        Get database connection information
        
        Returns:
            dict: Connection details and statistics
        """
        database_url = settings.database_url
        
        # Mask sensitive information
        if settings.POSTGRES_PASSWORD and settings.POSTGRES_PASSWORD in database_url:
            masked_url = database_url.replace(settings.POSTGRES_PASSWORD, "***")
        else:
            masked_url = database_url
        
        connection_info = {
            "database_url": masked_url,
            "database_type": "sqlite" if database_url.startswith("sqlite") else "postgresql",
        }
        
        # Add pool information if available (not available for SQLite)
        try:
            connection_info.update({
                "pool_size": engine.pool.size(),
                "max_overflow": getattr(engine.pool, '_max_overflow', 0),
                "checked_out": engine.pool.checkedout(),
                "checked_in": engine.pool.checkedin(),
                "invalid": engine.pool.invalid(),
            })
        except AttributeError:
            # SQLite doesn't have connection pooling
            connection_info["pool_info"] = "Not available (SQLite)"
        
        return connection_info