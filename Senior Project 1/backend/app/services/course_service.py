"""
Course management service for academic operations.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID
from datetime import datetime

from app.repositories.academic_repository import CourseRepository
from app.schemas.academic import CourseCreate, CourseUpdate, CourseResponse
from app.models.academic import Course


class CourseService:
    """Service class for course management operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)
    
    async def create_course(self, course_data: CourseCreate) -> CourseResponse:
        """
        Create a new course with validation and conflict detection.
        
        Args:
            course_data: Course creation data
            
        Returns:
            Created course information
            
        Raises:
            ValueError: If validation fails or conflicts exist
        """
        try:
            # Check if course code already exists
            existing_course = self.course_repo.get_by_code(course_data.code)
            if existing_course:
                raise ValueError(f"Course with code '{course_data.code}' already exists")
            
            # Check for schedule conflicts
            if course_data.schedule and self.course_repo.check_schedule_conflict(course_data.schedule):
                raise ValueError("Schedule conflicts with existing courses")
            
            # Create course
            course_dict = course_data.dict()
            course_dict['created_at'] = datetime.utcnow()
            course_dict['updated_at'] = datetime.utcnow()
            
            db_course = self.course_repo.create(course_dict)
            
            return CourseResponse.from_orm(db_course)
            
        except IntegrityError as e:
            raise ValueError(f"Failed to create course: Database constraint violation")
        except Exception as e:
            raise ValueError(f"Failed to create course: {str(e)}")
    
    async def get_course(self, course_id: UUID) -> Optional[CourseResponse]:
        """Get a course by ID."""
        course = self.course_repo.get_by_id(course_id)
        return CourseResponse.from_orm(course) if course else None
    
    async def get_courses(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        search: Optional[str] = None,
        instructor_id: Optional[UUID] = None,
        active_only: bool = True
    ) -> List[CourseResponse]:
        """
        Get courses with filtering, pagination, and search.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Additional filters to apply
            search: Search term for course name/code
            instructor_id: Filter by instructor
            active_only: Only return active courses
            
        Returns:
            List of courses
        """
        try:
            if search:
                courses = self.course_repo.search_courses(search, skip, limit)
            elif instructor_id:
                courses = self.course_repo.get_by_instructor(instructor_id)
                courses = courses[skip:skip + limit]  # Apply pagination
            else:
                # Build filters
                query_filters = filters or {}
                if active_only:
                    query_filters['is_active'] = True
                
                courses = self.course_repo.get_all(
                    skip=skip, 
                    limit=limit, 
                    filters=query_filters,
                    order_by='created_at',
                    order_desc=True
                )
            
            return [CourseResponse.from_orm(course) for course in courses]
            
        except Exception as e:
            raise ValueError(f"Failed to retrieve courses: {str(e)}")
    
    async def update_course(
        self, 
        course_id: UUID, 
        course_update: CourseUpdate
    ) -> Optional[CourseResponse]:
        """
        Update an existing course.
        
        Args:
            course_id: ID of the course to update
            course_update: Update data
            
        Returns:
            Updated course information or None if not found
            
        Raises:
            ValueError: If validation fails or conflicts exist
        """
        try:
            # Check if course exists
            existing_course = self.course_repo.get_by_id(course_id)
            if not existing_course:
                return None
            
            # Prepare update data
            update_data = course_update.dict(exclude_unset=True)
            
            # Check for schedule conflicts if schedule is being updated
            if 'schedule' in update_data and update_data['schedule']:
                if self.course_repo.check_schedule_conflict(
                    update_data['schedule'], 
                    exclude_course_id=course_id
                ):
                    raise ValueError("Schedule conflicts with existing courses")
            
            update_data['updated_at'] = datetime.utcnow()
            
            # Update course
            updated_course = self.course_repo.update(course_id, update_data)
            
            return CourseResponse.from_orm(updated_course) if updated_course else None
            
        except IntegrityError:
            raise ValueError("Failed to update course: Database constraint violation")
        except Exception as e:
            raise ValueError(f"Failed to update course: {str(e)}")
    
    async def delete_course(self, course_id: UUID, soft_delete: bool = True) -> bool:
        """
        Delete a course (soft delete by default).
        
        Args:
            course_id: ID of the course to delete
            soft_delete: Whether to soft delete (set is_active=False) or hard delete
            
        Returns:
            True if deleted successfully, False if not found
        """
        try:
            if soft_delete:
                return self.course_repo.soft_delete(course_id)
            else:
                return self.course_repo.delete(course_id)
        except Exception as e:
            raise ValueError(f"Failed to delete course: {str(e)}")
    
    async def enroll_student(self, course_id: UUID, student_id: UUID) -> bool:
        """
        Enroll a student in a course.
        
        Args:
            course_id: ID of the course
            student_id: ID of the student
            
        Returns:
            True if enrolled successfully
            
        Raises:
            ValueError: If course not found or enrollment fails
        """
        try:
            course = self.course_repo.get_by_id(course_id)
            if not course:
                raise ValueError("Course not found")
            
            if not course.is_active:
                raise ValueError("Cannot enroll in inactive course")
            
            success = self.course_repo.enroll_student(course_id, student_id)
            if not success:
                raise ValueError("Failed to enroll student")
            
            return True
            
        except Exception as e:
            raise ValueError(f"Failed to enroll student: {str(e)}")
    
    async def unenroll_student(self, course_id: UUID, student_id: UUID) -> bool:
        """
        Unenroll a student from a course.
        
        Args:
            course_id: ID of the course
            student_id: ID of the student
            
        Returns:
            True if unenrolled successfully
        """
        try:
            return self.course_repo.unenroll_student(course_id, student_id)
        except Exception as e:
            raise ValueError(f"Failed to unenroll student: {str(e)}")
    
    async def bulk_enroll_students(
        self, 
        course_id: UUID, 
        student_ids: List[UUID]
    ) -> Dict[str, Any]:
        """
        Enroll multiple students in a course.
        
        Args:
            course_id: ID of the course
            student_ids: List of student IDs to enroll
            
        Returns:
            Dictionary with enrollment results
        """
        try:
            course = self.course_repo.get_by_id(course_id)
            if not course:
                raise ValueError("Course not found")
            
            if not course.is_active:
                raise ValueError("Cannot enroll in inactive course")
            
            success = self.course_repo.bulk_enroll_students(course_id, student_ids)
            
            return {
                'success': success,
                'course_id': str(course_id),
                'enrolled_count': len(student_ids) if success else 0,
                'message': 'Students enrolled successfully' if success else 'Enrollment failed'
            }
            
        except Exception as e:
            raise ValueError(f"Failed to bulk enroll students: {str(e)}")
    
    async def get_student_courses(self, student_id: UUID) -> List[CourseResponse]:
        """
        Get all courses a student is enrolled in.
        
        Args:
            student_id: ID of the student
            
        Returns:
            List of courses the student is enrolled in
        """
        try:
            courses = self.course_repo.get_student_courses(student_id)
            return [CourseResponse.from_orm(course) for course in courses]
        except Exception as e:
            raise ValueError(f"Failed to get student courses: {str(e)}")
    
    async def get_instructor_courses(self, instructor_id: UUID) -> List[CourseResponse]:
        """
        Get all courses taught by an instructor.
        
        Args:
            instructor_id: ID of the instructor
            
        Returns:
            List of courses taught by the instructor
        """
        try:
            courses = self.course_repo.get_by_instructor(instructor_id)
            return [CourseResponse.from_orm(course) for course in courses]
        except Exception as e:
            raise ValueError(f"Failed to get instructor courses: {str(e)}")
    
    async def get_course_enrollment_count(self, course_id: UUID) -> int:
        """
        Get the number of students enrolled in a course.
        
        Args:
            course_id: ID of the course
            
        Returns:
            Number of enrolled students
        """
        try:
            course = self.course_repo.get_by_id(course_id)
            if not course:
                return 0
            
            return len(course.enrolled_students) if course.enrolled_students else 0
        except Exception:
            return 0
    
    async def check_schedule_conflicts(
        self, 
        schedule: List[Dict[str, Any]], 
        exclude_course_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """
        Check for schedule conflicts with existing courses.
        
        Args:
            schedule: Schedule to check
            exclude_course_id: Course ID to exclude from conflict check
            
        Returns:
            Dictionary with conflict information
        """
        try:
            has_conflict = self.course_repo.check_schedule_conflict(schedule, exclude_course_id)
            
            return {
                'has_conflict': has_conflict,
                'message': 'Schedule conflicts detected' if has_conflict else 'No conflicts found'
            }
        except Exception as e:
            raise ValueError(f"Failed to check schedule conflicts: {str(e)}")
    
    async def get_course_statistics(self) -> Dict[str, Any]:
        """
        Get overall course statistics.
        
        Returns:
            Dictionary with course statistics
        """
        try:
            total_courses = self.course_repo.count()
            active_courses = self.course_repo.count({'is_active': True})
            inactive_courses = total_courses - active_courses
            
            return {
                'total_courses': total_courses,
                'active_courses': active_courses,
                'inactive_courses': inactive_courses
            }
        except Exception as e:
            raise ValueError(f"Failed to get course statistics: {str(e)}")