"""
Attachment model for file management.
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel


class Attachment(BaseModel):
    """Attachment model for file uploads."""
    
    __tablename__ = "attachments"

    # File information
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    
    # Upload tracking
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    # Related record (polymorphic)
    related_id = Column(UUID(as_uuid=True))
    related_type = Column(String)  # e.g., 'course', 'assignment', 'profile'
    
    # Relationships
    uploader = relationship("Profile", foreign_keys=[uploaded_by])
    
    def __repr__(self):
        return f"<Attachment(id={self.id}, file_name={self.file_name}, type={self.file_type})>"
    
    @property
    def uploader_name(self) -> str:
        """Get uploader name."""
        return self.uploader.full_name if self.uploader else "Unknown User"
    
    @property
    def file_size_mb(self) -> float:
        """Get file size in MB."""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0.0