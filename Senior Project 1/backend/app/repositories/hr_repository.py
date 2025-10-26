"""
HR repository for employee and leave request operations.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from uuid import UUID
from datetime import date

from app.models.hr import Employee, LeaveRequest
from .base import BaseRepository


class HRRepository:
    """Repository for HR operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.employee_repo = BaseRepository(Employee, db)
        self.leave_repo = BaseRepository(LeaveRequest, db)
    
    # Employee operations
    def create_employee(self, employee_data: Dict[str, Any]) -> Employee:
        """Create a new employee record."""
        return self.employee_repo.create(employee_data)
    
    def get_employee(self, employee_id: UUID) -> Optional[Employee]:
        """Get employee by ID."""
        return self.employee_repo.get(employee_id)
    
    def get_employee_by_number(self, employee_number: str) -> Optional[Employee]:
        """Get employee by employee number."""
        return self.db.query(Employee).filter(Employee.employee_number == employee_number).first()
    
    def get_all_employees(self, is_active: bool = True) -> List[Employee]:
        """Get all employees."""
        return self.db.query(Employee).filter(Employee.is_active == is_active).all()
    
    def get_employees_by_position(self, position: str) -> List[Employee]:
        """Get employees by position."""
        return self.db.query(Employee).filter(Employee.position == position).all()
    
    def get_employees_by_manager(self, manager_id: UUID) -> List[Employee]:
        """Get employees under a manager."""
        return self.db.query(Employee).filter(Employee.manager_id == manager_id).all()
    
    def update_employee(self, employee_id: UUID, employee_data: Dict[str, Any]) -> Optional[Employee]:
        """Update employee record."""
        return self.employee_repo.update(employee_id, employee_data)
    
    # Leave Request operations
    def create_leave_request(self, leave_data: Dict[str, Any]) -> LeaveRequest:
        """Create a new leave request."""
        return self.leave_repo.create(leave_data)
    
    def get_leave_request(self, leave_id: UUID) -> Optional[LeaveRequest]:
        """Get leave request by ID."""
        return self.leave_repo.get(leave_id)
    
    def get_employee_leave_requests(self, employee_id: UUID) -> List[LeaveRequest]:
        """Get leave requests for an employee."""
        return self.db.query(LeaveRequest).filter(LeaveRequest.employee_id == employee_id).all()
    
    def get_pending_leave_requests(self) -> List[LeaveRequest]:
        """Get all pending leave requests."""
        return self.db.query(LeaveRequest).filter(LeaveRequest.status == 'pending').all()
    
    def approve_leave_request(self, leave_id: UUID, approver_id: UUID, comments: str = None) -> Optional[LeaveRequest]:
        """Approve a leave request."""
        update_data = {
            "status": "approved",
            "approved_by": approver_id,
            "approved_at": func.now()
        }
        if comments:
            update_data["comments"] = comments
        
        return self.leave_repo.update(leave_id, update_data)
    
    def reject_leave_request(self, leave_id: UUID, approver_id: UUID, comments: str = None) -> Optional[LeaveRequest]:
        """Reject a leave request."""
        update_data = {
            "status": "rejected",
            "approved_by": approver_id,
            "approved_at": func.now()
        }
        if comments:
            update_data["comments"] = comments
        
        return self.leave_repo.update(leave_id, update_data)
    
    def get_leave_summary(self, employee_id: UUID, year: int = None) -> Dict[str, Any]:
        """Get leave summary for an employee."""
        query = self.db.query(LeaveRequest).filter(
            and_(
                LeaveRequest.employee_id == employee_id,
                LeaveRequest.status == 'approved'
            )
        )
        
        if year:
            query = query.filter(func.extract('year', LeaveRequest.start_date) == year)
        
        leave_requests = query.all()
        
        summary = {
            "total_days_taken": sum(lr.days_requested for lr in leave_requests),
            "by_type": {}
        }
        
        for leave_request in leave_requests:
            leave_type = leave_request.leave_type
            if leave_type not in summary["by_type"]:
                summary["by_type"][leave_type] = 0
            summary["by_type"][leave_type] += leave_request.days_requested
        
        return summary