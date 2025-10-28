"""
Academic module repository for database operations.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, cast, Date
from datetime import datetime, date
from uuid import UUID

from app.models.academic import Course, Grade, Attendance
from app.repositories.base_repository import BaseRepository


class CourseRepository(BaseRepository[Course]):
    """Repository for Course model operations."""
    
    def __init__(self, db: Session):
        super().__init__(Course, db)
    
    def get_by_code(self, code: str) -> Optional[Course]:
        """Get course by course code."""
        return self.db.query(Course).filter(Course.code == code).first()
    
    def get_by_instructor(self, instructor_id: UUID) -> List[Course]:
        """Get all courses taught by an instructor."""
        return self.db.query(Course).filter(
            and_(Course.instructor_id == instructor_id, Course.is_active == True)
        ).all()
    
    def get_active_courses(self, skip: int = 0, limit: int = 100) -> List[Course]:
        """Get all active courses."""
        return self.db.query(Course).filter(Course.is_active == True).offset(skip).limit(limit).all()
    
    def search_courses(self, search_term: str, skip: int = 0, limit: int = 100) -> List[Course]:
        """Search courses by name or code."""
        search_pattern = f"%{search_term}%"
        return self.db.query(Course).filter(
            and_(
                Course.is_active == True,
                or_(
                    Course.name.ilike(search_pattern),
                    Course.code.ilike(search_pattern),
                    Course.description.ilike(search_pattern)
                )
            )
        ).offset(skip).limit(limit).all()
    
    def enroll_student(self, course_id: UUID, student_id: UUID) -> bool:
        """Enroll a student in a course."""
        try:
            course = self.get_by_id(course_id)
            if not course:
                return False
            
            if course.enrolled_students is None:
                course.enrolled_students = []
            
            if student_id not in course.enrolled_students:
                course.enrolled_students.append(student_id)
                self.db.commit()
            
            return True
        except Exception:
            self.db.rollback()
            return False
    
    def unenroll_student(self, course_id: UUID, student_id: UUID) -> bool:
        """Unenroll a student from a course."""
        try:
            course = self.get_by_id(course_id)
            if not course or not course.enrolled_students:
                return False
            
            if student_id in course.enrolled_students:
                course.enrolled_students.remove(student_id)
                self.db.commit()
            
            return True
        except Exception:
            self.db.rollback()
            return False
    
    def get_student_courses(self, student_id: UUID) -> List[Course]:
        """Get all courses a student is enrolled in."""
        return self.db.query(Course).filter(
            and_(
                Course.enrolled_students.contains([student_id]),
                Course.is_active == True
            )
        ).all()
    
    def bulk_enroll_students(self, course_id: UUID, student_ids: List[UUID]) -> bool:
        """Enroll multiple students in a course."""
        try:
            course = self.get_by_id(course_id)
            if not course:
                return False
            
            if course.enrolled_students is None:
                course.enrolled_students = []
            
            # Add new students (avoid duplicates)
            for student_id in student_ids:
                if student_id not in course.enrolled_students:
                    course.enrolled_students.append(student_id)
            
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            return False
    
    def check_schedule_conflict(self, schedule: List[Dict], exclude_course_id: Optional[UUID] = None) -> bool:
        """Check if a schedule conflicts with existing courses."""
        if not schedule:
            return False
        
        query = self.db.query(Course).filter(Course.is_active == True)
        if exclude_course_id:
            query = query.filter(Course.id != exclude_course_id)
        
        existing_courses = query.all()
        
        for existing_course in existing_courses:
            if not existing_course.schedule:
                continue
            
            for new_slot in schedule:
                for existing_slot in existing_course.schedule:
                    if self._schedules_overlap(new_slot, existing_slot):
                        return True
        
        return False
    
    def _schedules_overlap(self, slot1: Dict, slot2: Dict) -> bool:
        """Check if two schedule slots overlap."""
        if slot1.get('day') != slot2.get('day'):
            return False
        
        start1 = slot1.get('start_time')
        end1 = slot1.get('end_time')
        start2 = slot2.get('start_time')
        end2 = slot2.get('end_time')
        
        if not all([start1, end1, start2, end2]):
            return False
        
        # Convert to comparable format if needed
        return not (end1 <= start2 or end2 <= start1)


class GradeRepository(BaseRepository[Grade]):
    """Repository for Grade model operations."""
    
    def __init__(self, db: Session):
        super().__init__(Grade, db)
    
    def get_student_grades(self, student_id: UUID, course_id: Optional[UUID] = None) -> List[Grade]:
        """Get all grades for a student, optionally filtered by course."""
        query = self.db.query(Grade).filter(Grade.student_id == student_id)
        if course_id:
            query = query.filter(Grade.course_id == course_id)
        return query.order_by(Grade.recorded_at.desc()).all()
    
    def get_course_grades(self, course_id: UUID) -> List[Grade]:
        """Get all grades for a course."""
        return self.db.query(Grade).filter(Grade.course_id == course_id).all()
    
    def calculate_student_gpa(self, student_id: UUID) -> Optional[float]:
        """Calculate GPA for a student."""
        grades = self.db.query(Grade).filter(Grade.student_id == student_id).all()
        
        if not grades:
            return None
        
        total_points = 0
        total_credits = 0
        
        # Group grades by course to get final grades
        course_grades = {}
        for grade in grades:
            if grade.course_id not in course_grades:
                course_grades[grade.course_id] = []
            course_grades[grade.course_id].append(grade)
        
        # Calculate GPA based on final grades per course
        for course_id, course_grade_list in course_grades.items():
            # Get the latest grade for each assessment type
            latest_grades = {}
            for grade in course_grade_list:
                if grade.assessment_type not in latest_grades:
                    latest_grades[grade.assessment_type] = grade
                elif grade.recorded_at > latest_grades[grade.assessment_type].recorded_at:
                    latest_grades[grade.assessment_type] = grade
            
            # Calculate course average
            if latest_grades:
                course_average = sum(
                    (g.score / g.max_score) * 100 for g in latest_grades.values()
                ) / len(latest_grades)
                
                # Convert to GPA scale (4.0)
                gpa_points = self._percentage_to_gpa(course_average)
                total_points += gpa_points
                total_credits += 1  # Assuming each course is worth 1 credit for GPA calculation
        
        return total_points / total_credits if total_credits > 0 else None
    
    def _percentage_to_gpa(self, percentage: float) -> float:
        """Convert percentage to 4.0 GPA scale."""
        if percentage >= 97:
            return 4.0
        elif percentage >= 93:
            return 3.7
        elif percentage >= 90:
            return 3.3
        elif percentage >= 87:
            return 3.0
        elif percentage >= 83:
            return 2.7
        elif percentage >= 80:
            return 2.3
        elif percentage >= 77:
            return 2.0
        elif percentage >= 73:
            return 1.7
        elif percentage >= 70:
            return 1.3
        elif percentage >= 67:
            return 1.0
        elif percentage >= 65:
            return 0.7
        else:
            return 0.0
    
    def get_grade_analytics(self, course_id: UUID) -> Dict[str, Any]:
        """Get grade analytics for a course."""
        grades = self.get_course_grades(course_id)
        
        if not grades:
            return {
                'total_grades': 0,
                'average_score': 0,
                'grade_distribution': {},
                'assessment_breakdown': {}
            }
        
        # Calculate statistics
        scores = [(g.score / g.max_score) * 100 for g in grades]
        average_score = sum(scores) / len(scores)
        
        # Grade distribution
        grade_distribution = {}
        for score in scores:
            letter_grade = self._score_to_letter_grade(score)
            grade_distribution[letter_grade] = grade_distribution.get(letter_grade, 0) + 1
        
        # Assessment type breakdown
        assessment_breakdown = {}
        for grade in grades:
            assessment_type = grade.assessment_type
            if assessment_type not in assessment_breakdown:
                assessment_breakdown[assessment_type] = {
                    'count': 0,
                    'average_score': 0,
                    'scores': []
                }
            
            score_percentage = (grade.score / grade.max_score) * 100
            assessment_breakdown[assessment_type]['scores'].append(score_percentage)
            assessment_breakdown[assessment_type]['count'] += 1
        
        # Calculate averages for each assessment type
        for assessment_type, data in assessment_breakdown.items():
            if data['scores']:
                data['average_score'] = sum(data['scores']) / len(data['scores'])
                del data['scores']  # Remove raw scores from response
        
        return {
            'total_grades': len(grades),
            'average_score': round(average_score, 2),
            'grade_distribution': grade_distribution,
            'assessment_breakdown': assessment_breakdown
        }
    
    def _score_to_letter_grade(self, percentage: float) -> str:
        """Convert percentage score to letter grade."""
        if percentage >= 97:
            return 'A+'
        elif percentage >= 93:
            return 'A'
        elif percentage >= 90:
            return 'A-'
        elif percentage >= 87:
            return 'B+'
        elif percentage >= 83:
            return 'B'
        elif percentage >= 80:
            return 'B-'
        elif percentage >= 77:
            return 'C+'
        elif percentage >= 73:
            return 'C'
        elif percentage >= 70:
            return 'C-'
        elif percentage >= 67:
            return 'D+'
        elif percentage >= 65:
            return 'D'
        else:
            return 'F'
    
    def bulk_create_grades(self, grades_data: List[Dict[str, Any]]) -> List[Grade]:
        """Create multiple grades in bulk."""
        return self.bulk_create(grades_data)


class AttendanceRepository(BaseRepository[Attendance]):
    """Repository for Attendance model operations."""
    
    def __init__(self, db: Session):
        super().__init__(Attendance, db)
    
    def get_student_attendance(
        self, 
        student_id: UUID, 
        course_id: Optional[UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Attendance]:
        """Get attendance records for a student."""
        query = self.db.query(Attendance).filter(Attendance.student_id == student_id)
        
        if course_id:
            query = query.filter(Attendance.course_id == course_id)
        
        if start_date:
            query = query.filter(Attendance.date >= start_date)
        
        if end_date:
            query = query.filter(Attendance.date <= end_date)
        
        return query.order_by(Attendance.date.desc()).all()
    
    def get_course_attendance(
        self, 
        course_id: UUID, 
        attendance_date: Optional[date] = None
    ) -> List[Attendance]:
        """Get attendance records for a course."""
        query = self.db.query(Attendance).filter(Attendance.course_id == course_id)
        
        if attendance_date:
            query = query.filter(func.date(Attendance.date) == attendance_date)
        
        return query.order_by(Attendance.date.desc()).all()
    
    def calculate_attendance_rate(
        self, 
        student_id: UUID, 
        course_id: Optional[UUID] = None
    ) -> float:
        """Calculate attendance rate for a student."""
        query = self.db.query(Attendance).filter(Attendance.student_id == student_id)
        
        if course_id:
            query = query.filter(Attendance.course_id == course_id)
        
        total_records = query.count()
        if total_records == 0:
            return 0.0
        
        present_records = query.filter(
            Attendance.status.in_(['present', 'late'])
        ).count()
        
        return (present_records / total_records) * 100
    
    def get_attendance_analytics(self, course_id: UUID) -> Dict[str, Any]:
        """Get attendance analytics for a course."""
        attendance_records = self.get_course_attendance(course_id)
        
        if not attendance_records:
            return {
                'total_records': 0,
                'attendance_rate': 0,
                'status_distribution': {},
                'daily_attendance': {}
            }
        
        # Status distribution
        status_distribution = {}
        for record in attendance_records:
            status = record.status
            status_distribution[status] = status_distribution.get(status, 0) + 1
        
        # Calculate overall attendance rate
        total_records = len(attendance_records)
        present_count = status_distribution.get('present', 0) + status_distribution.get('late', 0)
        attendance_rate = (present_count / total_records) * 100 if total_records > 0 else 0
        
        # Daily attendance breakdown
        daily_attendance = {}
        for record in attendance_records:
            date_str = record.date.strftime('%Y-%m-%d')
            if date_str not in daily_attendance:
                daily_attendance[date_str] = {
                    'present': 0,
                    'absent': 0,
                    'late': 0,
                    'excused': 0
                }
            daily_attendance[date_str][record.status] += 1
        
        return {
            'total_records': total_records,
            'attendance_rate': round(attendance_rate, 2),
            'status_distribution': status_distribution,
            'daily_attendance': daily_attendance
        }
    
    def bulk_create_attendance(self, attendance_data: List[Dict[str, Any]]) -> List[Attendance]:
        """Create multiple attendance records in bulk."""
        return self.bulk_create(attendance_data)
    
    def get_absent_students(self, course_id: UUID, attendance_date: date) -> List[UUID]:
        """Get list of student IDs who were absent on a specific date."""
        absent_records = self.db.query(Attendance).filter(
            and_(
                Attendance.course_id == course_id,
                func.date(Attendance.date) == attendance_date,
                Attendance.status == 'absent'
            )
        ).all()
        
        return [record.student_id for record in absent_records]