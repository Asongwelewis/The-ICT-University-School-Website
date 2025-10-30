"""
Timetables model for ICT University ERP System
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Enum, Integer, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.models.base import BaseModel


class TimetableType(str, enum.Enum):
    """Timetable types"""
    CLASS = "class"
    EXAM = "exam"
    EVENT = "event"
    MAINTENANCE = "maintenance"


class DayOfWeek(str, enum.Enum):
    """Days of the week"""
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class Timetable(BaseModel):
    """Timetable model"""
    __tablename__ = "timetables"

    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(Enum(TimetableType), nullable=False, default=TimetableType.CLASS)
    
    # Course and instructor information
    course_code = Column(String(20))
    course_name = Column(String(255))
    instructor_id = Column(String(36), ForeignKey("profiles.id"))
    instructor_name = Column(String(255))
    
    # Timing information
    day_of_week = Column(Enum(DayOfWeek), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    duration_minutes = Column(Integer)
    
    # Location information
    room = Column(String(100))
    building = Column(String(100))
    location_details = Column(Text)
    
    # Targeting and visibility
    department = Column(String(100))
    semester = Column(String(20))
    academic_year = Column(String(20))
    target_roles = Column(Text)  # JSON array of target roles
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_recurring = Column(Boolean, default=True, nullable=False)
    
    # Special dates
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    # Relationships
    instructor = relationship("Profile", back_populates="timetables")

    def __repr__(self):
        return f"<Timetable(id={self.id}, title='{self.title}', type='{self.type}')>"