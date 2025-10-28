"""
Attendance tracking service for academic operations.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, date, timedelta

from app.repositories.academic_repository import AttendanceRepository, CourseRepository
from app.schemas.academic import AttendanceCreate, AttendanceResponse
from app.models.academic import Attendance


class AttendanceService:
    """Service class for attendance tracking operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.attendance_repo = AttendanceRepository(db)
        self.course_repo = CourseRepository(db)
    
    async def record_attendance(
        self, 
        attendance_data: AttendanceCreate, 
        recorded_by: UUID
    ) -> AttendanceResponse:
        """
        Record attendance for a student with validation.
        
        Args:
            attendance_data: Attendance data to record
            recorded_by: ID of the user recording attendance
            
        Returns:
            Recorded attendance information
            
        Raises:
            ValueError: If validation fails
        """
        try:
            # Validate course exists and is active
            course = self.course_repo.get_by_id(attendance_data.course_id)
            if not course:
                raise ValueError("Course not found")
            
            if not course.is_active:
                raise ValueError("Cannot record attendance for inactive course")
            
            # Validate student is enrolled in the course
            if not course.enrolled_students or attendance_data.student_id not in course.enrolled_students:
                raise ValueError("Student is not enrolled in this course")
            
            # Check for duplicate attendance record for the same date
            existing_attendance = self._get_existing_attendance(
                attendance_data.student_id,
                attendance_data.course_id,
                attendance_data.date.date()
            )
            
            if existing_attendance:
                raise ValueError("Attendance already recorded for this student on this date")
            
            # Create attendance record
            attendance_dict = attendance_data.dict()
            attendance_dict.update({
                'recorded_by': recorded_by,
                'recorded_at': datetime.utcnow()
            })
            
            db_attendance = self.attendance_repo.create(attendance_dict)
            
            return AttendanceResponse.from_orm(db_attendance)
            
        except IntegrityError:
            raise ValueError("Failed to record attendance: Database constraint violation")
        except Exception as e:
            raise ValueError(f"Failed to record attendance: {str(e)}")
    
    async def update_attendance(
        self, 
        attendance_id: UUID, 
        status: str,
        updated_by: UUID
    ) -> Optional[AttendanceResponse]:
        """
        Update an existing attendance record.
        
        Args:
            attendance_id: ID of the attendance record to update
            status: New attendance status
            updated_by: ID of the user updating the record
            
        Returns:
            Updated attendance information or None if not found
        """
        try:
            # Validate status
            allowed_statuses = ['present', 'absent', 'late', 'excused']
            if status.lower() not in allowed_statuses:
                raise ValueError(f"Invalid status. Must be one of: {', '.join(allowed_statuses)}")
            
            update_data = {
                'status': status.lower(),
                'recorded_by': updated_by,
                'recorded_at': datetime.utcnow()
            }
            
            updated_attendance = self.attendance_repo.update(attendance_id, update_data)
            
            return AttendanceResponse.from_orm(updated_attendance) if updated_attendance else None
            
        except Exception as e:
            raise ValueError(f"Failed to update attendance: {str(e)}")
    
    async def delete_attendance(self, attendance_id: UUID) -> bool:
        """
        Delete an attendance record.
        
        Args:
            attendance_id: ID of the attendance record to delete
            
        Returns:
            True if deleted successfully, False if not found
        """
        try:
            return self.attendance_repo.delete(attendance_id)
        except Exception as e:
            raise ValueError(f"Failed to delete attendance: {str(e)}")
    
    async def get_student_attendance(
        self, 
        student_id: UUID, 
        course_id: Optional[UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[AttendanceResponse]:
        """
        Get attendance records for a student.
        
        Args:
            student_id: ID of the student
            course_id: Optional course ID to filter by
            start_date: Optional start date for filtering
            end_date: Optional end date for filtering
            
        Returns:
            List of attendance records
        """
        try:
            attendance_records = self.attendance_repo.get_student_attendance(
                student_id, course_id, start_date, end_date
            )
            return [AttendanceResponse.from_orm(record) for record in attendance_records]
        except Exception as e:
            raise ValueError(f"Failed to get student attendance: {str(e)}")
    
    async def get_course_attendance(
        self, 
        course_id: UUID, 
        attendance_date: Optional[date] = None
    ) -> List[AttendanceResponse]:
        """
        Get attendance records for a course.
        
        Args:
            course_id: ID of the course
            attendance_date: Optional specific date to filter by
            
        Returns:
            List of attendance records
        """
        try:
            attendance_records = self.attendance_repo.get_course_attendance(course_id, attendance_date)
            return [AttendanceResponse.from_orm(record) for record in attendance_records]
        except Exception as e:
            raise ValueError(f"Failed to get course attendance: {str(e)}")
    
    async def calculate_attendance_rate(
        self, 
        student_id: UUID, 
        course_id: Optional[UUID] = None
    ) -> float:
        """
        Calculate attendance rate for a student.
        
        Args:
            student_id: ID of the student
            course_id: Optional course ID to filter by
            
        Returns:
            Attendance rate as percentage
        """
        try:
            return self.attendance_repo.calculate_attendance_rate(student_id, course_id)
        except Exception as e:
            raise ValueError(f"Failed to calculate attendance rate: {str(e)}")
    
    async def get_attendance_analytics(self, course_id: UUID) -> Dict[str, Any]:
        """
        Get attendance analytics for a course.
        
        Args:
            course_id: ID of the course
            
        Returns:
            Dictionary with attendance analytics
        """
        try:
            return self.attendance_repo.get_attendance_analytics(course_id)
        except Exception as e:
            raise ValueError(f"Failed to get attendance analytics: {str(e)}")
    
    async def bulk_record_attendance(
        self, 
        attendance_data_list: List[AttendanceCreate], 
        recorded_by: UUID
    ) -> List[AttendanceResponse]:
        """
        Record multiple attendance records in bulk.
        
        Args:
            attendance_data_list: List of attendance data to record
            recorded_by: ID of the user recording attendance
            
        Returns:
            List of recorded attendance records
        """
        try:
            # Validate all attendance records before creating any
            for attendance_data in attendance_data_list:
                course = self.course_repo.get_by_id(attendance_data.course_id)
                if not course:
                    raise ValueError(f"Course {attendance_data.course_id} not found")
                
                if not course.is_active:
                    raise ValueError(f"Course {attendance_data.course_id} is inactive")
                
                if not course.enrolled_students or attendance_data.student_id not in course.enrolled_students:
                    raise ValueError(f"Student {attendance_data.student_id} not enrolled in course {attendance_data.course_id}")
                
                # Check for duplicates
                existing_attendance = self._get_existing_attendance(
                    attendance_data.student_id,
                    attendance_data.course_id,
                    attendance_data.date.date()
                )
                
                if existing_attendance:
                    raise ValueError(f"Attendance already recorded for student {attendance_data.student_id} on {attendance_data.date.date()}")
            
            # Prepare attendance data for bulk creation
            attendance_dict_list = []
            for attendance_data in attendance_data_list:
                attendance_dict = attendance_data.dict()
                attendance_dict.update({
                    'recorded_by': recorded_by,
                    'recorded_at': datetime.utcnow()
                })
                attendance_dict_list.append(attendance_dict)
            
            # Bulk create attendance records
            db_attendance_records = self.attendance_repo.bulk_create_attendance(attendance_dict_list)
            
            return [AttendanceResponse.from_orm(record) for record in db_attendance_records]
            
        except Exception as e:
            raise ValueError(f"Failed to bulk record attendance: {str(e)}")
    
    async def get_absent_students(
        self, 
        course_id: UUID, 
        attendance_date: date
    ) -> List[UUID]:
        """
        Get list of students who were absent on a specific date.
        
        Args:
            course_id: ID of the course
            attendance_date: Date to check for absences
            
        Returns:
            List of student IDs who were absent
        """
        try:
            return self.attendance_repo.get_absent_students(course_id, attendance_date)
        except Exception as e:
            raise ValueError(f"Failed to get absent students: {str(e)}")
    
    async def generate_attendance_report(
        self, 
        course_id: UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive attendance report for a course.
        
        Args:
            course_id: ID of the course
            start_date: Optional start date for the report
            end_date: Optional end date for the report
            
        Returns:
            Dictionary with attendance report data
        """
        try:
            # Get course information
            course = self.course_repo.get_by_id(course_id)
            if not course:
                raise ValueError("Course not found")
            
            # Set default date range if not provided
            if not end_date:
                end_date = date.today()
            if not start_date:
                start_date = end_date - timedelta(days=30)  # Last 30 days
            
            # Get all attendance records for the period
            all_attendance = []
            current_date = start_date
            while current_date <= end_date:
                daily_attendance = self.attendance_repo.get_course_attendance(course_id, current_date)
                all_attendance.extend(daily_attendance)
                current_date += timedelta(days=1)
            
            # Calculate statistics
            total_records = len(all_attendance)
            if total_records == 0:
                return {
                    'course_id': str(course_id),
                    'course_name': course.name,
                    'period': {
                        'start_date': start_date.isoformat(),
                        'end_date': end_date.isoformat()
                    },
                    'total_records': 0,
                    'overall_attendance_rate': 0,
                    'student_attendance_rates': {},
                    'daily_attendance': {},
                    'status_distribution': {}
                }
            
            # Status distribution
            status_distribution = {}
            for record in all_attendance:
                status = record.status
                status_distribution[status] = status_distribution.get(status, 0) + 1
            
            # Calculate overall attendance rate
            present_count = status_distribution.get('present', 0) + status_distribution.get('late', 0)
            overall_attendance_rate = (present_count / total_records) * 100
            
            # Student-wise attendance rates
            student_attendance_rates = {}
            if course.enrolled_students:
                for student_id in course.enrolled_students:
                    student_records = [r for r in all_attendance if r.student_id == student_id]
                    if student_records:
                        student_present = len([r for r in student_records if r.status in ['present', 'late']])
                        student_rate = (student_present / len(student_records)) * 100
                        student_attendance_rates[str(student_id)] = round(student_rate, 2)
                    else:
                        student_attendance_rates[str(student_id)] = 0.0
            
            # Daily attendance breakdown
            daily_attendance = {}
            current_date = start_date
            while current_date <= end_date:
                date_str = current_date.isoformat()
                daily_records = [r for r in all_attendance if r.date.date() == current_date]
                
                daily_stats = {
                    'present': 0,
                    'absent': 0,
                    'late': 0,
                    'excused': 0,
                    'total': len(daily_records)
                }
                
                for record in daily_records:
                    daily_stats[record.status] += 1
                
                daily_attendance[date_str] = daily_stats
                current_date += timedelta(days=1)
            
            return {
                'course_id': str(course_id),
                'course_name': course.name,
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'total_records': total_records,
                'overall_attendance_rate': round(overall_attendance_rate, 2),
                'student_attendance_rates': student_attendance_rates,
                'daily_attendance': daily_attendance,
                'status_distribution': status_distribution
            }
            
        except Exception as e:
            raise ValueError(f"Failed to generate attendance report: {str(e)}")
    
    async def send_absence_notifications(
        self, 
        course_id: UUID, 
        attendance_date: date
    ) -> Dict[str, Any]:
        """
        Generate absence notifications for students who were absent.
        
        Args:
            course_id: ID of the course
            attendance_date: Date to check for absences
            
        Returns:
            Dictionary with notification information
        """
        try:
            absent_students = await self.get_absent_students(course_id, attendance_date)
            
            # Get course information
            course = self.course_repo.get_by_id(course_id)
            if not course:
                raise ValueError("Course not found")
            
            notifications = []
            for student_id in absent_students:
                # Calculate attendance rate for context
                attendance_rate = await self.calculate_attendance_rate(student_id, course_id)
                
                notification = {
                    'student_id': str(student_id),
                    'course_id': str(course_id),
                    'course_name': course.name,
                    'absence_date': attendance_date.isoformat(),
                    'current_attendance_rate': round(attendance_rate, 2),
                    'message': f"Absence recorded for {course.name} on {attendance_date}",
                    'priority': 'high' if attendance_rate < 75 else 'normal'
                }
                notifications.append(notification)
            
            return {
                'course_id': str(course_id),
                'course_name': course.name,
                'absence_date': attendance_date.isoformat(),
                'absent_count': len(absent_students),
                'notifications': notifications
            }
            
        except Exception as e:
            raise ValueError(f"Failed to send absence notifications: {str(e)}")
    
    async def validate_attendance_data(self, attendance_data: AttendanceCreate) -> Dict[str, Any]:
        """
        Validate attendance data before recording.
        
        Args:
            attendance_data: Attendance data to validate
            
        Returns:
            Dictionary with validation results
        """
        try:
            validation_errors = []
            
            # Check course exists and is active
            course = self.course_repo.get_by_id(attendance_data.course_id)
            if not course:
                validation_errors.append("Course not found")
            elif not course.is_active:
                validation_errors.append("Course is inactive")
            elif not course.enrolled_students or attendance_data.student_id not in course.enrolled_students:
                validation_errors.append("Student is not enrolled in this course")
            
            # Validate status
            allowed_statuses = ['present', 'absent', 'late', 'excused']
            if attendance_data.status.lower() not in allowed_statuses:
                validation_errors.append(f"Invalid status. Must be one of: {', '.join(allowed_statuses)}")
            
            # Check for duplicate attendance
            existing_attendance = self._get_existing_attendance(
                attendance_data.student_id,
                attendance_data.course_id,
                attendance_data.date.date()
            )
            
            if existing_attendance:
                validation_errors.append("Attendance already recorded for this student on this date")
            
            # Validate date (shouldn't be in the future)
            if attendance_data.date.date() > date.today():
                validation_errors.append("Attendance date cannot be in the future")
            
            return {
                'is_valid': len(validation_errors) == 0,
                'errors': validation_errors
            }
            
        except Exception as e:
            return {
                'is_valid': False,
                'errors': [f"Validation error: {str(e)}"]
            }
    
    def _get_existing_attendance(
        self, 
        student_id: UUID, 
        course_id: UUID, 
        attendance_date: date
    ) -> Optional[Attendance]:
        """
        Check if attendance record already exists for a student on a specific date.
        
        Args:
            student_id: ID of the student
            course_id: ID of the course
            attendance_date: Date to check
            
        Returns:
            Existing attendance record or None
        """
        try:
            return self.db.query(Attendance).filter(
                Attendance.student_id == student_id,
                Attendance.course_id == course_id,
                func.date(Attendance.date) == attendance_date
            ).first()
        except Exception:
            return None