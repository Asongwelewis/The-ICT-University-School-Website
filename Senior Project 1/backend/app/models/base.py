"""
Base model class with common functionality.

This module provides the foundation for all database models including:
- Base declarative class
- Common mixins for timestamps and UUIDs
- Utility methods for model operations
"""

from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy import Column, DateTime, func, inspect
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Session
import uuid
import logging

logger = logging.getLogger(__name__)

# Create the declarative base
Base = declarative_base()


class TimestampMixin:
    """
    Mixin to add created_at and updated_at timestamps.
    
    Automatically manages creation and update timestamps for all models.
    """
    
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False,
        doc="Timestamp when the record was created"
    )
    updated_at = Column(
        DateTime(timezone=True), 
        onupdate=func.now(),
        doc="Timestamp when the record was last updated"
    )


class UUIDMixin:
    """
    Mixin to add UUID primary key.
    
    Provides a UUID-based primary key for all models.
    """
    
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4,
        doc="Unique identifier for the record"
    )


class AuditMixin:
    """
    Mixin to add audit trail functionality.
    
    Tracks who created and last modified records.
    """
    
    @declared_attr
    def created_by(cls):
        return Column(
            UUID(as_uuid=True),
            doc="ID of the user who created this record"
        )
    
    @declared_attr  
    def updated_by(cls):
        return Column(
            UUID(as_uuid=True),
            doc="ID of the user who last updated this record"
        )


class SoftDeleteMixin:
    """
    Mixin to add soft delete functionality.
    
    Allows marking records as deleted without actually removing them.
    """
    
    deleted_at = Column(
        DateTime(timezone=True),
        nullable=True,
        doc="Timestamp when the record was soft deleted"
    )
    
    @property
    def is_deleted(self) -> bool:
        """Check if the record is soft deleted."""
        return self.deleted_at is not None
    
    def soft_delete(self, user_id: Optional[str] = None) -> None:
        """Mark the record as deleted."""
        self.deleted_at = datetime.utcnow()
        if hasattr(self, 'updated_by') and user_id:
            self.updated_by = user_id
    
    def restore(self, user_id: Optional[str] = None) -> None:
        """Restore a soft deleted record."""
        self.deleted_at = None
        if hasattr(self, 'updated_by') and user_id:
            self.updated_by = user_id


class BaseModel(Base, UUIDMixin, TimestampMixin):
    """
    Base model class with UUID and timestamps.
    
    Provides common functionality for all database models including:
    - UUID primary key
    - Automatic timestamps
    - Dictionary conversion
    - String representation
    - Common query methods
    """
    
    __abstract__ = True
    
    def to_dict(self, exclude_fields: Optional[list] = None) -> Dict[str, Any]:
        """
        Convert model instance to dictionary.
        
        Args:
            exclude_fields: List of field names to exclude from the dictionary
            
        Returns:
            Dictionary representation of the model
        """
        exclude_fields = exclude_fields or []
        
        result = {}
        for column in self.__table__.columns:
            if column.name not in exclude_fields:
                value = getattr(self, column.name)
                # Handle datetime serialization
                if isinstance(value, datetime):
                    result[column.name] = value.isoformat()
                # Handle UUID serialization
                elif isinstance(value, uuid.UUID):
                    result[column.name] = str(value)
                else:
                    result[column.name] = value
        
        return result
    
    def update_from_dict(self, data: Dict[str, Any], exclude_fields: Optional[list] = None) -> None:
        """
        Update model instance from dictionary.
        
        Args:
            data: Dictionary with field names and values
            exclude_fields: List of field names to exclude from update
        """
        exclude_fields = exclude_fields or ['id', 'created_at']
        
        for key, value in data.items():
            if key not in exclude_fields and hasattr(self, key):
                setattr(self, key, value)
    
    @classmethod
    def get_column_names(cls) -> list:
        """Get list of column names for the model."""
        return [column.name for column in cls.__table__.columns]
    
    @classmethod
    def get_relationships(cls) -> list:
        """Get list of relationship names for the model."""
        mapper = inspect(cls)
        return [rel.key for rel in mapper.relationships]
    
    def __repr__(self) -> str:
        """String representation of the model."""
        return f"<{self.__class__.__name__}(id={self.id})>"
    
    def __str__(self) -> str:
        """Human-readable string representation."""
        # Try to use common display fields
        for field in ['name', 'title', 'full_name', 'email']:
            if hasattr(self, field):
                value = getattr(self, field)
                if value:
                    return f"{self.__class__.__name__}: {value}"
        
        return self.__repr__()


class ActiveRecordMixin:
    """
    Mixin to add active record pattern methods.
    
    Provides convenient methods for common database operations.
    """
    
    def save(self, db: Session, commit: bool = True) -> 'BaseModel':
        """
        Save the model instance to the database.
        
        Args:
            db: Database session
            commit: Whether to commit the transaction
            
        Returns:
            The saved model instance
        """
        try:
            db.add(self)
            if commit:
                db.commit()
                db.refresh(self)
            return self
        except Exception as e:
            db.rollback()
            logger.error(f"Error saving {self.__class__.__name__}: {e}")
            raise
    
    def delete(self, db: Session, commit: bool = True) -> None:
        """
        Delete the model instance from the database.
        
        Args:
            db: Database session
            commit: Whether to commit the transaction
        """
        try:
            db.delete(self)
            if commit:
                db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting {self.__class__.__name__}: {e}")
            raise
    
    @classmethod
    def get_by_id(cls, db: Session, record_id: str) -> Optional['BaseModel']:
        """
        Get a record by its ID.
        
        Args:
            db: Database session
            record_id: The ID to search for
            
        Returns:
            The model instance or None if not found
        """
        try:
            return db.query(cls).filter(cls.id == record_id).first()
        except Exception as e:
            logger.error(f"Error getting {cls.__name__} by ID {record_id}: {e}")
            return None
    
    @classmethod
    def get_all(cls, db: Session, limit: Optional[int] = None) -> list:
        """
        Get all records of this model.
        
        Args:
            db: Database session
            limit: Maximum number of records to return
            
        Returns:
            List of model instances
        """
        try:
            query = db.query(cls)
            if limit:
                query = query.limit(limit)
            return query.all()
        except Exception as e:
            logger.error(f"Error getting all {cls.__name__} records: {e}")
            return []