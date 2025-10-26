"""
Model factory for creating and managing database models.

This module provides factory methods and utilities for creating
model instances with proper validation and default values.
"""

from typing import Dict, Any, Optional, Type, TypeVar
from sqlalchemy.orm import Session
from .base import BaseModel
from .profiles import Profile, UserRole
from .departments import Department

T = TypeVar('T', bound=BaseModel)


class ModelFactory:
    """
    Factory class for creating model instances with proper validation.
    
    Provides methods to create models with sensible defaults and validation,
    reducing boilerplate code and ensuring consistency.
    """
    
    @staticmethod
    def create_profile(
        email: str,
        full_name: str,
        role: str,
        **kwargs
    ) -> Profile:
        """
        Create a Profile instance with validation.
        
        Args:
            email: User email address
            full_name: User's full name
            role: User role in the system
            **kwargs: Additional profile fields
            
        Returns:
            Profile instance
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        # Validate required fields
        if not email or not full_name or not role:
            raise ValueError("Email, full_name, and role are required")
        
        # Validate role
        if role not in [r.value for r in UserRole]:
            raise ValueError(f"Invalid role: {role}")
        
        # Set role-specific defaults
        profile_data = {
            'email': email,
            'full_name': full_name,
            'role': role,
            'is_active': True,
            'email_notifications': True,
            'timezone': 'UTC',
            'language': 'en',
            **kwargs
        }
        
        # Validate role-specific requirements
        if role == UserRole.STUDENT.value and not profile_data.get('student_id'):
            raise ValueError("Student ID is required for student role")
        
        if role in UserRole.get_staff_roles() and not profile_data.get('employee_id'):
            raise ValueError("Employee ID is required for staff roles")
        
        return Profile(**profile_data)
    
    @staticmethod
    def create_student_profile(
        email: str,
        full_name: str,
        student_id: str,
        department: str,
        **kwargs
    ) -> Profile:
        """
        Create a student profile with proper defaults.
        
        Args:
            email: Student email
            full_name: Student's full name
            student_id: Unique student identifier
            department: Student's department
            **kwargs: Additional profile fields
            
        Returns:
            Profile instance for student
        """
        return ModelFactory.create_profile(
            email=email,
            full_name=full_name,
            role=UserRole.STUDENT.value,
            student_id=student_id,
            department=department,
            **kwargs
        )
    
    @staticmethod
    def create_staff_profile(
        email: str,
        full_name: str,
        role: str,
        employee_id: str,
        department: str,
        **kwargs
    ) -> Profile:
        """
        Create a staff profile with proper defaults.
        
        Args:
            email: Staff email
            full_name: Staff member's full name
            role: Staff role (must be a staff role)
            employee_id: Unique employee identifier
            department: Staff member's department
            **kwargs: Additional profile fields
            
        Returns:
            Profile instance for staff member
        """
        if role not in UserRole.get_staff_roles():
            raise ValueError(f"Role {role} is not a valid staff role")
        
        return ModelFactory.create_profile(
            email=email,
            full_name=full_name,
            role=role,
            employee_id=employee_id,
            department=department,
            **kwargs
        )
    
    @staticmethod
    def create_department(
        name: str,
        code: str,
        **kwargs
    ) -> Department:
        """
        Create a Department instance with validation.
        
        Args:
            name: Department name
            code: Department code
            **kwargs: Additional department fields
            
        Returns:
            Department instance
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        if not name or not code:
            raise ValueError("Name and code are required")
        
        department_data = {
            'name': name,
            'code': code,
            'is_active': True,
            'is_academic': True,
            **kwargs
        }
        
        return Department(**department_data)
    
    @staticmethod
    def create_academic_department(
        name: str,
        code: str,
        head_email: Optional[str] = None,
        **kwargs
    ) -> Department:
        """
        Create an academic department with proper defaults.
        
        Args:
            name: Department name
            code: Department code
            head_email: Email of department head (optional)
            **kwargs: Additional department fields
            
        Returns:
            Department instance for academic department
        """
        return ModelFactory.create_department(
            name=name,
            code=code,
            is_academic=True,
            **kwargs
        )


class ModelValidator:
    """
    Utility class for validating model data before creation.
    
    Provides validation methods that can be used independently
    of model creation to check data integrity.
    """
    
    @staticmethod
    def validate_profile_data(data: Dict[str, Any]) -> Dict[str, str]:
        """
        Validate profile data and return any errors.
        
        Args:
            data: Dictionary containing profile data
            
        Returns:
            Dictionary of field names to error messages
        """
        errors = {}
        
        # Required fields
        required_fields = ['email', 'full_name', 'role']
        for field in required_fields:
            if not data.get(field):
                errors[field] = f"{field} is required"
        
        # Email validation
        email = data.get('email', '')
        if email and '@' not in email:
            errors['email'] = "Invalid email format"
        
        # Role validation
        role = data.get('role')
        if role and role not in [r.value for r in UserRole]:
            errors['role'] = f"Invalid role: {role}"
        
        # Role-specific validation
        if role == UserRole.STUDENT.value and not data.get('student_id'):
            errors['student_id'] = "Student ID is required for student role"
        
        if role in UserRole.get_staff_roles() and not data.get('employee_id'):
            errors['employee_id'] = "Employee ID is required for staff roles"
        
        return errors
    
    @staticmethod
    def validate_department_data(data: Dict[str, Any]) -> Dict[str, str]:
        """
        Validate department data and return any errors.
        
        Args:
            data: Dictionary containing department data
            
        Returns:
            Dictionary of field names to error messages
        """
        errors = {}
        
        # Required fields
        required_fields = ['name', 'code']
        for field in required_fields:
            if not data.get(field):
                errors[field] = f"{field} is required"
        
        # Code validation
        code = data.get('code', '')
        if code:
            if len(code) < 2 or len(code) > 20:
                errors['code'] = "Code must be between 2 and 20 characters"
            elif not code.replace('_', '').isalnum():
                errors['code'] = "Code can only contain letters, numbers, and underscores"
        
        # Name validation
        name = data.get('name', '')
        if name and len(name.strip()) < 3:
            errors['name'] = "Name must be at least 3 characters long"
        
        return errors


class ModelRepository:
    """
    Repository pattern implementation for common model operations.
    
    Provides a consistent interface for database operations
    across different model types.
    """
    
    def __init__(self, db: Session):
        """
        Initialize repository with database session.
        
        Args:
            db: SQLAlchemy database session
        """
        self.db = db
    
    def create(self, model_class: Type[T], data: Dict[str, Any]) -> T:
        """
        Create a new model instance.
        
        Args:
            model_class: The model class to create
            data: Data for the new instance
            
        Returns:
            Created model instance
        """
        instance = model_class(**data)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance
    
    def get_by_id(self, model_class: Type[T], record_id: str) -> Optional[T]:
        """
        Get a model instance by ID.
        
        Args:
            model_class: The model class to query
            record_id: The ID to search for
            
        Returns:
            Model instance or None if not found
        """
        return self.db.query(model_class).filter(model_class.id == record_id).first()
    
    def get_all(self, model_class: Type[T], limit: Optional[int] = None) -> list:
        """
        Get all instances of a model.
        
        Args:
            model_class: The model class to query
            limit: Maximum number of records to return
            
        Returns:
            List of model instances
        """
        query = self.db.query(model_class)
        if limit:
            query = query.limit(limit)
        return query.all()
    
    def update(self, instance: T, data: Dict[str, Any]) -> T:
        """
        Update a model instance.
        
        Args:
            instance: The model instance to update
            data: Data to update
            
        Returns:
            Updated model instance
        """
        for key, value in data.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        
        self.db.commit()
        self.db.refresh(instance)
        return instance
    
    def delete(self, instance: T) -> None:
        """
        Delete a model instance.
        
        Args:
            instance: The model instance to delete
        """
        self.db.delete(instance)
        self.db.commit()