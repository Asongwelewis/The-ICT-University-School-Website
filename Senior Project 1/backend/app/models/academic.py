"""
Academic models for courses, enrollments, attendance, and grades.

This module provides comprehensive academic management models including:
- Course management with enrollment tracking
- Student enrollment with grade tracking
- Attendance monitoring
- Grade recording and calculation

All models include proper validation, constraints, and business logic methods.
"""

from enum import Enum
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, Tuple
from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean, Date, Text, ForeignKey,
    CheckConstraint, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, validates
from sqlalchemy.exc import ValidationError
from .base import BaseModel


# Enums for status values
class EnrollmentStatus(str, Enum):
    """Valid enrollment status values."""
    ENROLLED = "enrolled"
    COMPLETED = "completed"
    DROPPED = "dropped"
    FAILED = "failed"


class AttendanceStatus(str, Enum):
    """Valid attendance status values."""
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class GradeScale(str, Enum):
    """Standard letter grades."""
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    F = "F"


class Course(BaseModel):
    """
    Course model for academic courses.
    
    Represents academic courses with enrollment tracking, attendance monitoring,
    and grade management capabilities.
    """
    
    __tablename__ = "courses"

    # Course information
    course_code = Column(String, nullable=False, unique=True)
    course_name = Column(String, nullable=False)
    description = Column(Text)
    credits = Column(Integer, nullable=False, default=3)
    
    # Relationships
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Academic period
    semester = Column(String, nullable=False)
    academic_year = Column(String, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Database constraints and indexes
    __table_args__ = (
        CheckConstraint("credits >= 1 AND credits <= 6", name='valid_credits'),
        Index('idx_course_code', 'course_code'),
        Index('idx_course_instructor', 'instructor_id'),
        Index('idx_course_department', 'department_id'),
        Index('idx_course_active', 'is_active'),
        Index('idx_course_academic_period', 'academic_year', 'semester'),
    )
    
    # Relationships with optimized loading
    department = relationship("Department", back_populates="courses")
    instructor = relationship(
        "Profile", 
        back_populates="courses_taught", 
        foreign_keys=[instructor_id]
    )
    enrollments = relationship(
        "Enrollment", 
        back_populates="course",
        lazy="select",
        cascade="all, delete-orphan"
    )
    attendance_records = relationship(
        "Attendance", 
        back_populates="course",
        lazy="select"
    )
    grades = relationship(
        "Grade", 
        back_populates="course",
        lazy="select"
    )
    
    # Validation methods
    @validates('credits')
    def validate_credits(self, key, credits):
        """Validate credit hours are within acceptable range."""
        if credits < 1 or credits > 6:
            raise ValidationError("Credits must be between 1 and 6")
        return credits
    
    @validates('course_code')
    def validate_course_code(self, key, course_code):
        """Validate and normalize course code."""
        if not course_code or len(course_code.strip()) < 3:
            raise ValidationError("Course code must be at least 3 characters")
        return course_code.upper().strip()
    
    @validates('course_name')
    def validate_course_name(self, key, course_name):
        """Validate course name."""
        if not course_name or len(course_name.strip()) < 3:
            raise ValidationError("Course name must be at least 3 characters")
        return course_name.strip()
    
    def __repr__(self):
        return f"<Course(id={self.id}, code={self.course_code}, name={self.course_name})>"
    
    # Business logic properties
    @property
    def enrolled_students_count(self) -> int:
        """Get count of currently enrolled students."""
        return len([e for e in self.enrollments if e.status == EnrollmentStatus.ENROLLED])
    
    @property
    def instructor_name(self) -> str:
        """Get instructor name."""
        return self.instructor.full_name if self.instructor else "No Instructor"
    
    @property
    def completion_rate(self) -> float:
        """Calculate course completion rate."""
        if not self.enrollments:
            return 0.0
        
        completed = len([e for e in self.enrollments if e.status == EnrollmentStatus.COMPLETED])
        return (completed / len(self.enrollments)) * 100
    
    # Business logic methods
    def can_enroll_student(self, student_id: str, max_enrollment: int = 50) -> Tuple[bool, str]:
        """
        Check if a student can enroll in this course.
        
        Args:
            student_id: ID of the student to check
            max_enrollment: Maximum allowed enrollment (default: 50)
            
        Returns:
            Tuple of (can_enroll: bool, reason: str)
        """
        if not self.is_active:
            return False, "Course is not active"
        
        if self.enrolled_students_count >= max_enrollment:
            return False, "Course is full"
        
        # Check if student is already enrolled
        existing_enrollment = next(
            (e for e in self.enrollments 
             if e.student_id == student_id and e.status == EnrollmentStatus.ENROLLED),
            None
        )
        if existing_enrollment:
            return False, "Student is already enrolled"
        
        return True, "Can enroll"
    
    def get_attendance_rate(self, student_id: Optional[str] = None) -> float:
        """
        Calculate attendance rate for the course or specific student.
        
        Args:
            student_id: Optional student ID to filter by
            
        Returns:
            Attendance rate as percentage
        """
        attendance_records = self.attendance_records
        
        if student_id:
            attendance_records = [a for a in attendance_records if a.student_id == student_id]
        
        if not attendance_records:
            return 0.0
        
        present_count = len([
            a for a in attendance_records 
            if a.status in [AttendanceStatus.PRESENT, AttendanceStatus.LATE]
        ])
        return (present_count / len(attendance_records)) * 100
    
    def get_average_grade(self) -> float:
        """Calculate average grade for the course."""
        if not self.grades:
            return 0.0
        
        valid_grades = [g for g in self.grades if g.percentage > 0]
        if not valid_grades:
            return 0.0
        
        total_percentage = sum(g.percentage for g in valid_grades)
        return total_percentage / len(valid_grades)


class Enrollment(BaseModel):
    """
    Student enrollment in courses.
    
    Tracks student enrollment status, grades, and academic progress
    for specific courses.
    """
    
    __tablename__ = "enrollments"

    # Student and course
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    
    # Enrollment details
    enrollment_date = Column(Date, server_default='now()')
    status = Column(String, default=EnrollmentStatus.ENROLLED)
    
    # Grading
    grade = Column(String)  # A, B, C, D, F
    grade_points = Column(Numeric(3, 2))  # GPA points
    
    # Database constraints and indexes
    __table_args__ = (
        UniqueConstraint('student_id', 'course_id', name='unique_student_course_enrollment'),
        CheckConstraint(
            f"status IN ('{EnrollmentStatus.ENROLLED}', '{EnrollmentStatus.COMPLETED}', "
            f"'{EnrollmentStatus.DROPPED}', '{EnrollmentStatus.FAILED}')", 
            name='valid_enrollment_status'
        ),
        CheckConstraint("grade_points >= 0.0 AND grade_points <= 4.0", name='valid_grade_points'),
        CheckConstraint(
            f"grade IN ('{GradeScale.A}', '{GradeScale.B}', '{GradeScale.C}', "
            f"'{GradeScale.D}', '{GradeScale.F}') OR grade IS NULL", 
            name='valid_letter_grade'
        ),
        Index('idx_enrollment_student', 'student_id'),
        Index('idx_enrollment_course', 'course_id'),
        Index('idx_enrollment_status', 'status'),
        Index('idx_enrollment_date', 'enrollment_date'),
    )
    
    # Relationships
    student = relationship("Profile", back_populates="enrollments", foreign_keys=[student_id])
    course = relationship("Course", back_populates="enrollments")
    
    # Validation methods
    @validates('grade_points')
    def validate_grade_points(self, key, grade_points):
        """Validate grade points are within acceptable range."""
        if grade_points is not None and (grade_points < 0.0 or grade_points > 4.0):
            raise ValidationError("Grade points must be between 0.0 and 4.0")
        return grade_points
    
    @validates('status')
    def validate_status(self, key, status):
        """Validate enrollment status."""
        valid_statuses = [s.value for s in EnrollmentStatus]
        if status not in valid_statuses:
            raise ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return status
    
    def __repr__(self):
        return f"<Enrollment(id={self.id}, student_id={self.student_id}, course_id={self.course_id}, status={self.status})>"
    
    # Business logic properties
    @property
    def student_name(self) -> str:
        """Get student name."""
        return self.student.full_name if self.student else "Unknown Student"
    
    @property
    def course_name(self) -> str:
        """Get course name."""
        return self.course.course_name if self.course else "Unknown Course"
    
    @property
    def course_code(self) -> str:
        """Get course code."""
        return self.course.course_code if self.course else "Unknown"
    
    @property
    def is_active(self) -> bool:
        """Check if enrollment is currently active."""
        return self.status == EnrollmentStatus.ENROLLED
    
    @property
    def is_completed(self) -> bool:
        """Check if enrollment is completed."""
        return self.status == EnrollmentStatus.COMPLETED
    
    # Business logic methods
    def calculate_current_gpa(self) -> float:
        """Calculate current GPA for this enrollment."""
        if not self.grade_points:
            return 0.0
        return float(self.grade_points)
    
    def is_eligible_for_completion(self) -> bool:
        """Check if enrollment is eligible for completion."""
        return (
            self.status == EnrollmentStatus.ENROLLED and
            self.grade_points is not None and
            self.grade_points >= 1.0  # Minimum D grade
        )
    
    def can_drop(self) -> Tuple[bool, str]:
        """Check if student can drop this enrollment."""
        if self.status != EnrollmentStatus.ENROLLED:
            return False, f"Cannot drop enrollment with status: {self.status}"
        
        # Add business logic for drop deadlines, etc.
        return True, "Can drop"
    
    def complete_enrollment(self, final_grade: str, grade_points: float) -> None:
        """Complete the enrollment with final grade."""
        if not self.is_eligible_for_completion():
            raise ValueError("Enrollment is not eligible for completion")
        
        self.grade = final_grade
        self.grade_points = grade_points
        self.status = EnrollmentStatus.COMPLETED


class Attendance(BaseModel):
    """
    Attendance records for students in courses.
    
    Tracks daily attendance status for students in specific courses
    with proper validation and business logic.
    """
    
    __tablename__ = "attendance"

    # Student and course
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    
    # Attendance details
    attendance_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)
    notes = Column(Text)
    
    # Recorded by
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Database constraints and indexes
    __table_args__ = (
        UniqueConstraint('student_id', 'course_id', 'attendance_date', name='unique_daily_attendance'),
        CheckConstraint(
            f"status IN ('{AttendanceStatus.PRESENT}', '{AttendanceStatus.ABSENT}', "
            f"'{AttendanceStatus.LATE}', '{AttendanceStatus.EXCUSED}')", 
            name='valid_attendance_status'
        ),
        Index('idx_attendance_student', 'student_id'),
        Index('idx_attendance_course', 'course_id'),
        Index('idx_attendance_date', 'attendance_date'),
        Index('idx_attendance_status', 'status'),
    )
    
    # Relationships
    student = relationship("Profile", back_populates="attendance_records", foreign_keys=[student_id])
    course = relationship("Course", back_populates="attendance_records")
    recorder = relationship("Profile", foreign_keys=[recorded_by])
    
    # Validation methods
    @validates('status')
    def validate_status(self, key, status):
        """Validate attendance status."""
        valid_statuses = [s.value for s in AttendanceStatus]
        if status not in valid_statuses:
            raise ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return status
    
    def __repr__(self):
        return f"<Attendance(id={self.id}, student_id={self.student_id}, date={self.attendance_date}, status={self.status})>"
    
    # Business logic properties
    @property
    def student_name(self) -> str:
        """Get student name."""
        return self.student.full_name if self.student else "Unknown Student"
    
    @property
    def course_name(self) -> str:
        """Get course name."""
        return self.course.course_name if self.course else "Unknown Course"
    
    @property
    def recorder_name(self) -> str:
        """Get recorder name."""
        return self.recorder.full_name if self.recorder else "System"
    
    @property
    def is_present(self) -> bool:
        """Check if student was present (including late)."""
        return self.status in [AttendanceStatus.PRESENT, AttendanceStatus.LATE]
    
    @property
    def is_excused(self) -> bool:
        """Check if absence was excused."""
        return self.status == AttendanceStatus.EXCUSED
    
    # Business logic methods
    def can_modify(self, user_id: str) -> Tuple[bool, str]:
        """Check if attendance record can be modified by user."""
        if self.recorded_by == user_id:
            return True, "Can modify own record"
        
        # Add logic for admin/instructor permissions
        return False, "Insufficient permissions"
    
    def update_status(self, new_status: str, notes: Optional[str] = None, user_id: Optional[str] = None) -> None:
        """Update attendance status with validation."""
        can_modify, reason = self.can_modify(user_id) if user_id else (True, "System update")
        
        if not can_modify:
            raise ValueError(f"Cannot modify attendance: {reason}")
        
        self.status = new_status
        if notes:
            self.notes = notes


class Grade(BaseModel):
    """
    Grade records for student assessments.
    
    Tracks individual grades for assignments, exams, and other assessments
    with comprehensive calculation and validation capabilities.
    """
    
    __tablename__ = "grades"

    # Student and course (using consistent naming)
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    assignment_id = Column(UUID(as_uuid=True))  # Reference to assignment (if implemented)
    
    # Grade information
    grade = Column(Numeric, nullable=False)
    max_grade = Column(Numeric, nullable=False)
    feedback = Column(Text)
    
    # Graded by
    graded_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Database constraints and indexes
    __table_args__ = (
        CheckConstraint("grade >= 0", name='non_negative_grade'),
        CheckConstraint("max_grade > 0", name='positive_max_grade'),
        CheckConstraint("grade <= max_grade", name='grade_within_max'),
        Index('idx_grade_student', 'student_id'),
        Index('idx_grade_course', 'course_id'),
        Index('idx_grade_assignment', 'assignment_id'),
        Index('idx_grade_grader', 'graded_by'),
    )
    
    # Relationships
    student = relationship("Profile", foreign_keys=[student_id])
    course = relationship("Course", back_populates="grades")
    grader = relationship("Profile", foreign_keys=[graded_by])
    
    # Validation methods
    @validates('grade')
    def validate_grade(self, key, grade):
        """Validate grade is non-negative."""
        if grade is not None and grade < 0:
            raise ValidationError("Grade cannot be negative")
        return grade
    
    @validates('max_grade')
    def validate_max_grade(self, key, max_grade):
        """Validate max grade is positive."""
        if max_grade is not None and max_grade <= 0:
            raise ValidationError("Maximum grade must be positive")
        return max_grade
    
    def __repr__(self):
        return f"<Grade(id={self.id}, student_id={self.student_id}, grade={self.grade}/{self.max_grade})>"
    
    # Business logic properties
    @property
    def percentage(self) -> float:
        """Calculate grade percentage with proper decimal handling."""
        if not self.grade or not self.max_grade or self.max_grade <= 0:
            return 0.0
        
        # Use Decimal for precise calculations
        grade_decimal = Decimal(str(self.grade))
        max_grade_decimal = Decimal(str(self.max_grade))
        percentage = (grade_decimal / max_grade_decimal) * 100
        
        # Round to 2 decimal places
        return float(percentage.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
    
    @property
    def is_passing(self) -> bool:
        """Check if the grade is passing (>= 60%)."""
        return self.percentage >= 60.0
    
    @property
    def letter_grade(self) -> str:
        """Get letter grade based on percentage."""
        percentage = self.percentage
        if percentage >= 90:
            return GradeScale.A
        elif percentage >= 80:
            return GradeScale.B
        elif percentage >= 70:
            return GradeScale.C
        elif percentage >= 60:
            return GradeScale.D
        else:
            return GradeScale.F
    
    @property
    def gpa_points(self) -> float:
        """Calculate GPA points for this grade."""
        grade_points = {
            GradeScale.A: 4.0,
            GradeScale.B: 3.0,
            GradeScale.C: 2.0,
            GradeScale.D: 1.0,
            GradeScale.F: 0.0
        }
        return grade_points.get(self.letter_grade, 0.0)
    
    @property
    def student_name(self) -> str:
        """Get student name."""
        return self.student.full_name if self.student else "Unknown Student"
    
    @property
    def course_name(self) -> str:
        """Get course name."""
        return self.course.course_name if self.course else "Unknown Course"
    
    @property
    def grader_name(self) -> str:
        """Get grader name."""
        return self.grader.full_name if self.grader else "System"
    
    # Business logic methods
    def can_modify(self, user_id: str) -> Tuple[bool, str]:
        """Check if grade can be modified by user."""
        if self.graded_by == user_id:
            return True, "Can modify own grade entry"
        
        # Add logic for admin/instructor permissions
        return False, "Insufficient permissions"
    
    def update_grade(self, new_grade: float, feedback: Optional[str] = None, user_id: Optional[str] = None) -> None:
        """Update grade with validation."""
        can_modify, reason = self.can_modify(user_id) if user_id else (True, "System update")
        
        if not can_modify:
            raise ValueError(f"Cannot modify grade: {reason}")
        
        if new_grade < 0 or new_grade > self.max_grade:
            raise ValueError(f"Grade must be between 0 and {self.max_grade}")
        
        self.grade = new_grade
        if feedback is not None:
            self.feedback = feedback
