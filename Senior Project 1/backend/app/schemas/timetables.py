"""
Pydantic schemas for timetables
"""

from typing import Optional, List
from datetime import datetime, time
from pydantic import BaseModel, Field

from app.models.timetables import TimetableType, DayOfWeek


class TimetableBase(BaseModel):
    """Base timetable schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    type: TimetableType = TimetableType.CLASS
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    instructor_name: Optional[str] = None
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    duration_minutes: Optional[int] = None
    room: Optional[str] = None
    building: Optional[str] = None
    location_details: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    academic_year: Optional[str] = None
    target_roles: Optional[List[str]] = None
    is_recurring: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class TimetableCreate(TimetableBase):
    """Schema for creating timetables"""
    pass


class TimetableUpdate(BaseModel):
    """Schema for updating timetables"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    type: Optional[TimetableType] = None
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    instructor_name: Optional[str] = None
    day_of_week: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    room: Optional[str] = None
    building: Optional[str] = None
    location_details: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    academic_year: Optional[str] = None
    target_roles: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_recurring: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class TimetableResponse(TimetableBase):
    """Schema for timetable responses"""
    id: str
    instructor_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TimetableListResponse(BaseModel):
    """Schema for timetable list responses"""
    timetables: List[TimetableResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool