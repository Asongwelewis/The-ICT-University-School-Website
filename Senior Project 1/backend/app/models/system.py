"""
System models for settings and audit logging.
"""

from sqlalchemy import Column, String, Boolean, Text, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel


class SystemSetting(BaseModel):
    """System settings model for configuration."""
    
    __tablename__ = "system_settings"

    # Setting information
    setting_key = Column(String, nullable=False, unique=True)
    setting_value = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, default='general')
    
    # Visibility
    is_public = Column(Boolean, default=False)
    
    # Update tracking
    updated_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Relationships
    updater = relationship("Profile", foreign_keys=[updated_by])
    
    def __repr__(self):
        return f"<SystemSetting(id={self.id}, key={self.setting_key}, value={self.setting_value})>"
    
    @property
    def updater_name(self) -> str:
        """Get updater name."""
        return self.updater.full_name if self.updater else "System"


class AuditLog(BaseModel):
    """Audit log model for tracking changes."""
    
    __tablename__ = "audit_log"

    # Record information
    table_name = Column(String, nullable=False)
    record_id = Column(UUID(as_uuid=True), nullable=False)
    action = Column(String, nullable=False)  # INSERT, UPDATE, DELETE
    
    # Change data
    old_values = Column(JSON)
    new_values = Column(JSON)
    
    # User tracking
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    timestamp = Column(DateTime(timezone=True), server_default='now()')
    
    # Relationships
    user = relationship("Profile", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, table={self.table_name}, action={self.action})>"
    
    @property
    def user_name(self) -> str:
        """Get user name who made the change."""
        return self.user.full_name if self.user else "System"