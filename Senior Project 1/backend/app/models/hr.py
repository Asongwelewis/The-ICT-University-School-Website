"""
HR models for employee management and leave requests.
"""

from sqlalchemy import Column, String, Numeric, Boolean, Date, Text, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel


class Employee(BaseModel):
    """Employee model extending Profile for staff members."""
    
    __tablename__ = "employees"

    # Primary key references profiles(id) - override BaseModel's UUID generation
    id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), primary_key=True)
    
    # Employee information
    employee_number = Column(String, nullable=False, unique=True)
    position = Column(String, nullable=False)
    hire_date = Column(Date, nullable=False)
    salary = Column(Numeric(10, 2))
    employment_type = Column(String, default='full_time')  # full_time, part_time, contract, intern
    
    # Management hierarchy
    manager_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    profile = relationship("Profile", back_populates="employee_record", foreign_keys=[id], post_update=True)
    manager = relationship("Profile", foreign_keys=[manager_id], post_update=True)
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    
    def __repr__(self):
        return f"<Employee(id={self.id}, number={self.employee_number}, position={self.position})>"
    
    @property
    def full_name(self) -> str:
        """Get employee full name from profile."""
        return self.profile.full_name if self.profile else "Unknown Employee"
    
    @property
    def manager_name(self) -> str:
        """Get manager name."""
        return self.manager.full_name if self.manager else "No Manager"


class LeaveRequest(BaseModel):
    """Leave request model for employee time off."""
    
    __tablename__ = "leave_requests"
    
    # Employee and leave details
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"))
    leave_type = Column(String, nullable=False)  # annual, sick, maternity, paternity, emergency, unpaid
    
    # Leave period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days_requested = Column(Integer, nullable=False)
    reason = Column(Text)
    
    # Approval workflow
    status = Column(String, default='pending')  # pending, approved, rejected, cancelled
    approved_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    approved_at = Column(DateTime(timezone=True))
    comments = Column(Text)
    
    # Relationships
    employee = relationship("Employee", back_populates="leave_requests")
    approver = relationship("Profile", foreign_keys=[approved_by])
    
    def __repr__(self):
        return f"<LeaveRequest(id={self.id}, employee_id={self.employee_id}, type={self.leave_type}, status={self.status})>"
    
    @property
    def employee_name(self) -> str:
        """Get employee name."""
        return self.employee.full_name if self.employee else "Unknown Employee"
    
    @property
    def approver_name(self) -> str:
        """Get approver name."""
        return self.approver.full_name if self.approver else "Not Approved"
    
    @property
    def duration_days(self) -> int:
        """Calculate leave duration in days."""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0
    
    @property
    def is_pending(self) -> bool:
        """Check if leave request is pending approval."""
        return self.status == 'pending'
    
    @property
    def is_approved(self) -> bool:
        """Check if leave request is approved."""
        return self.status == 'approved'