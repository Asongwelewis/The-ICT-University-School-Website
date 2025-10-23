"""
Academic module schemas for request/response validation.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from uuid import UUID


class CourseBase(BaseModel):
    """Base course schema with common fields."""
    name: str = Field(..., min_length=1, max_length=200, description="Course name")
    code: str = Field(..., min_length=1, max_length=20, description="Course code")
    description: Optional[str] = Field(None, max_length=1000, description="Course description")
    credits: int = Field(..., ge=1, le=10, description="Number of credits")
    
    @validator('code')
    def validate_code(cls, v):
        """Ensure course code is uppercase and alphanumeric."""
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Course code must be alphanumeric (with optional hyphens/underscores)')
        return v.upper()


class CourseCreate(CourseBase):
    """Schema for creating a new course."""
    instructor_id: UUID = Field(..., description="Instructor's user ID")
    schedule: List[dict] = Field(default_factory=list, description="Course schedule")


class CourseUpdate(BaseModel):
    """Schema for updating an existing course."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    credits: Optional[int] = Field(None, ge=1, le=10)
    schedule: Optional[List[dict]] = None
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    """Schema for course response."""
    id: UUID
    instructor_id: UUID
    schedule: List[dict]
    enrolled_students: List[UUID]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class GradeBase(BaseModel):
    """Base grade schema."""
    assessment_type: str = Field(..., description="Type of assessment")
    score: float = Field(..., ge=0, description="Score achieved")
    max_score: float = Field(..., gt=0, description="Maximum possible score")
    feedback: Optional[str] = Field(None, max_length=1000, description="Instructor feedback")
    
    @validator('assessment_type')
    def validate_assessment_type(cls, v):
        """Validate assessment type."""
        allowed_types = ['quiz', 'exam', 'assignment', 'project', 'participation']
        if v.lower() not in allowed_types:
            raise ValueError(f'Assessment type must be one of: {", ".join(allowed_types)}')
        return v.lower()
    
    @validator('score')
    def validate_score(cls, v, values):
        """Ensure score doesn't exceed max_score."""
        if 'max_score' in values and v > values['max_score']:
            raise ValueError('Score cannot exceed maximum score')
        return v


class GradeCreate(GradeBase):
    """Schema for creating a new grade."""
    student_id: UUID = Field(..., description="Student's user ID")
    course_id: UUID = Field(..., description="Course ID")


class GradeResponse(GradeBase):
    """Schema for grade response."""
    id: UUID
    student_id: UUID
    course_id: UUID
    grade: Optional[str]  # Letter grade (A, B, C, etc.)
    recorded_by: UUID
    recorded_at: datetime
    
    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    """Base attendance schema."""
    date: datetime = Field(..., description="Date of attendance")
    status: str = Field(..., description="Attendance status")
    
    @validator('status')
    def validate_status(cls, v):
        """Validate attendance status."""
        allowed_statuses = ['present', 'absent', 'late', 'excused']
        if v.lower() not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v.lower()


class AttendanceCreate(AttendanceBase):
    """Schema for creating attendance record."""
    student_id: UUID = Field(..., description="Student's user ID")
    course_id: UUID = Field(..., description="Course ID")


class AttendanceResponse(AttendanceBase):
    """Schema for attendance response."""
    id: UUID
    student_id: UUID
    course_id: UUID
    recorded_by: UUID
    recorded_at: datetime
    
    class Config:
        from_attributes = True