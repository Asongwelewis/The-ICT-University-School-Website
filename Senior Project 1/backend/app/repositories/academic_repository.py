"""
Academic repository for course, enrollment, attendance, and grade operations.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from uuid import UUID
from datetime import date

from app.models.academic import Course, Enrollment, Attendance, Grade
from .base import BaseRepository


class AcademicRepository:
    """Repository for academic operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = BaseRepository(Course, db)
        self.enrollment_repo = BaseRepository(Enrollment, db)
        self.attendance_repo = BaseRepository(Attendance, db)
        self.grade_repo = BaseRepository(Grade, db)
    
    # Course operations
    def create_course(self, course_data: Dict[str, Any]) -> Course:
        """Create a new course."""
        return self.course_repo.create(course_data)
    
    def get_course(self, course_id: UUID) -> Optional[Course]:
        """Get course by ID."""
        return self.course_repo.get(course_id)
    
    def get_course_by_code(self, course_code: str) -> Optional[Course]:
        """Get course by course code."""
        return self.db.query(Course).filter(Course.course_code == course_code).first()
    
    def get_courses_by_instructor(self, instructor_id: UUID) -> List[Course]:
        """Get courses taught by an instructor."""
        return self.db.query(Course).filter(Course.instructor_id == instructor_id).all()
    
    def get_courses_by_department(self, department_id: UUID) -> List[Course]:
        """Get courses in a department."""
        return self.db.query(Course).filter(Course.department_id == department_id).all()
    
    def get_active_courses(self) -> List[Course]:
        """Get all active courses."""
        return self.db.query(Course).filter(Course.is_active == True).all()
    
    # Enrollment operations
    def enroll_student(self, student_id: UUID, course_id: UUID) -> Enrollment:
        """Enroll a student in a course."""
        enrollment_data = {
            "student_id": student_id,
            "course_id": course_id,
            "status": "enrolled"
        }
        return self.enrollment_repo.create(enrollment_data)
    
    def get_student_enrollments(self, student_id: UUID) -> List[Enrollment]:
        """Get all enrollments for a student."""
        return self.db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
    
    def get_course_enrollments(self, course_id: UUID) -> List[Enrollment]:
        """Get all enrollments for a course."""
        return self.db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    
    def get_enrollment(self, student_id: UUID, course_id: UUID) -> Optional[Enrollment]:
        """Get specific enrollment."""
        return self.db.query(Enrollment).filter(
            and_(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
        ).first()
    
    def update_enrollment_status(self, enrollment_id: UUID, status: str) -> Optional[Enrollment]:
        """Update enrollment status."""
        return self.enrollment_repo.update(enrollment_id, {"status": status})
    
    def assign_grade(self, enrollment_id: UUID, grade: str, grade_points: float) -> Optional[Enrollment]:
        """Assign grade to enrollment."""
        return self.enrollment_repo.update(enrollment_id, {
            "grade": grade,
            "grade_points": grade_points,
            "status": "completed"
        })
    
    # Attendance operations
    def record_attendance(self, attendance_data: Dict[str, Any]) -> Attendance:
        """Record attendance for a student."""
        return self.attendance_repo.create(attendance_data)
    
    def get_student_attendance(self, student_id: UUID, course_id: UUID) -> List[Attendance]:
        """Get attendance records for a student in a course."""
        return self.db.query(Attendance).filter(
            and_(Attendance.student_id == student_id, Attendance.course_id == course_id)
        ).all()
    
    def get_course_attendance(self, course_id: UUID, attendance_date: date) -> List[Attendance]:
        """Get attendance for all students in a course on a specific date."""
        return self.db.query(Attendance).filter(
            and_(Attendance.course_id == course_id, Attendance.attendance_date == attendance_date)
        ).all()
    
    def update_attendance(self, attendance_id: UUID, status: str, notes: str = None) -> Optional[Attendance]:
        """Update attendance record."""
        update_data = {"status": status}
        if notes:
            update_data["notes"] = notes
        return self.attendance_repo.update(attendance_id, update_data)
    
    def get_attendance_summary(self, student_id: UUID, course_id: UUID) -> Dict[str, Any]:
        """Get attendance summary for a student in a course."""
        attendance_records = self.get_student_attendance(student_id, course_id)
        
        total_classes = len(attendance_records)
        present_count = len([a for a in attendance_records if a.status == 'present'])
        absent_count = len([a for a in attendance_records if a.status == 'absent'])
        late_count = len([a for a in attendance_records if a.status == 'late'])
        excused_count = len([a for a in attendance_records if a.status == 'excused'])
        
        attendance_percentage = (present_count / total_classes * 100) if total_classes > 0 else 0
        
        return {
            "total_classes": total_classes,
            "present": present_count,
            "absent": absent_count,
            "late": late_count,
            "excused": excused_count,
            "attendance_percentage": round(attendance_percentage, 2)
        }
    
    # Grade operations
    def record_grade(self, grade_data: Dict[str, Any]) -> Grade:
        """Record a grade for a student."""
        return self.grade_repo.create(grade_data)
    
    def get_student_grades(self, student_id: UUID, course_id: UUID = None) -> List[Grade]:
        """Get grades for a student, optionally filtered by course."""
        query = self.db.query(Grade).filter(Grade.user_id == student_id)
        if course_id:
            query = query.filter(Grade.course_id == course_id)
        return query.all()
    
    def get_course_grades(self, course_id: UUID) -> List[Grade]:
        """Get all grades for a course."""
        return self.db.query(Grade).filter(Grade.course_id == course_id).all()
    
    def update_grade(self, grade_id: UUID, grade_data: Dict[str, Any]) -> Optional[Grade]:
        """Update a grade record."""
        return self.grade_repo.update(grade_id, grade_data)
    
    def calculate_student_gpa(self, student_id: UUID) -> float:
        """Calculate GPA for a student based on enrollments."""
        enrollments = self.db.query(Enrollment).filter(
            and_(
                Enrollment.student_id == student_id,
                Enrollment.grade_points.isnot(None),
                Enrollment.status == 'completed'
            )
        ).all()
        
        if not enrollments:
            return 0.0
        
        total_points = sum(float(e.grade_points) for e in enrollments)
        return round(total_points / len(enrollments), 2)