"""
Course Notes model for ICT University ERP System
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Enum, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.models.base import BaseModel


class NoteType(str, enum.Enum):
    """Note types"""
    LECTURE = "lecture"
    TUTORIAL = "tutorial"
    LAB = "lab"
    ASSIGNMENT = "assignment"
    REFERENCE = "reference"
    SUPPLEMENTARY = "supplementary"


class NoteFormat(str, enum.Enum):
    """Note formats"""
    PDF = "pdf"
    DOC = "doc"
    PPT = "ppt"
    VIDEO = "video"
    LINK = "link"
    TEXT = "text"


class CourseNote(BaseModel):
    """Course Notes model"""
    __tablename__ = "course_notes"

    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text)  # For text-based notes
    
    # Course information
    course_code = Column(String(20), nullable=False)
    course_name = Column(String(255), nullable=False)
    chapter = Column(String(100))
    topic = Column(String(255))
    
    # Author information
    author_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    author_name = Column(String(255), nullable=False)
    
    # Note details
    type = Column(Enum(NoteType), nullable=False, default=NoteType.LECTURE)
    format = Column(Enum(NoteFormat), nullable=False, default=NoteFormat.PDF)
    
    # File information
    file_url = Column(String(500))  # URL to file storage
    file_name = Column(String(255))
    file_size = Column(Integer)  # Size in bytes
    
    # External links
    external_url = Column(String(500))  # For video links, external resources
    
    # Targeting
    department = Column(String(100))
    semester = Column(String(20))
    academic_year = Column(String(20))
    
    # Status and visibility
    is_active = Column(Boolean, default=True, nullable=False)
    is_public = Column(Boolean, default=True, nullable=False)
    download_count = Column(Integer, default=0)
    
    # Timestamps
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    author = relationship("Profile", back_populates="course_notes")

    def __repr__(self):
        return f"<CourseNote(id={self.id}, title='{self.title}', course='{self.course_code}')>"