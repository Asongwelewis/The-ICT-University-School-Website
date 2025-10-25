"""
Profile repository for user profile operations.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, Query
from sqlalchemy import and_, or_, func
from uuid import UUID
import logging

from app.models.profiles import Profile, UserRole
from .base import BaseRepository

logger = logging.getLogger(__name__)


class ProfileSpecification:
    """Specification pattern for Profile queries."""
    
    @staticmethod
    def is_active() -> Any:
        """Specification for active profiles."""
        return Profile.is_active == True
    
    @staticmethod
    def has_role(role: str) -> Any:
        """Specification for profiles with specific role."""
        return Profile.role == role
    
    @staticmethod
    def has_roles(roles: List[str]) -> Any:
        """Specification for profiles with any of the specified roles."""
        return Profile.role.in_(roles)
    
    @staticmethod
    def in_department(department: str) -> Any:
        """Specification for profiles in specific department."""
        return Profile.department == department
    
    @staticmethod
    def name_contains(name: str) -> Any:
        """Specification for profiles with name containing text."""
        return Profile.full_name.ilike(f"%{name}%")
    
    @staticmethod
    def email_contains(email: str) -> Any:
        """Specification for profiles with email containing text."""
        return Profile.email.ilike(f"%{email}%")


class ProfileRepository(BaseRepository[Profile]):
    """Repository for Profile model operations."""
    
    def __init__(self, db: Session):
        super().__init__(Profile, db)
        self.spec = ProfileSpecification()
    
    # Core lookup methods with error handling
    def get_by_email(self, email: str) -> Optional[Profile]:
        """
        Get profile by email address.
        
        Args:
            email: Email address to search for
            
        Returns:
            Profile if found, None otherwise
            
        Raises:
            ValueError: If email is invalid
        """
        if not email or '@' not in email:
            raise ValueError("Invalid email format")
        
        try:
            return self.db.query(Profile).filter(Profile.email == email.lower().strip()).first()
        except Exception as e:
            logger.error(f"Error getting profile by email {email}: {e}")
            raise
    
    def get_by_student_id(self, student_id: str) -> Optional[Profile]:
        """
        Get profile by student ID.
        
        Args:
            student_id: Student ID to search for
            
        Returns:
            Profile if found, None otherwise
            
        Raises:
            ValueError: If student_id is empty
        """
        if not student_id or not student_id.strip():
            raise ValueError("Student ID cannot be empty")
        
        try:
            return self.db.query(Profile).filter(Profile.student_id == student_id.strip()).first()
        except Exception as e:
            logger.error(f"Error getting profile by student ID {student_id}: {e}")
            raise
    
    def get_by_employee_id(self, employee_id: str) -> Optional[Profile]:
        """
        Get profile by employee ID.
        
        Args:
            employee_id: Employee ID to search for
            
        Returns:
            Profile if found, None otherwise
            
        Raises:
            ValueError: If employee_id is empty
        """
        if not employee_id or not employee_id.strip():
            raise ValueError("Employee ID cannot be empty")
        
        try:
            return self.db.query(Profile).filter(Profile.employee_id == employee_id.strip()).first()
        except Exception as e:
            logger.error(f"Error getting profile by employee ID {employee_id}: {e}")
            raise
    
    # Role-based queries using specifications
    def get_by_role(self, role: str) -> List[Profile]:
        """
        Get all profiles with a specific role.
        
        Args:
            role: User role to filter by
            
        Returns:
            List of profiles with the specified role
            
        Raises:
            ValueError: If role is invalid
        """
        if role not in [r.value for r in UserRole]:
            raise ValueError(f"Invalid role: {role}. Must be one of: {[r.value for r in UserRole]}")
        
        try:
            return self.db.query(Profile).filter(self.spec.has_role(role)).all()
        except Exception as e:
            logger.error(f"Error getting profiles by role {role}: {e}")
            raise
    
    def get_active_profiles(self, limit: Optional[int] = None) -> List[Profile]:
        """
        Get all active profiles with optional limit.
        
        Args:
            limit: Maximum number of profiles to return
            
        Returns:
            List of active profiles
        """
        try:
            query = self.db.query(Profile).filter(self.spec.is_active())
            if limit:
                query = query.limit(limit)
            return query.all()
        except Exception as e:
            logger.error(f"Error getting active profiles: {e}")
            raise
    
    def get_students(self, active_only: bool = True) -> List[Profile]:
        """
        Get all student profiles.
        
        Args:
            active_only: If True, return only active students
            
        Returns:
            List of student profiles
        """
        try:
            query = self.db.query(Profile).filter(self.spec.has_role(UserRole.STUDENT.value))
            if active_only:
                query = query.filter(self.spec.is_active())
            return query.all()
        except Exception as e:
            logger.error(f"Error getting student profiles: {e}")
            raise
    
    def get_staff(self, active_only: bool = True) -> List[Profile]:
        """
        Get all staff profiles (non-students).
        
        Args:
            active_only: If True, return only active staff
            
        Returns:
            List of staff profiles
        """
        try:
            query = self.db.query(Profile).filter(self.spec.has_roles(UserRole.get_staff_roles()))
            if active_only:
                query = query.filter(self.spec.is_active())
            return query.all()
        except Exception as e:
            logger.error(f"Error getting staff profiles: {e}")
            raise
    
    def get_admins(self, active_only: bool = True) -> List[Profile]:
        """
        Get all admin profiles.
        
        Args:
            active_only: If True, return only active admins
            
        Returns:
            List of admin profiles
        """
        try:
            query = self.db.query(Profile).filter(self.spec.has_roles(UserRole.get_admin_roles()))
            if active_only:
                query = query.filter(self.spec.is_active())
            return query.all()
        except Exception as e:
            logger.error(f"Error getting admin profiles: {e}")
            raise
    
    # Search and filtering methods
    def search_by_name(self, name: str, limit: Optional[int] = 50) -> List[Profile]:
        """
        Search profiles by name (case-insensitive).
        
        Args:
            name: Name to search for
            limit: Maximum number of results to return
            
        Returns:
            List of profiles matching the name search
            
        Raises:
            ValueError: If name is empty
        """
        if not name or not name.strip():
            raise ValueError("Search name cannot be empty")
        
        try:
            query = self.db.query(Profile).filter(self.spec.name_contains(name.strip()))
            if limit:
                query = query.limit(limit)
            return query.all()
        except Exception as e:
            logger.error(f"Error searching profiles by name {name}: {e}")
            raise
    
    def search_profiles(self, 
                       name: Optional[str] = None,
                       email: Optional[str] = None,
                       role: Optional[str] = None,
                       department: Optional[str] = None,
                       active_only: bool = True,
                       limit: Optional[int] = 50) -> List[Profile]:
        """
        Advanced search for profiles with multiple criteria.
        
        Args:
            name: Name to search for (partial match)
            email: Email to search for (partial match)
            role: Specific role to filter by
            department: Department to filter by
            active_only: If True, return only active profiles
            limit: Maximum number of results to return
            
        Returns:
            List of profiles matching the search criteria
        """
        try:
            query = self.db.query(Profile)
            
            # Apply filters based on provided criteria
            if name:
                query = query.filter(self.spec.name_contains(name))
            if email:
                query = query.filter(self.spec.email_contains(email))
            if role:
                query = query.filter(self.spec.has_role(role))
            if department:
                query = query.filter(self.spec.in_department(department))
            if active_only:
                query = query.filter(self.spec.is_active())
            
            if limit:
                query = query.limit(limit)
                
            return query.all()
        except Exception as e:
            logger.error(f"Error in advanced profile search: {e}")
            raise
    
    def get_by_department(self, department: str, active_only: bool = True) -> List[Profile]:
        """
        Get profiles by department.
        
        Args:
            department: Department name to filter by
            active_only: If True, return only active profiles
            
        Returns:
            List of profiles in the specified department
            
        Raises:
            ValueError: If department is empty
        """
        if not department or not department.strip():
            raise ValueError("Department cannot be empty")
        
        try:
            query = self.db.query(Profile).filter(self.spec.in_department(department.strip()))
            if active_only:
                query = query.filter(self.spec.is_active())
            return query.all()
        except Exception as e:
            logger.error(f"Error getting profiles by department {department}: {e}")
            raise
    
    # Profile management methods
    def activate_profile(self, profile_id: UUID) -> Optional[Profile]:
        """
        Activate a profile.
        
        Args:
            profile_id: ID of the profile to activate
            
        Returns:
            Updated profile if successful, None otherwise
        """
        try:
            return self.update(profile_id, {"is_active": True})
        except Exception as e:
            logger.error(f"Error activating profile {profile_id}: {e}")
            raise
    
    def deactivate_profile(self, profile_id: UUID) -> Optional[Profile]:
        """
        Deactivate a profile.
        
        Args:
            profile_id: ID of the profile to deactivate
            
        Returns:
            Updated profile if successful, None otherwise
        """
        try:
            return self.update(profile_id, {"is_active": False})
        except Exception as e:
            logger.error(f"Error deactivating profile {profile_id}: {e}")
            raise
    
    def bulk_update_department(self, profile_ids: List[UUID], new_department: str) -> int:
        """
        Bulk update department for multiple profiles.
        
        Args:
            profile_ids: List of profile IDs to update
            new_department: New department name
            
        Returns:
            Number of profiles updated
        """
        if not profile_ids:
            return 0
        
        try:
            updated_count = self.db.query(Profile).filter(
                Profile.id.in_(profile_ids)
            ).update(
                {"department": new_department},
                synchronize_session=False
            )
            self.db.commit()
            return updated_count
        except Exception as e:
            logger.error(f"Error bulk updating department: {e}")
            self.db.rollback()
            raise
    
    # Statistics and analytics methods
    def get_profile_statistics(self) -> Dict[str, Any]:
        """
        Get comprehensive profile statistics.
        
        Returns:
            Dictionary containing various profile statistics
        """
        try:
            stats = {}
            
            # Total counts
            stats['total_profiles'] = self.db.query(Profile).count()
            stats['active_profiles'] = self.db.query(Profile).filter(self.spec.is_active()).count()
            stats['inactive_profiles'] = stats['total_profiles'] - stats['active_profiles']
            
            # Role distribution
            role_counts = self.db.query(
                Profile.role, 
                func.count(Profile.id).label('count')
            ).group_by(Profile.role).all()
            stats['role_distribution'] = {role: count for role, count in role_counts}
            
            # Department distribution
            dept_counts = self.db.query(
                Profile.department, 
                func.count(Profile.id).label('count')
            ).filter(
                Profile.department.isnot(None)
            ).group_by(Profile.department).all()
            stats['department_distribution'] = {dept: count for dept, count in dept_counts}
            
            return stats
        except Exception as e:
            logger.error(f"Error getting profile statistics: {e}")
            raise
    
    def get_departments(self) -> List[str]:
        """
        Get list of all unique departments.
        
        Returns:
            List of department names
        """
        try:
            departments = self.db.query(Profile.department).filter(
                Profile.department.isnot(None)
            ).distinct().all()
            return [dept[0] for dept in departments if dept[0]]
        except Exception as e:
            logger.error(f"Error getting departments: {e}")
            raise