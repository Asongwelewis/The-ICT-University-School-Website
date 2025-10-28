"""
Repository layer for database operations.
"""
from .base_repository import BaseRepository
from .academic_repository import CourseRepository, GradeRepository, AttendanceRepository

__all__ = [
    "BaseRepository",
    "CourseRepository", 
    "GradeRepository",
    "AttendanceRepository"
]