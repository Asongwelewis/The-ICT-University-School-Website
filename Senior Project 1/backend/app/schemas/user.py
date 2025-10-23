"""
User schemas for ICT University ERP System

This module defines Pydantic models for user-related operations:
- User registration and login
- User profile management
- Role-based user data
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator
from app.core.config import UserRoles


class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool = True
    
    @validator('role')
    def validate_role(cls, v):
        """Validate that role is one of the allowed roles"""
        if v not in UserRoles.get_all_roles():
            raise ValueError(f'Role must be one of: {", ".join(UserRoles.get_all_roles())}')
        return v


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str
    department: Optional[str] = None
    student_id: Optional[str] = None
    employee_id: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    @validator('student_id')
    def validate_student_id(cls, v, values):
        """Validate student ID is provided for students"""
        if values.get('role') == UserRoles.STUDENT and not v:
            raise ValueError('Student ID is required for student role')
        return v
    
    @validator('employee_id')
    def validate_employee_id(cls, v, values):
        """Validate employee ID is provided for staff"""
        role = values.get('role')
        if role in UserRoles.get_staff_roles() and role != UserRoles.STUDENT and not v:
            raise ValueError('Employee ID is required for staff roles')
        return v


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user response (excludes sensitive data)"""
    id: str
    department: Optional[str] = None
    student_id: Optional[str] = None
    employee_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """Schema for user data stored in database"""
    pass


class UserWithPermissions(UserResponse):
    """Schema for user with role-based permissions"""
    permissions: List[str] = []
    
    @validator('permissions', pre=True, always=True)
    def set_permissions(cls, v, values):
        """Set permissions based on user role"""
        from app.core.config import ROLE_PERMISSIONS
        role = values.get('role')
        if role and role in ROLE_PERMISSIONS:
            return ROLE_PERMISSIONS[role]
        return []


# Specialized user schemas for different roles
class StudentCreate(UserCreate):
    """Schema for student registration"""
    role: str = UserRoles.STUDENT
    student_id: str
    department: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@ictuniversity.edu",
                "password": "SecurePass123",
                "full_name": "John Doe",
                "phone": "+1234567890",
                "role": "student",
                "student_id": "ICT2024001",
                "department": "Computer Science"
            }
        }


class StaffCreate(UserCreate):
    """Schema for staff registration"""
    employee_id: str
    department: str
    
    @validator('role')
    def validate_staff_role(cls, v):
        """Validate that role is a staff role"""
        if v not in UserRoles.get_staff_roles():
            raise ValueError(f'Role must be one of staff roles: {", ".join(UserRoles.get_staff_roles())}')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "staff@ictuniversity.edu",
                "password": "SecurePass123",
                "full_name": "Jane Smith",
                "phone": "+1234567890",
                "role": "academic_staff",
                "employee_id": "EMP2024001",
                "department": "Computer Science"
            }
        }


class AdminCreate(StaffCreate):
    """Schema for admin registration"""
    role: str = UserRoles.SYSTEM_ADMIN
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@ictuniversity.edu",
                "password": "SecurePass123",
                "full_name": "Admin User",
                "phone": "+1234567890",
                "role": "system_admin",
                "employee_id": "ADM2024001",
                "department": "Administration"
            }
        }