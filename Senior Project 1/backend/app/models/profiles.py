"""
Profile model for user information.

This module defines the Profile model that extends Supabase auth.users
with additional user information and role-based functionality.
"""

from typing import Optional, List
from enum import Enum
from sqlalchemy import Column, String, Boolean, Date, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, validates
from .base import Base, TimestampMixin, AuditMixin


class UserRole(str, Enum):
    """Enumeration of user roles in the system."""
    STUDENT = "student"
    ACADEMIC_STAFF = "academic_staff"
    HR_PERSONNEL = "hr_personnel"
    FINANCE_STAFF = "finance_staff"
    MARKETING_TEAM = "marketing_team"
    SYSTEM_ADMIN = "system_admin"
    
    @classmethod
    def get_staff_roles(cls) -> List[str]:
        """Get all staff roles (non-student roles)."""
        return [
            cls.ACADEMIC_STAFF.value,
            cls.HR_PERSONNEL.value,
            cls.FINANCE_STAFF.value,
            cls.MARKETING_TEAM.value,
            cls.SYSTEM_ADMIN.value,
        ]
    
    @classmethod
    def get_admin_roles(cls) -> List[str]:
        """Get administrative roles."""
        return [cls.SYSTEM_ADMIN.value, cls.HR_PERSONNEL.value]


class Profile(Base, TimestampMixin, AuditMixin):
    """
    Profile model extending Supabase auth.users.
    
    This model stores additional user information beyond what's provided
    by Supabase authentication, including role-based data and preferences.
    """
    
    __tablename__ = "profiles"

    # Primary key references auth.users(id)
    id = Column(UUID(as_uuid=True), primary_key=True)
    
    # Basic information
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    
    # Role and department
    role = Column(
        String(50), 
        nullable=False,
        index=True,
        doc="User role in the system"
    )
    department = Column(String(100), index=True)
    
    # Identification numbers
    student_id = Column(String(50), unique=True, index=True)
    employee_id = Column(String(50), unique=True, index=True)
    
    # Status and profile details
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    avatar_url = Column(String(500))
    date_of_birth = Column(Date)
    address = Column(Text)
    
    # Emergency contact information
    emergency_contact = Column(String(255))
    emergency_phone = Column(String(20))
    
    # Preferences and settings
    timezone = Column(String(50), default='UTC')
    language = Column(String(10), default='en')
    email_notifications = Column(Boolean, default=True)
    
    # Relationships (using string references to avoid circular imports)
    # Courses taught (for academic staff)
    courses_taught = relationship("Course", back_populates="instructor", foreign_keys="Course.instructor_id")
    
    # Course enrollments (for students)
    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="Enrollment.student_id")
    
    # Attendance records
    attendance_records = relationship("Attendance", back_populates="student", foreign_keys="Attendance.student_id")
    
    # Invoices (for students)
    invoices = relationship("Invoice", back_populates="student", foreign_keys="Invoice.student_id")
    
    # Payments made
    payments = relationship("Payment", back_populates="student", foreign_keys="Payment.student_id")
    
    # Employee record (if applicable)
    employee_record = relationship("Employee", back_populates="profile", uselist=False, foreign_keys="Employee.id")
    
    # Marketing leads assigned
    assigned_leads = relationship("Lead", back_populates="assigned_to_user", foreign_keys="Lead.assigned_to")
    
    # Campaigns created
    campaigns_created = relationship("Campaign", back_populates="creator", foreign_keys="Campaign.created_by")
    
    # New relationships for announcements, timetables, and notes
    announcements = relationship("Announcement", back_populates="author")
    timetables = relationship("Timetable", back_populates="instructor")
    course_notes = relationship("CourseNote", back_populates="author")
    
    # Add table constraints
    __table_args__ = (
        CheckConstraint(
            role.in_([role.value for role in UserRole]),
            name='valid_role'
        ),
        CheckConstraint(
            "student_id IS NOT NULL OR role != 'student'",
            name='student_requires_student_id'
        ),
        CheckConstraint(
            "employee_id IS NOT NULL OR role = 'student'",
            name='staff_requires_employee_id'
        ),
    )
    
    # Validation methods
    @validates('email')
    def validate_email(self, key, email):
        """Validate email format."""
        if not email or '@' not in email:
            raise ValueError("Invalid email format")
        return email.lower().strip()
    
    @validates('role')
    def validate_role(self, key, role):
        """Validate role is one of the allowed values."""
        if role not in [r.value for r in UserRole]:
            raise ValueError(f"Invalid role: {role}")
        return role
    
    @validates('phone')
    def validate_phone(self, key, phone):
        """Validate and format phone number."""
        if phone:
            # Remove all non-digit characters except +
            cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
            if len(cleaned) < 10:
                raise ValueError("Phone number too short")
            return cleaned
        return phone
    
    # Properties for role checking
    @property
    def is_student(self) -> bool:
        """Check if profile is a student."""
        return self.role == UserRole.STUDENT.value
    
    @property
    def is_staff(self) -> bool:
        """Check if profile is staff member."""
        return self.role in UserRole.get_staff_roles()
    
    @property
    def is_admin(self) -> bool:
        """Check if profile has administrative privileges."""
        return self.role in UserRole.get_admin_roles()
    
    @property
    def display_name(self) -> str:
        """Get display name for the user."""
        return self.full_name or self.email
    
    @property
    def identification_number(self) -> Optional[str]:
        """Get the appropriate identification number based on role."""
        return self.student_id if self.is_student else self.employee_id
    
    # Business logic methods
    def can_access_module(self, module: str) -> bool:
        """
        Check if user can access a specific module based on their role.
        
        Args:
            module: Module name (academic, finance, hr, marketing, admin)
            
        Returns:
            Boolean indicating access permission
        """
        role_permissions = {
            UserRole.STUDENT.value: ['academic', 'finance'],
            UserRole.ACADEMIC_STAFF.value: ['academic'],
            UserRole.HR_PERSONNEL.value: ['hr', 'admin'],
            UserRole.FINANCE_STAFF.value: ['finance', 'academic'],
            UserRole.MARKETING_TEAM.value: ['marketing'],
            UserRole.SYSTEM_ADMIN.value: ['academic', 'finance', 'hr', 'marketing', 'admin'],
        }
        
        return module in role_permissions.get(self.role, [])
    
    def get_dashboard_url(self) -> str:
        """Get the appropriate dashboard URL based on user role."""
        role_dashboards = {
            UserRole.STUDENT.value: '/student/dashboard',
            UserRole.ACADEMIC_STAFF.value: '/academic/dashboard',
            UserRole.HR_PERSONNEL.value: '/hr/dashboard',
            UserRole.FINANCE_STAFF.value: '/finance/dashboard',
            UserRole.MARKETING_TEAM.value: '/marketing/dashboard',
            UserRole.SYSTEM_ADMIN.value: '/admin/dashboard',
        }
        
        return role_dashboards.get(self.role, '/dashboard')
    
    def update_last_activity(self) -> None:
        """Update the user's last activity timestamp."""
        # This would be implemented when we add activity tracking
        pass
    
    def __repr__(self) -> str:
        """String representation of the profile."""
        return f"<Profile(id={self.id}, email={self.email}, role={self.role})>"
    
    def __str__(self) -> str:
        """Human-readable string representation."""
        return f"{self.display_name} ({self.role})"