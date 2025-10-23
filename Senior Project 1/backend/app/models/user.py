"""
User model for authentication and user management.
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class User(Base):
    """User model for storing user account information."""
    
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin, student, instructor, staff
    profile = Column(JSON, default={})  # Store profile information as JSON
    permissions = Column(ARRAY(String), default=[])  # User permissions
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
    
    @property
    def full_name(self) -> str:
        """Get user's full name from profile."""
        if self.profile:
            first_name = self.profile.get('first_name', '')
            last_name = self.profile.get('last_name', '')
            return f"{first_name} {last_name}".strip()
        return self.email
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has a specific permission."""
        return permission in (self.permissions or [])
    
    def add_permission(self, permission: str) -> None:
        """Add a permission to the user."""
        if not self.permissions:
            self.permissions = []
        if permission not in self.permissions:
            self.permissions.append(permission)
    
    def remove_permission(self, permission: str) -> None:
        """Remove a permission from the user."""
        if self.permissions and permission in self.permissions:
            self.permissions.remove(permission)