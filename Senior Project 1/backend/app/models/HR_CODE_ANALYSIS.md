# HR Models Code Analysis & Improvements

## Overview
Analysis of the newly created `hr.py` models file focusing on code quality, maintainability, and best practices.

## 🔍 Current Code Assessment

### Strengths
- ✅ Clear separation of concerns with dedicated Employee and LeaveRequest models
- ✅ Good use of SQLAlchemy relationships and foreign keys
- ✅ Comprehensive property methods for computed values
- ✅ Proper inheritance from BaseModel
- ✅ Well-documented docstrings

### Areas for Improvement

## 1. **Code Smells & Issues**

### 1.1 Magic Strings (High Priority)
**Issue**: Employment types and leave statuses are hardcoded strings scattered throughout the code.

**Current Code:**
```python
employment_type = Column(String, default='full_time')  # full_time, part_time, contract, intern
status = Column(String, default='pending')  # pending, approved, rejected, cancelled
leave_type = Column(String, nullable=False)  # annual, sick, maternity, paternity, emergency, unpaid
```

**Recommended Solution:**
```python
from enum import Enum

class EmploymentType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERN = "intern"

class LeaveType(str, Enum):
    ANNUAL = "annual"
    SICK = "sick"
    MATERNITY = "maternity"
    PATERNITY = "paternity"
    EMERGENCY = "emergency"
    UNPAID = "unpaid"

class LeaveStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
```

**Benefits:**
- Type safety and IDE autocomplete
- Centralized constants management
- Prevents typos and invalid values
- Better maintainability

### 1.2 Missing Validation (Medium Priority)
**Issue**: No validation for business rules like date ranges, salary values, etc.

**Current Code:**
```python
start_date = Column(Date, nullable=False)
end_date = Column(Date, nullable=False)
salary = Column(Numeric(10, 2))
```

**Recommended Solution:**
```python
from sqlalchemy.orm import validates
from decimal import Decimal

@validates('start_date', 'end_date')
def validate_date_range(self, key, value):
    if key == 'end_date' and self.start_date and value < self.start_date:
        raise ValueError("End date must be after start date")
    return value

@validates('salary')
def validate_salary(self, key, salary):
    if salary is not None and salary < 0:
        raise ValueError("Salary must be non-negative")
    return salary

@validates('days_requested')
def validate_days_requested(self, key, days):
    if days <= 0:
        raise ValueError("Days requested must be positive")
    if days > 365:  # Business rule: max 1 year leave
        raise ValueError("Leave cannot exceed 365 days")
    return days
```

### 1.3 Inconsistent Error Handling (Medium Priority)
**Issue**: Property methods return default strings instead of handling None cases properly.

**Current Code:**
```python
@property
def full_name(self) -> str:
    return self.profile.full_name if self.profile else "Unknown Employee"
```

**Recommended Solution:**
```python
@property
def full_name(self) -> Optional[str]:
    return self.profile.full_name if self.profile else None

@property
def display_name(self) -> str:
    """Get display name with fallback."""
    return self.full_name or f"Employee #{self.employee_number}"
```

## 2. **Design Pattern Improvements**

### 2.1 Strategy Pattern for Leave Calculation
**Issue**: Leave duration calculation is simplistic and doesn't account for business days, holidays, etc.

**Recommended Solution:**
```python
from abc import ABC, abstractmethod
from datetime import date, timedelta

class LeaveDurationCalculator(ABC):
    @abstractmethod
    def calculate_duration(self, start_date: date, end_date: date, leave_type: LeaveType) -> int:
        pass

class BusinessDaysCalculator(LeaveDurationCalculator):
    def calculate_duration(self, start_date: date, end_date: date, leave_type: LeaveType) -> int:
        # Calculate business days excluding weekends
        current = start_date
        days = 0
        while current <= end_date:
            if current.weekday() < 5:  # Monday = 0, Sunday = 6
                days += 1
            current += timedelta(days=1)
        return days

class CalendarDaysCalculator(LeaveDurationCalculator):
    def calculate_duration(self, start_date: date, end_date: date, leave_type: LeaveType) -> int:
        return (end_date - start_date).days + 1

# In LeaveRequest model:
@property
def duration_days(self) -> int:
    if not (self.start_date and self.end_date):
        return 0
    
    calculator = self._get_duration_calculator()
    return calculator.calculate_duration(self.start_date, self.end_date, self.leave_type)

def _get_duration_calculator(self) -> LeaveDurationCalculator:
    # Business rule: sick leave uses calendar days, others use business days
    if self.leave_type in [LeaveType.SICK, LeaveType.MATERNITY, LeaveType.PATERNITY]:
        return CalendarDaysCalculator()
    return BusinessDaysCalculator()
```

### 2.2 Factory Pattern for Employee Creation
**Issue**: Employee creation logic might become complex with different employee types.

**Recommended Solution:**
```python
class EmployeeFactory:
    @staticmethod
    def create_employee(profile_id: str, employee_data: dict) -> Employee:
        employment_type = EmploymentType(employee_data.get('employment_type', EmploymentType.FULL_TIME))
        
        employee = Employee(
            id=profile_id,
            employee_number=employee_data['employee_number'],
            position=employee_data['position'],
            hire_date=employee_data['hire_date'],
            employment_type=employment_type,
            salary=employee_data.get('salary'),
            manager_id=employee_data.get('manager_id')
        )
        
        # Apply employment type specific configurations
        if employment_type == EmploymentType.INTERN:
            employee.salary = None  # Interns might not have salary
        elif employment_type == EmploymentType.CONTRACT:
            # Contract employees might have different rules
            pass
            
        return employee
```

## 3. **Best Practices Improvements**

### 3.1 Add Table Constraints
**Current Code:**
```python
__tablename__ = "employees"
```

**Recommended Solution:**
```python
__tablename__ = "employees"

__table_args__ = (
    CheckConstraint(
        employment_type.in_([e.value for e in EmploymentType]),
        name='valid_employment_type'
    ),
    CheckConstraint(
        'salary >= 0',
        name='positive_salary'
    ),
    CheckConstraint(
        'hire_date <= CURRENT_DATE',
        name='valid_hire_date'
    ),
)
```

### 3.2 Add Indexes for Performance
```python
from sqlalchemy import Index

# Add these after the class definition
Index('idx_employee_number', Employee.employee_number)
Index('idx_employee_manager', Employee.manager_id)
Index('idx_employee_active', Employee.is_active)
Index('idx_leave_employee_status', LeaveRequest.employee_id, LeaveRequest.status)
Index('idx_leave_dates', LeaveRequest.start_date, LeaveRequest.end_date)
```

### 3.3 Improve Type Hints
**Current Code:**
```python
@property
def duration_days(self) -> int:
```

**Recommended Solution:**
```python
from typing import Optional, Union
from datetime import date

@property
def duration_days(self) -> int:
    """Calculate leave duration in days."""
    
@property
def full_name(self) -> Optional[str]:
    """Get employee full name from profile."""
    
def approve_leave(self, approver_id: str, comments: Optional[str] = None) -> None:
    """Approve the leave request."""
```

## 4. **Maintainability Improvements**

### 4.1 Add Business Logic Methods
```python
class LeaveRequest(BaseModel):
    # ... existing code ...
    
    def approve(self, approver_id: str, comments: Optional[str] = None) -> None:
        """Approve the leave request."""
        if self.status != LeaveStatus.PENDING:
            raise ValueError(f"Cannot approve leave request with status: {self.status}")
        
        self.status = LeaveStatus.APPROVED
        self.approved_by = approver_id
        self.approved_at = datetime.utcnow()
        self.comments = comments
    
    def reject(self, approver_id: str, reason: str) -> None:
        """Reject the leave request."""
        if self.status != LeaveStatus.PENDING:
            raise ValueError(f"Cannot reject leave request with status: {self.status}")
        
        self.status = LeaveStatus.REJECTED
        self.approved_by = approver_id
        self.approved_at = datetime.utcnow()
        self.comments = reason
    
    def cancel(self) -> None:
        """Cancel the leave request."""
        if self.status not in [LeaveStatus.PENDING, LeaveStatus.APPROVED]:
            raise ValueError(f"Cannot cancel leave request with status: {self.status}")
        
        self.status = LeaveStatus.CANCELLED
    
    def can_be_modified(self) -> bool:
        """Check if leave request can be modified."""
        return self.status == LeaveStatus.PENDING and self.start_date > date.today()
```

### 4.2 Add Audit Trail Support
```python
from .base import AuditMixin

class Employee(BaseModel, AuditMixin):
    # ... existing code ...
    
class LeaveRequest(BaseModel, AuditMixin):
    # ... existing code ...
```

## 5. **Performance Optimizations**

### 5.1 Lazy Loading Configuration
```python
# Optimize relationships for better performance
profile = relationship("Profile", back_populates="employee_record", foreign_keys=[id], lazy='select')
manager = relationship("Profile", foreign_keys=[manager_id], lazy='select')
leave_requests = relationship("LeaveRequest", back_populates="employee", lazy='dynamic')
```

### 5.2 Add Caching for Computed Properties
```python
from functools import cached_property

class Employee(BaseModel):
    # ... existing code ...
    
    @cached_property
    def total_leave_days_this_year(self) -> int:
        """Calculate total leave days taken this year."""
        from datetime import date
        current_year = date.today().year
        
        return sum(
            lr.duration_days for lr in self.leave_requests
            if lr.status == LeaveStatus.APPROVED 
            and lr.start_date.year == current_year
        )
```

## 6. **Security Considerations**

### 6.1 Add Row-Level Security Policies
```sql
-- Add these to your database migration
CREATE POLICY "employees_own_data" ON employees
    FOR ALL USING (
        auth.uid() = id OR 
        auth.uid() IN (
            SELECT manager_id FROM employees WHERE id = employees.id
        )
    );

CREATE POLICY "leave_requests_access" ON leave_requests
    FOR ALL USING (
        auth.uid() = employee_id OR
        auth.uid() IN (
            SELECT manager_id FROM employees WHERE id = leave_requests.employee_id
        )
    );
```

## 7. **Testing Improvements**

### 7.1 Add Model Tests
```python
# tests/test_hr_models.py
import pytest
from datetime import date, timedelta
from app.models.hr import Employee, LeaveRequest, EmploymentType, LeaveType, LeaveStatus

class TestEmployee:
    def test_employee_creation(self):
        employee = Employee(
            employee_number="EMP001",
            position="Developer",
            hire_date=date.today(),
            employment_type=EmploymentType.FULL_TIME
        )
        assert employee.employment_type == EmploymentType.FULL_TIME
    
    def test_salary_validation(self):
        with pytest.raises(ValueError):
            Employee(salary=-1000)

class TestLeaveRequest:
    def test_duration_calculation(self):
        leave = LeaveRequest(
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 5),
            leave_type=LeaveType.ANNUAL
        )
        assert leave.duration_days == 5
    
    def test_leave_approval_workflow(self):
        leave = LeaveRequest(status=LeaveStatus.PENDING)
        leave.approve("manager_id", "Approved")
        assert leave.status == LeaveStatus.APPROVED
        assert leave.approved_by == "manager_id"
```

## 📋 Implementation Priority

### High Priority (Implement First)
1. ✅ Add Enums for employment types and leave statuses
2. ✅ Add basic validation methods
3. ✅ Add business logic methods (approve, reject, cancel)
4. ✅ Add table constraints

### Medium Priority
1. ✅ Implement Strategy pattern for leave calculation
2. ✅ Add proper error handling
3. ✅ Add indexes for performance
4. ✅ Add audit trail support

### Low Priority (Future Enhancements)
1. ✅ Add Factory pattern for employee creation
2. ✅ Add caching for computed properties
3. ✅ Add comprehensive test suite
4. ✅ Add row-level security policies

## 🔄 Migration Strategy

1. **Phase 1**: Add enums and basic validation (backward compatible)
2. **Phase 2**: Add business logic methods and constraints
3. **Phase 3**: Implement design patterns and performance optimizations
4. **Phase 4**: Add comprehensive testing and security policies

This analysis provides a roadmap for improving the HR models while maintaining existing functionality and ensuring better maintainability, performance, and security.