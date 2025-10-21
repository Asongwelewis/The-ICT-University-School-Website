from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class CourseSchedule(BaseModel):
    day: str
    start_time: str
    end_time: str
    room: str


class CourseCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    credits: int
    instructor_id: str
    schedule: List[CourseSchedule] = []


class CourseResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    credits: int
    instructor_id: str
    schedule: List[Dict[str, Any]] = []
    enrolled_students: List[str] = []
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GradeCreate(BaseModel):
    student_id: str
    course_id: str
    assessment_type: str
    score: float
    max_score: float
    feedback: Optional[str] = None


class GradeResponse(BaseModel):
    id: str
    student_id: str
    course_id: str
    assessment_type: str
    score: float
    max_score: float
    grade: Optional[str] = None
    feedback: Optional[str] = None
    recorded_by: str
    recorded_at: datetime

    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    student_id: str
    course_id: str
    date: datetime
    status: str  # present, absent, late


class AttendanceResponse(BaseModel):
    id: str
    student_id: str
    course_id: str
    date: datetime
    status: str
    recorded_by: str
    recorded_at: datetime

    class Config:
        from_attributes = True