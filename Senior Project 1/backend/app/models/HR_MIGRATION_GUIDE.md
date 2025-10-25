# HR Models Migration Guide

## Overview
This guide helps you migrate from the current `hr.py` to the improved version with better validation, enums, and business logic.

## 🔄 Migration Steps

### Step 1: Backup Current Implementation
```bash
# Backup the current file
cp app/models/hr.py app/models/hr_backup.py
```

### Step 2: Replace with Improved Version
```bash
# Replace current implementation
cp app/models/hr_improved.py app/models/hr.py
```

### Step 3: Update Database Schema (if needed)

#### Add Check Constraints
```sql
-- Add employment type constraint
ALTER TABLE employees 
ADD CONSTRAINT valid_employment_type 
CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern'));

-- Add salary constraint
ALTER TABLE employees 
ADD CONSTRAINT positive_salary 
CHECK (salary >= 0 OR salary IS NULL);

-- Add hire date constraint
ALTER TABLE employees 
ADD CONSTRAINT valid_hire_date 
CHECK (hire_date <= CURRENT_DATE);

-- Add leave type constraint
ALTER TABLE leave_requests 
ADD CONSTRAINT valid_leave_type 
CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid'));

-- Add leave status constraint
ALTER TABLE leave_requests 
ADD CONSTRAINT valid_leave_status 
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

-- Add date range constraint
ALTER TABLE leave_requests 
ADD CONSTRAINT valid_date_range 
CHECK (start_date <= end_date);

-- Add positive days constraint
ALTER TABLE leave_requests 
ADD CONSTRAINT positive_days_requested 
CHECK (days_requested > 0);
```

#### Add Performance Indexes
```sql
-- Employee indexes
CREATE INDEX IF NOT EXISTS idx_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employee_manager ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employee_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employee_employment_type ON employees(employment_type);

-- Leave request indexes
CREATE INDEX IF NOT EXISTS idx_leave_employee_status ON leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_type_status ON leave_requests(leave_type, status);
CREATE INDEX IF NOT EXISTS idx_leave_approved_by ON leave_requests(approved_by);
```

### Step 4: Update Import Statements

#### In your API endpoints or services:
```python
# Old imports
from app.models.hr import Employee, LeaveRequest

# New imports (same, but now with enums available)
from app.models.hr import Employee, LeaveRequest, EmploymentType, LeaveType, LeaveStatus
```

### Step 5: Update Code Using the Models

#### Before (using magic strings):
```python
# Creating an employee
employee = Employee(
    employee_number="EMP001",
    position="Developer",
    hire_date=date.today(),
    employment_type="full_time"  # Magic string
)

# Creating a leave request
leave_request = LeaveRequest(
    employee_id=employee.id,
    leave_type="annual",  # Magic string
    start_date=date(2024, 6, 1),
    end_date=date(2024, 6, 5),
    days_requested=5,
    status="pending"  # Magic string
)
```

#### After (using enums and improved methods):
```python
# Creating an employee
employee = Employee(
    employee_number="EMP001",
    position="Developer",
    hire_date=date.today(),
    employment_type=EmploymentType.FULL_TIME  # Type-safe enum
)

# Creating a leave request
leave_request = LeaveRequest(
    employee_id=employee.id,
    leave_type=LeaveType.ANNUAL,  # Type-safe enum
    start_date=date(2024, 6, 1),
    end_date=date(2024, 6, 5),
    days_requested=5,
    status=LeaveStatus.PENDING  # Type-safe enum
)

# Using business logic methods
try:
    leave_request.approve(approver_id="manager_123", comments="Approved for vacation")
except ValueError as e:
    print(f"Cannot approve leave: {e}")

# Check leave balance
balance = employee.get_leave_balance(LeaveType.ANNUAL, 2024)
print(f"Remaining annual leave: {balance} days")
```

## 🧪 Testing the Migration

### Step 1: Create Test Script
```python
# test_hr_migration.py
from datetime import date
from app.models.hr import Employee, LeaveRequest, EmploymentType, LeaveType, LeaveStatus

def test_employee_creation():
    """Test employee creation with new enums."""
    employee = Employee(
        employee_number="TEST001",
        position="Test Developer",
        hire_date=date.today(),
        employment_type=EmploymentType.FULL_TIME,
        salary=50000
    )
    
    assert employee.employment_type == EmploymentType.FULL_TIME.value
    assert employee.employment_type_enum == EmploymentType.FULL_TIME
    print("✅ Employee creation test passed")

def test_leave_request_workflow():
    """Test leave request approval workflow."""
    leave_request = LeaveRequest(
        leave_type=LeaveType.ANNUAL,
        start_date=date(2024, 6, 1),
        end_date=date(2024, 6, 5),
        days_requested=5,
        status=LeaveStatus.PENDING
    )
    
    # Test approval
    leave_request.approve("manager_123", "Approved for vacation")
    assert leave_request.is_approved
    assert leave_request.approver_id == "manager_123"
    print("✅ Leave request workflow test passed")

def test_validation():
    """Test validation methods."""
    try:
        # This should raise a validation error
        employee = Employee(salary=-1000)
        assert False, "Should have raised validation error"
    except ValueError:
        print("✅ Salary validation test passed")
    
    try:
        # This should raise a validation error
        leave_request = LeaveRequest(
            start_date=date(2024, 6, 5),
            end_date=date(2024, 6, 1),  # End before start
            days_requested=5
        )
        assert False, "Should have raised validation error"
    except ValueError:
        print("✅ Date range validation test passed")

if __name__ == "__main__":
    test_employee_creation()
    test_leave_request_workflow()
    test_validation()
    print("🎉 All migration tests passed!")
```

### Step 2: Run Tests
```bash
python test_hr_migration.py
```

## 🔧 API Endpoint Updates

### Before:
```python
@app.post("/employees/")
def create_employee(employee_data: dict):
    employee = Employee(**employee_data)
    # No validation, magic strings
    return employee
```

### After:
```python
from pydantic import BaseModel

class EmployeeCreateRequest(BaseModel):
    employee_number: str
    position: str
    hire_date: date
    employment_type: EmploymentType
    salary: Optional[float] = None

@app.post("/employees/")
def create_employee(employee_data: EmployeeCreateRequest):
    try:
        employee = Employee(
            employee_number=employee_data.employee_number,
            position=employee_data.position,
            hire_date=employee_data.hire_date,
            employment_type=employee_data.employment_type,
            salary=employee_data.salary
        )
        # Automatic validation through SQLAlchemy validators
        return employee
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 🚨 Breaking Changes

### 1. Enum Values
- **Impact**: Code using hardcoded strings will need updates
- **Solution**: Replace strings with enum values or use `.value` property

### 2. Validation Errors
- **Impact**: Invalid data that was previously accepted will now raise errors
- **Solution**: Ensure all data meets validation requirements

### 3. Property Return Types
- **Impact**: Some properties now return `Optional[str]` instead of `str`
- **Solution**: Handle `None` values appropriately

## 🔄 Rollback Plan

If issues arise, you can rollback:

```bash
# Restore original file
cp app/models/hr_backup.py app/models/hr.py

# Remove database constraints (if added)
# Run rollback SQL scripts
```

## 📋 Post-Migration Checklist

- [ ] All tests pass
- [ ] API endpoints work correctly
- [ ] Database constraints are applied
- [ ] Performance indexes are created
- [ ] Documentation is updated
- [ ] Team is trained on new enums and methods

## 🎯 Benefits After Migration

1. **Type Safety**: Enums prevent invalid values
2. **Better Validation**: Automatic data validation
3. **Business Logic**: Built-in approval workflows
4. **Performance**: Database indexes improve query speed
5. **Maintainability**: Cleaner, more organized code
6. **Error Prevention**: Constraints prevent data corruption

This migration provides a solid foundation for the HR module with improved reliability and maintainability.