"""
Department model for organizational structure.
"""

from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel


class Department(BaseModel):
    """Department model for organizing courses and staff."""
    
    __tablename__ = "departments"

    # Basic information
    name = Column(String, nullable=False, unique=True)
    code = Column(String, nullable=False, unique=True)
    description = Column(Text)
    
    # Department head
    head_of_department = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships (using string references to avoid circular imports)
    head = relationship("Profile", foreign_keys=[head_of_department])
    courses = relationship("Course", back_populates="department")
    fee_structures = relationship("FeeStructure", back_populates="department")
    
    def __repr__(self):
        return f"<Department(id={self.id}, name={self.name}, code={self.code})>"
    
    @property
    def head_name(self) -> str:
        """Get the name of the department head."""
        return self.head.full_name if self.head else "No Head Assigned"
    
    @property
    def active_courses_count(self) -> int:
        """Get count of active courses in this department."""
        return len([course for course in self.courses if course.is_active])