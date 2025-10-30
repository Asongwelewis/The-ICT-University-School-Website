"""
Pydantic schemas for course notes
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl

from app.models.notes import NoteType, NoteFormat


class CourseNoteBase(BaseModel):
    """Base course note schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    course_code: str = Field(..., min_length=1, max_length=20)
    course_name: str = Field(..., min_length=1, max_length=255)
    chapter: Optional[str] = None
    topic: Optional[str] = None
    type: NoteType = NoteType.LECTURE
    format: NoteFormat = NoteFormat.PDF
    file_name: Optional[str] = None
    external_url: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    academic_year: Optional[str] = None
    is_public: bool = True


class CourseNoteCreate(CourseNoteBase):
    """Schema for creating course notes"""
    pass


class CourseNoteUpdate(BaseModel):
    """Schema for updating course notes"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    course_code: Optional[str] = Field(None, min_length=1, max_length=20)
    course_name: Optional[str] = Field(None, min_length=1, max_length=255)
    chapter: Optional[str] = None
    topic: Optional[str] = None
    type: Optional[NoteType] = None
    format: Optional[NoteFormat] = None
    file_name: Optional[str] = None
    external_url: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    academic_year: Optional[str] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None


class CourseNoteResponse(CourseNoteBase):
    """Schema for course note responses"""
    id: str
    author_id: str
    author_name: str
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    download_count: int
    is_active: bool
    published_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseNoteListResponse(BaseModel):
    """Schema for course note list responses"""
    notes: List[CourseNoteResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


class CourseNotesGroupedResponse(BaseModel):
    """Schema for course notes grouped by course"""
    course_code: str
    course_name: str
    notes: List[CourseNoteResponse]