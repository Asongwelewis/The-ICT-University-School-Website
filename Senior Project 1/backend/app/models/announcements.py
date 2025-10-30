"""
Announcements model for ICT University ERP System

This module provides the Announcement model for managing system-wide
announcements with role-based targeting and priority levels.
"""

from typing import List, Optional
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Enum, or_, and_
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, validates, Session
from sqlalchemy.sql import func
import enum

from app.models.base import BaseModel


class AnnouncementType(str, enum.Enum):
    """
    Announcement types for categorization and filtering.
    
    Each type represents a different category of announcement
    that may have different visibility rules or styling.
    """
    GENERAL = "general"
    ACADEMIC = "academic"
    FINANCE = "finance"
    ADMINISTRATION = "administration"
    EMERGENCY = "emergency"
    
    @classmethod
    def get_all_types(cls) -> List[str]:
        """Get all available announcement types."""
        return [t.value for t in cls]
    
    @classmethod
    def get_high_priority_types(cls) -> List[str]:
        """Get announcement types that should have high visibility."""
        return [cls.EMERGENCY.value, cls.ADMINISTRATION.value]


class AnnouncementPriority(str, enum.Enum):
    """
    Announcement priority levels for display ordering and styling.
    
    Higher priority announcements should be displayed more prominently.
    """
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
    
    @classmethod
    def get_all_priorities(cls) -> List[str]:
        """Get all available priority levels."""
        return [p.value for p in cls]
    
    @classmethod
    def get_priority_order(cls) -> dict:
        """Get priority ordering for sorting (higher number = higher priority)."""
        return {
            cls.LOW.value: 1,
            cls.MEDIUM.value: 2,
            cls.HIGH.value: 3,
            cls.URGENT.value: 4
        }


class Announcement(BaseModel):
    """
    Announcement model for system-wide notifications.
    
    Features:
    - Role-based targeting
    - Department-specific visibility
    - Priority levels for display ordering
    - Expiration dates for automatic cleanup
    - Pinning for important announcements
    - Rich content support
    """
    __tablename__ = "announcements"

    # Core content
    title = Column(String(255), nullable=False, index=True, 
                  doc="Announcement title")
    content = Column(Text, nullable=False, 
                    doc="Announcement content (supports markdown)")
    
    # Classification
    type = Column(Enum(AnnouncementType), nullable=False, 
                 default=AnnouncementType.GENERAL, index=True,
                 doc="Announcement category")
    priority = Column(Enum(AnnouncementPriority), nullable=False, 
                     default=AnnouncementPriority.MEDIUM, index=True,
                     doc="Priority level for display ordering")
    
    # Author information (normalized - only store foreign key)
    author_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), 
                      nullable=False, index=True,
                      doc="ID of the user who created this announcement")
    
    # Visibility and targeting
    target_roles = Column(JSONB, default=list, 
                         doc="List of user roles that can see this announcement")
    department = Column(String(100), index=True,
                       doc="Specific department targeting (optional)")
    
    # Status and timing
    is_active = Column(Boolean, default=True, nullable=False, index=True,
                      doc="Whether the announcement is currently active")
    is_pinned = Column(Boolean, default=False, nullable=False, index=True,
                      doc="Whether the announcement should be pinned to top")
    published_at = Column(DateTime(timezone=True), server_default=func.now(),
                         nullable=False, index=True,
                         doc="When the announcement was published")
    expires_at = Column(DateTime(timezone=True), index=True,
                       doc="When the announcement expires (optional)")
    
    # Relationships
    author = relationship("Profile", back_populates="announcements",
                         doc="User who created this announcement")

    # Validation methods
    @validates('type')
    def validate_type(self, key, announcement_type):
        """Validate announcement type is valid."""
        if announcement_type not in AnnouncementType.get_all_types():
            raise ValueError(f"Invalid announcement type: {announcement_type}")
        return announcement_type

    @validates('priority')
    def validate_priority(self, key, priority):
        """Validate announcement priority is valid."""
        if priority not in AnnouncementPriority.get_all_priorities():
            raise ValueError(f"Invalid priority: {priority}")
        return priority

    @validates('target_roles')
    def validate_target_roles(self, key, target_roles):
        """Validate target roles structure and values."""
        if target_roles is not None:
            if not isinstance(target_roles, list):
                raise ValueError("target_roles must be a list")
            
            # Validate each role exists (import here to avoid circular imports)
            try:
                from app.core.config import UserRoles
                valid_roles = UserRoles.get_all_roles()
                for role in target_roles:
                    if role not in valid_roles:
                        raise ValueError(f"Invalid role in target_roles: {role}")
            except ImportError:
                # If config not available, skip validation
                pass
        return target_roles

    @validates('title')
    def validate_title(self, key, title):
        """Validate title is not empty and within length limits."""
        if not title or not title.strip():
            raise ValueError("Title cannot be empty")
        if len(title.strip()) > 255:
            raise ValueError("Title cannot exceed 255 characters")
        return title.strip()

    @validates('content')
    def validate_content(self, key, content):
        """Validate content is not empty."""
        if not content or not content.strip():
            raise ValueError("Content cannot be empty")
        return content.strip()

    # Properties for accessing author information
    @property
    def author_name(self) -> Optional[str]:
        """Get author name from related profile."""
        return self.author.full_name if self.author else None

    @property
    def author_role(self) -> Optional[str]:
        """Get author role from related profile."""
        return self.author.role if self.author else None

    @property
    def priority_order(self) -> int:
        """Get numeric priority for sorting."""
        return AnnouncementPriority.get_priority_order().get(self.priority, 0)

    # Business logic methods
    def is_active_now(self) -> bool:
        """Check if announcement is currently active and not expired."""
        if not self.is_active:
            return False
        
        now = datetime.utcnow()
        if self.expires_at and now > self.expires_at:
            return False
        
        return True

    def is_visible_to_role(self, user_role: str) -> bool:
        """Check if announcement is visible to a specific role."""
        if not self.target_roles:
            return True  # Visible to all if no specific targeting
        return user_role in self.target_roles

    def is_visible_to_department(self, user_department: Optional[str]) -> bool:
        """Check if announcement is visible to a specific department."""
        if not self.department:
            return True  # Visible to all departments if not specified
        return user_department == self.department

    def can_user_see(self, user_role: str, user_department: Optional[str] = None) -> bool:
        """
        Check if a user can see this announcement based on role and department.
        
        Args:
            user_role: User's role in the system
            user_department: User's department (optional)
            
        Returns:
            Boolean indicating if user can see this announcement
        """
        if not self.is_active_now():
            return False
        
        role_visible = self.is_visible_to_role(user_role)
        dept_visible = self.is_visible_to_department(user_department)
        
        return role_visible and dept_visible

    def mark_as_read(self, user_id: str, db: Session) -> None:
        """
        Mark announcement as read by a specific user.
        
        Note: This would require a separate AnnouncementRead model
        to track which users have read which announcements.
        """
        # TODO: Implement read tracking with separate model
        pass

    # Class methods for querying
    @classmethod
    def get_active_for_user(cls, db: Session, user_role: str, 
                           user_department: Optional[str] = None,
                           limit: Optional[int] = None) -> List['Announcement']:
        """
        Get all active announcements visible to a specific user.
        
        Args:
            db: Database session
            user_role: User's role in the system
            user_department: User's department (optional)
            limit: Maximum number of announcements to return
            
        Returns:
            List of announcements sorted by priority and date
        """
        now = datetime.utcnow()
        
        # Base query for active, non-expired announcements
        query = db.query(cls).filter(
            cls.is_active == True,
            or_(cls.expires_at.is_(None), cls.expires_at > now)
        )
        
        # Apply role filtering if target_roles is specified
        # Note: This is a simplified approach. For better performance,
        # consider using database-specific JSON operators
        announcements = query.all()
        filtered_announcements = [
            ann for ann in announcements 
            if ann.can_user_see(user_role, user_department)
        ]
        
        # Sort by pinned status, priority, and date
        filtered_announcements.sort(
            key=lambda x: (
                not x.is_pinned,  # Pinned first (False sorts before True)
                -x.priority_order,  # Higher priority first
                -x.published_at.timestamp()  # Newer first
            )
        )
        
        if limit:
            filtered_announcements = filtered_announcements[:limit]
        
        return filtered_announcements

    @classmethod
    def get_by_type(cls, db: Session, announcement_type: AnnouncementType,
                   active_only: bool = True) -> List['Announcement']:
        """Get announcements by type."""
        query = db.query(cls).filter(cls.type == announcement_type)
        
        if active_only:
            now = datetime.utcnow()
            query = query.filter(
                cls.is_active == True,
                or_(cls.expires_at.is_(None), cls.expires_at > now)
            )
        
        return query.order_by(cls.published_at.desc()).all()

    @classmethod
    def get_pinned(cls, db: Session) -> List['Announcement']:
        """Get all pinned announcements."""
        now = datetime.utcnow()
        return db.query(cls).filter(
            cls.is_pinned == True,
            cls.is_active == True,
            or_(cls.expires_at.is_(None), cls.expires_at > now)
        ).order_by(cls.published_at.desc()).all()

    @classmethod
    def get_urgent(cls, db: Session) -> List['Announcement']:
        """Get all urgent announcements."""
        now = datetime.utcnow()
        return db.query(cls).filter(
            cls.priority == AnnouncementPriority.URGENT,
            cls.is_active == True,
            or_(cls.expires_at.is_(None), cls.expires_at > now)
        ).order_by(cls.published_at.desc()).all()

    def __repr__(self) -> str:
        """String representation of the announcement."""
        return f"<Announcement(id={self.id}, title='{self.title[:30]}...', type='{self.type}', priority='{self.priority}')>"

    def __str__(self) -> str:
        """Human-readable string representation."""
        return f"{self.title} ({self.type.upper()})"