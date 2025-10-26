"""
Database initialization and seeding.
"""

from sqlalchemy.orm import Session
from app.core.database import engine
from app.models import Base
import logging

logger = logging.getLogger(__name__)


def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def init_database():
    """Initialize database with default data."""
    try:
        logger.info("Starting database initialization...")
        create_tables()
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_database()