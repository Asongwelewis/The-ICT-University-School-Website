"""
Base repository class with common CRUD operations.
"""

from typing import Generic, TypeVar, Type, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from uuid import UUID

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    """Base repository class with common database operations."""
    
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new record."""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def get(self, id: UUID) -> Optional[ModelType]:
        """Get a record by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """Get multiple records with pagination and filtering."""
        query = self.db.query(self.model)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)
        
        return query.offset(skip).limit(limit).all()
    
    def update(self, id: UUID, obj_in: Dict[str, Any]) -> Optional[ModelType]:
        """Update a record by ID."""
        db_obj = self.get(id)
        if db_obj:
            for key, value in obj_in.items():
                if hasattr(db_obj, key):
                    setattr(db_obj, key, value)
            self.db.commit()
            self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, id: UUID) -> bool:
        """Delete a record by ID."""
        db_obj = self.get(id)
        if db_obj:
            self.db.delete(db_obj)
            self.db.commit()
            return True
        return False
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count records with optional filtering."""
        query = self.db.query(self.model)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.filter(getattr(self.model, key) == value)
        
        return query.count()
    
    def exists(self, id: UUID) -> bool:
        """Check if a record exists by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first() is not None
    
    def get_by_field(self, field: str, value: Any) -> Optional[ModelType]:
        """Get a record by a specific field."""
        if hasattr(self.model, field):
            return self.db.query(self.model).filter(getattr(self.model, field) == value).first()
        return None
    
    def get_multi_by_field(self, field: str, value: Any) -> List[ModelType]:
        """Get multiple records by a specific field."""
        if hasattr(self.model, field):
            return self.db.query(self.model).filter(getattr(self.model, field) == value).all()
        return []