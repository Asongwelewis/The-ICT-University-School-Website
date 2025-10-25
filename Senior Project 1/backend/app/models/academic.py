"""
Academic models for courses, enrollments, attendance, and grades.
"""

from sqlalchemy import Column, String, Integer, Numeric, Boolean, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel


class Course(BaseModel):
    """Course model for academic courses."""
    
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
    
    # Relationships
    department = relationship("Department", back_populates="courses")
    instructor = relationship("Profile", back_populates="courses_taught", foreign_keys=[instructor_id])
    enrollments = relationship("Enrollment", back_populates="course")
    attendance_records = relationship("Attendance", back_populates="course")
    grades = relationship("Grade", back_populates="course")
    
    def __repr__(self):
        return f"<Course(id={self.id}, code={self.course_code}, name={self.course_name})>"
    
    @property
    def enrolled_students_count(self) -> int:
        """Get count of enrolled students."""
        return len([e for e in self.enrollments if e.status == 'enrolled'])
    
    @property
    def instructor_name(self) -> str:
        """Get instructor name."""
        return self.instructor.full_name if self.instructor else "No Instructor"


class Enrollment(BaseModel):
    """Student enrollment in courses."""
    
    __tablename__ = "enrollments"

    # Student and course
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    
    # Enrollment details
    enrollment_date = Column(Date, server_default='now()')
    status = Column(String, default='enrolled')  # enrolled, completed, dropped, failed
    
    # Grading
    grade = Column(String)  # A, B, C, D, F
    grade_points = Column(Numeric(3, 2))  # GPA points
    
    # Relationships
    student = relationship("Profile", back_populates="enrollments", foreign_keys=[student_id])
    course = relationship("Course", back_populates="enrollments")
    
    def __repr__(self):
        return f"<Enrollment(id={self.id}, student_id={self.student_id}, course_id={self.course_id})>"
    
    @property
    def student_name(self) -> str:
        """Get student name."""
        return self.student.full_name if self.student else "Unknown Student"
    
    @property
    def course_name(self) -> str:
        """Get course name."""
        return self.course.course_name if self.course else "Unknown Course"


class Attendance(BaseModel):
    """Attendance records for students in courses."""
    
    __tablename__ = "attendance"

    # Student and course
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    
    # Attendance details
    attendance_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # present, absent, late, excused
    notes = Column(Text)
    
    # Recorded by
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Relationships
    student = relationship("Profile", back_populates="attendance_records", foreign_keys=[student_id])
    course = relationship("Course", back_populates="attendance_records")
    recorder = relationship("Profile", foreign_keys=[recorded_by])
    
    def __repr__(self):
        return f"<Attendance(id={self.id}, student_id={self.student_id}, date={self.attendance_date}, status={self.status})>"


class Grade(BaseModel):
    """Grade records for student assessments."""
    
    __tablename__ = "grades"

    # Student and course
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))  # Note: matches your schema
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    assignment_id = Column(UUID(as_uuid=True))  # Reference to assignment (if implemented)
    
    # Grade information
    grade = Column(Numeric)
    max_grade = Column(Numeric)
    feedback = Column(Text)
    
    # Graded by
    graded_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Relationships
    student = relationship("Profile", foreign_keys=[user_id])
    course = relationship("Course", back_populates="grades")
    grader = relationship("Profile", foreign_keys=[graded_by])
    
    def __repr__(self):
        return f"<Grade(id={self.id}, user_id={self.user_id}, grade={self.grade}/{self.max_grade})>"
    
    @property
    def percentage(self) -> float:
        """Calculate grade percentage."""
        if self.max_grade and self.max_grade > 0:
            return (float(self.grade) / float(self.max_grade)) * 100
        return 0.0