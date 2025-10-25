"""
HR models for employee management and leave requests.
Improved version with enums, validation, and business logic.
"""

from typing import Optional
from datetime import datetime, date
from enum import Enum
from sqlalchemy import Column, String, Numeric, Boolean, Date, Text, ForeignKey, Integer, DateTime, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, validates
from .base import BaseModel


class EmploymentType(str, Enum):
    """Employment type enumeration."""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERN = "intern"
    
    @classmethod
    def get_all_types(cls) -> list[str]:
        """Get all employment types."""
        return [e.value for e in cls]


class LeaveType(str, Enum):
    """Leave type enumeration."""
    ANNUAL = "annual"
    SICK = "sick"
    MATERNITY = "maternity"
    PATERNITY = "paternity"
    EMERGENCY = "emergency"
    UNPAID = "unpaid"
    
    @classmethod
    def get_all_types(cls) -> list[str]:
        """Get all leave types."""
        return [e.value for e in cls]
    
    @classmethod
    def get_paid_leave_types(cls) -> list[str]:
        """Get paid leave types."""
        return [cls.ANNUAL.value, cls.SICK.value, cls.MATERNITY.value, cls.PATERNITY.value]


class LeaveStatus(str, Enum):
    """Leave request status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    
    @classmethod
    def get_all_statuses(cls) -> list[str]:
        """Get all leave statuses."""
        return [e.value for e in cls]
    
    @classmethod
    def get_active_statuses(cls) -> list[str]:
        """Get statuses that represent active leave requests."""
        return [cls.PENDING.value, cls.APPROVED.value]


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
    employment_type = Column(String, nullable=False, default=EmploymentType.FULL_TIME.value)
    
    # Management hierarchy
    manager_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Table constraints
    __table_args__ = (
        CheckConstraint(
            employment_type.in_(EmploymentType.get_all_types()),
            name='valid_employment_type'
        ),
        CheckConstraint(
            'salary >= 0 OR salary IS NULL',
            name='positive_salary'
        ),
        CheckConstraint(
            'hire_date <= CURRENT_DATE',
            name='valid_hire_date'
        ),
    )
    
    # Relationships
    profile = relationship("Profile", back_populates="employee_record", foreign_keys=[id])
    manager = relationship("Profile", foreign_keys=[manager_id])
    leave_requests = relationship("LeaveRequest", back_populates="employee", lazy='dynamic')
    
    # Validation methods
    @validates('employment_type')
    def validate_employment_type(self, key, employment_type):
        """Validate employment type is valid."""
        if employment_type not in EmploymentType.get_all_types():
            raise ValueError(f"Invalid employment type: {employment_type}")
        return employment_type
    
    @validates('salary')
    def validate_salary(self, key, salary):
        """Validate salary is non-negative."""
        if salary is not None and salary < 0:
            raise ValueError("Salary must be non-negative")
        return salary
    
    @validates('hire_date')
    def validate_hire_date(self, key, hire_date):
        """Validate hire date is not in the future."""
        if hire_date and hire_date > date.today():
            raise ValueError("Hire date cannot be in the future")
        return hire_date
    
    @validates('employee_number')
    def validate_employee_number(self, key, employee_number):
        """Validate employee number format."""
        if not employee_number or len(employee_number.strip()) == 0:
            raise ValueError("Employee number is required")
        return employee_number.strip().upper()
    
    def __repr__(self):
        return f"<Employee(id={self.id}, number={self.employee_number}, position={self.position})>"
    
    # Properties
    @property
    def full_name(self) -> Optional[str]:
        """Get employee full name from profile."""
        return self.profile.full_name if self.profile else None
    
    @property
    def display_name(self) -> str:
        """Get display name with fallback."""
        return self.full_name or f"Employee #{self.employee_number}"
    
    @property
    def manager_name(self) -> Optional[str]:
        """Get manager name."""
        return self.manager.full_name if self.manager else None
    
    @property
    def is_manager(self) -> bool:
        """Check if employee is a manager (has direct reports)."""
        from sqlalchemy import func
        return self.query.session.query(
            func.count(Employee.id)
        ).filter(Employee.manager_id == self.id).scalar() > 0
    
    @property
    def employment_type_enum(self) -> EmploymentType:
        """Get employment type as enum."""
        return EmploymentType(self.employment_type)
    
    # Business logic methods
    def get_leave_balance(self, leave_type: LeaveType, year: Optional[int] = None) -> int:
        """
        Get remaining leave balance for a specific leave type and year.
        
        Args:
            leave_type: Type of leave to check
            year: Year to check (defaults to current year)
            
        Returns:
            Remaining leave days
        """
        if year is None:
            year = date.today().year
        
        # Get total allocated leave days based on employment type and leave type
        allocated_days = self._get_allocated_leave_days(leave_type)
        
        # Calculate used leave days for the year
        used_days = sum(
            lr.duration_days for lr in self.leave_requests
            if (lr.leave_type == leave_type.value and 
                lr.status == LeaveStatus.APPROVED.value and
                lr.start_date.year == year)
        )
        
        return max(0, allocated_days - used_days)
    
    def _get_allocated_leave_days(self, leave_type: LeaveType) -> int:
        """Get allocated leave days based on employment type and leave type."""
        # Business rules for leave allocation
        if self.employment_type_enum == EmploymentType.FULL_TIME:
            if leave_type == LeaveType.ANNUAL:
                return 21  # 21 days annual leave
            elif leave_type == LeaveType.SICK:
                return 10  # 10 days sick leave
        elif self.employment_type_enum == EmploymentType.PART_TIME:
            if leave_type == LeaveType.ANNUAL:
                return 15  # Prorated annual leave
            elif leave_type == LeaveType.SICK:
                return 7   # Prorated sick leave
        elif self.employment_type_enum in [EmploymentType.CONTRACT, EmploymentType.INTERN]:
            # Contract and intern employees might have different rules
            return 0
        
        return 0
    
    def can_approve_leave(self, leave_request: 'LeaveRequest') -> bool:
        """Check if this employee can approve a leave request."""
        return (leave_request.employee.manager_id == self.id or 
                self.profile.role in ['hr_personnel', 'system_admin'])


class LeaveRequest(BaseModel):
    """Leave request model for employee time off."""
    
    __tablename__ = "leave_requests"
    
    # Employee and leave details
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    leave_type = Column(String, nullable=False)
    
    # Leave period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days_requested = Column(Integer, nullable=False)
    reason = Column(Text)
    
    # Approval workflow
    status = Column(String, nullable=False, default=LeaveStatus.PENDING.value)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    approved_at = Column(DateTime(timezone=True))
    comments = Column(Text)
    
    # Table constraints
    __table_args__ = (
        CheckConstraint(
            leave_type.in_(LeaveType.get_all_types()),
            name='valid_leave_type'
        ),
        CheckConstraint(
            status.in_(LeaveStatus.get_all_statuses()),
            name='valid_leave_status'
        ),
        CheckConstraint(
            'start_date <= end_date',
            name='valid_date_range'
        ),
        CheckConstraint(
            'days_requested > 0',
            name='positive_days_requested'
        ),
    )
    
    # Relationships
    employee = relationship("Employee", back_populates="leave_requests")
    approver = relationship("Profile", foreign_keys=[approved_by])
    
    # Validation methods
    @validates('leave_type')
    def validate_leave_type(self, key, leave_type):
        """Validate leave type is valid."""
        if leave_type not in LeaveType.get_all_types():
            raise ValueError(f"Invalid leave type: {leave_type}")
        return leave_type
    
    @validates('status')
    def validate_status(self, key, status):
        """Validate status is valid."""
        if status not in LeaveStatus.get_all_statuses():
            raise ValueError(f"Invalid leave status: {status}")
        return status
    
    @validates('start_date', 'end_date')
    def validate_date_range(self, key, value):
        """Validate date range is logical."""
        if key == 'end_date' and self.start_date and value < self.start_date:
            raise ValueError("End date must be after or equal to start date")
        if key == 'start_date' and value < date.today():
            raise ValueError("Leave cannot be requested for past dates")
        return value
    
    @validates('days_requested')
    def validate_days_requested(self, key, days):
        """Validate days requested is reasonable."""
        if days <= 0:
            raise ValueError("Days requested must be positive")
        if days > 365:  # Business rule: max 1 year leave
            raise ValueError("Leave cannot exceed 365 days")
        return days
    
    def __repr__(self):
        return f"<LeaveRequest(id={self.id}, employee_id={self.employee_id}, type={self.leave_type}, status={self.status})>"
    
    # Properties
    @property
    def employee_name(self) -> Optional[str]:
        """Get employee name."""
        return self.employee.full_name if self.employee else None
    
    @property
    def approver_name(self) -> Optional[str]:
        """Get approver name."""
        return self.approver.full_name if self.approver else None
    
    @property
    def duration_days(self) -> int:
        """Calculate leave duration in days."""
        if self.start_date and self.end_date:
            return (self.end_date - self.start_date).days + 1
        return 0
    
    @property
    def is_pending(self) -> bool:
        """Check if leave request is pending approval."""
        return self.status == LeaveStatus.PENDING.value
    
    @property
    def is_approved(self) -> bool:
        """Check if leave request is approved."""
        return self.status == LeaveStatus.APPROVED.value
    
    @property
    def is_active(self) -> bool:
        """Check if leave request is active (pending or approved)."""
        return self.status in LeaveStatus.get_active_statuses()
    
    @property
    def leave_type_enum(self) -> LeaveType:
        """Get leave type as enum."""
        return LeaveType(self.leave_type)
    
    @property
    def status_enum(self) -> LeaveStatus:
        """Get status as enum."""
        return LeaveStatus(self.status)
    
    @property
    def can_be_modified(self) -> bool:
        """Check if leave request can be modified."""
        return (self.status == LeaveStatus.PENDING.value and 
                self.start_date > date.today())
    
    @property
    def can_be_cancelled(self) -> bool:
        """Check if leave request can be cancelled."""
        return (self.status in [LeaveStatus.PENDING.value, LeaveStatus.APPROVED.value] and
                self.start_date > date.today())
    
    # Business logic methods
    def approve(self, approver_id: str, comments: Optional[str] = None) -> None:
        """
        Approve the leave request.
        
        Args:
            approver_id: ID of the approving user
            comments: Optional approval comments
            
        Raises:
            ValueError: If leave request cannot be approved
        """
        if self.status != LeaveStatus.PENDING.value:
            raise ValueError(f"Cannot approve leave request with status: {self.status}")
        
        # Check if employee has sufficient leave balance
        leave_type_enum = LeaveType(self.leave_type)
        if leave_type_enum in LeaveType.get_paid_leave_types():
            balance = self.employee.get_leave_balance(leave_type_enum, self.start_date.year)
            if balance < self.duration_days:
                raise ValueError(f"Insufficient leave balance. Available: {balance} days, Requested: {self.duration_days} days")
        
        self.status = LeaveStatus.APPROVED.value
        self.approved_by = approver_id
        self.approved_at = datetime.utcnow()
        self.comments = comments
    
    def reject(self, approver_id: str, reason: str) -> None:
        """
        Reject the leave request.
        
        Args:
            approver_id: ID of the rejecting user
            reason: Reason for rejection
            
        Raises:
            ValueError: If leave request cannot be rejected
        """
        if self.status != LeaveStatus.PENDING.value:
            raise ValueError(f"Cannot reject leave request with status: {self.status}")
        
        if not reason or len(reason.strip()) == 0:
            raise ValueError("Rejection reason is required")
        
        self.status = LeaveStatus.REJECTED.value
        self.approved_by = approver_id
        self.approved_at = datetime.utcnow()
        self.comments = reason
    
    def cancel(self, reason: Optional[str] = None) -> None:
        """
        Cancel the leave request.
        
        Args:
            reason: Optional cancellation reason
            
        Raises:
            ValueError: If leave request cannot be cancelled
        """
        if not self.can_be_cancelled:
            raise ValueError(f"Cannot cancel leave request with status: {self.status}")
        
        self.status = LeaveStatus.CANCELLED.value
        if reason:
            self.comments = f"Cancelled: {reason}"
    
    def update_request(self, **kwargs) -> None:
        """
        Update leave request details.
        
        Args:
            **kwargs: Fields to update
            
        Raises:
            ValueError: If leave request cannot be modified
        """
        if not self.can_be_modified:
            raise ValueError("Leave request cannot be modified in current state")
        
        # Update allowed fields
        allowed_fields = ['start_date', 'end_date', 'days_requested', 'reason', 'leave_type']
        for field, value in kwargs.items():
            if field in allowed_fields and hasattr(self, field):
                setattr(self, field, value)


# Database indexes for performance
Index('idx_employee_number', Employee.employee_number)
Index('idx_employee_manager', Employee.manager_id)
Index('idx_employee_active', Employee.is_active)
Index('idx_employee_employment_type', Employee.employment_type)
Index('idx_leave_employee_status', LeaveRequest.employee_id, LeaveRequest.status)
Index('idx_leave_dates', LeaveRequest.start_date, LeaveRequest.end_date)
Index('idx_leave_type_status', LeaveRequest.leave_type, LeaveRequest.status)
Index('idx_leave_approved_by', LeaveRequest.approved_by)