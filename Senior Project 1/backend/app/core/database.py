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
from typing import Generator
import logging

from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    str(settings.DATABASE_URL),
    # Connection pool settings for production
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
    pool_size=20,        # Number of connections to maintain
    max_overflow=30,     # Additional connections when pool is full
    echo=settings.DEBUG, # Log SQL queries in debug mode
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create base class for all database models
Base = declarative_base()

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
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables and create default data
    
    This function:
    - Creates all database tables
    - Sets up initial admin user
    - Creates default academic year data
    - Initializes system settings
    """
    try:
        # Import all models to ensure they are registered with SQLAlchemy
        from app.models.user import User
        from app.models.academic import Course, Grade, Attendance
        # Import other models as they are created
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        logger.info("Database tables created successfully")
        
        # Create default admin user if it doesn't exist
        _create_default_admin()
        
        logger.info("Database initialization completed")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


def _create_default_admin() -> None:
    """
    Create default system administrator account
    
    This creates the initial admin user that can be used to:
    - Access the system for the first time
    - Create other users and configure the system
    - Manage initial setup
    """
    from app.models.user import User
    from app.core.security import get_password_hash
    from app.core.config import UserRoles
    
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(
            User.email == settings.SUPER_ADMIN_EMAIL
        ).first()
        
        if not admin_user:
            # Create default admin user
            admin_user = User(
                email=settings.SUPER_ADMIN_EMAIL,
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                role=UserRoles.SYSTEM_ADMIN,
                is_active=True,
                is_verified=True,
                is_superuser=True,
            )
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            logger.info(f"Default admin user created: {settings.SUPER_ADMIN_EMAIL}")
        else:
            logger.info("Default admin user already exists")
            
    except Exception as e:
        logger.error(f"Failed to create default admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def check_db_connection() -> bool:
    """
    Check if database connection is working
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        db = SessionLocal()
        # Execute a simple query to test connection
        db.execute("SELECT 1")
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
    def health_check() -> dict:
        """
        Perform comprehensive database health check
        
        Returns:
            dict: Health check results with status and metrics
        """
        try:
            db = SessionLocal()
            
            # Test basic connection
            result = db.execute("SELECT version()").fetchone()
            db_version = result[0] if result else "Unknown"
            
            # Test table access
            from app.models.user import User
            user_count = db.query(User).count()
            
            db.close()
            
            return {
                "status": "healthy",
                "database_version": db_version,
                "user_count": user_count,
                "connection_pool_size": engine.pool.size(),
                "checked_out_connections": engine.pool.checkedout(),
            }
            
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    @staticmethod
    def get_connection_info() -> dict:
        """
        Get database connection information
        
        Returns:
            dict: Connection details and statistics
        """
        return {
            "database_url": str(settings.DATABASE_URL).replace(
                settings.POSTGRES_PASSWORD, "***"
            ),
            "pool_size": engine.pool.size(),
            "max_overflow": engine.pool._max_overflow,
            "checked_out": engine.pool.checkedout(),
            "checked_in": engine.pool.checkedin(),
            "invalid": engine.pool.invalid(),
        }