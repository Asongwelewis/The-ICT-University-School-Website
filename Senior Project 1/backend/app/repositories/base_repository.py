"""
Base repository class with common CRUD operations.
"""
from typing import Generic, TypeVar, Type, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_, or_, desc, asc
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations."""
    
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    def create(self, obj_data: Dict[str, Any]) -> ModelType:
        """
        Create a new record.
        
        Args:
            obj_data: Dictionary of field values
            
        Returns:
            Created model instance
            
        Raises:
            IntegrityError: If database constraints are violated
        """
        try:
            db_obj = self.model(**obj_data)
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except IntegrityError:
            self.db.rollback()
            raise
    
    def get_by_id(self, obj_id: Any) -> Optional[ModelType]:
        """Get record by ID."""
        return self.db.query(self.model).filter(self.model.id == obj_id).first()
    
    def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        order_desc: bool = False
    ) -> List[ModelType]:
        """
        Get all records with optional filtering, pagination, and sorting.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Dictionary of field filters
            order_by: Field name to order by
            order_desc: Whether to order in descending order
            
        Returns:
            List of model instances
        """
        query = self.db.query(self.model)
        
        # Apply filters
        if filters:
            filter_conditions = []
            for field, value in filters.items():
                if hasattr(self.model, field):
                    if isinstance(value, list):
                        # Handle IN queries
                        filter_conditions.append(getattr(self.model, field).in_(value))
                    elif isinstance(value, dict) and 'like' in value:
                        # Handle LIKE queries
                        filter_conditions.append(getattr(self.model, field).like(f"%{value['like']}%"))
                    else:
                        filter_conditions.append(getattr(self.model, field) == value)
            
            if filter_conditions:
                query = query.filter(and_(*filter_conditions))
        
        # Apply ordering
        if order_by and hasattr(self.model, order_by):
            order_field = getattr(self.model, order_by)
            query = query.order_by(desc(order_field) if order_desc else asc(order_field))
        
        return query.offset(skip).limit(limit).all()
    
    def update(self, obj_id: Any, update_data: Dict[str, Any]) -> Optional[ModelType]:
        """
        Update a record.
        
        Args:
            obj_id: ID of the record to update
            update_data: Dictionary of fields to update
            
        Returns:
            Updated model instance or None if not found
        """
        try:
            db_obj = self.get_by_id(obj_id)
            if not db_obj:
                return None
            
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except IntegrityError:
            self.db.rollback()
            raise
    
    def delete(self, obj_id: Any) -> bool:
        """
        Delete a record.
        
        Args:
            obj_id: ID of the record to delete
            
        Returns:
            True if deleted, False if not found
        """
        db_obj = self.get_by_id(obj_id)
        if not db_obj:
            return False
        
        self.db.delete(db_obj)
        self.db.commit()
        return True
    
    def soft_delete(self, obj_id: Any) -> bool:
        """
        Soft delete a record (set is_active to False).
        
        Args:
            obj_id: ID of the record to soft delete
            
        Returns:
            True if soft deleted, False if not found
        """
        if hasattr(self.model, 'is_active'):
            return self.update(obj_id, {'is_active': False}) is not None
        return False
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records with optional filtering.
        
        Args:
            filters: Dictionary of field filters
            
        Returns:
            Number of matching records
        """
        query = self.db.query(self.model)
        
        if filters:
            filter_conditions = []
            for field, value in filters.items():
                if hasattr(self.model, field):
                    if isinstance(value, list):
                        filter_conditions.append(getattr(self.model, field).in_(value))
                    elif isinstance(value, dict) and 'like' in value:
                        filter_conditions.append(getattr(self.model, field).like(f"%{value['like']}%"))
                    else:
                        filter_conditions.append(getattr(self.model, field) == value)
            
            if filter_conditions:
                query = query.filter(and_(*filter_conditions))
        
        return query.count()
    
    def bulk_create(self, objects_data: List[Dict[str, Any]]) -> List[ModelType]:
        """
        Create multiple records in bulk.
        
        Args:
            objects_data: List of dictionaries with field values
            
        Returns:
            List of created model instances
        """
        try:
            db_objects = [self.model(**obj_data) for obj_data in objects_data]
            self.db.add_all(db_objects)
            self.db.commit()
            
            # Refresh all objects to get generated IDs
            for obj in db_objects:
                self.db.refresh(obj)
            
            return db_objects
        except IntegrityError:
            self.db.rollback()
            raise