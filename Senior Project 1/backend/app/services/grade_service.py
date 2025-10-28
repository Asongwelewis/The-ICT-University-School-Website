"""
Grade management service for academic operations.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID
from datetime import datetime

from app.repositories.academic_repository import GradeRepository, CourseRepository
from app.schemas.academic import GradeCreate, GradeResponse
from app.models.academic import Grade


class GradeService:
    """Service class for grade management operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.grade_repo = GradeRepository(db)
        self.course_repo = CourseRepository(db)
    
    async def record_grade(
        self, 
        grade_data: GradeCreate, 
        recorded_by: UUID
    ) -> GradeResponse:
        """
        Record a new grade with validation and audit trail.
        
        Args:
            grade_data: Grade data to record
            recorded_by: ID of the user recording the grade
            
        Returns:
            Recorded grade information
            
        Raises:
            ValueError: If validation fails
        """
        try:
            # Validate course exists and is active
            course = self.course_repo.get_by_id(grade_data.course_id)
            if not course:
                raise ValueError("Course not found")
            
            if not course.is_active:
                raise ValueError("Cannot record grades for inactive course")
            
            # Validate student is enrolled in the course
            if not course.enrolled_students or grade_data.student_id not in course.enrolled_students:
                raise ValueError("Student is not enrolled in this course")
            
            # Calculate letter grade
            percentage = (grade_data.score / grade_data.max_score) * 100
            letter_grade = self._calculate_letter_grade(percentage)
            
            # Create grade record
            grade_dict = grade_data.dict()
            grade_dict.update({
                'grade': letter_grade,
                'recorded_by': recorded_by,
                'recorded_at': datetime.utcnow()
            })
            
            db_grade = self.grade_repo.create(grade_dict)
            
            return GradeResponse.from_orm(db_grade)
            
        except IntegrityError:
            raise ValueError("Failed to record grade: Database constraint violation")
        except Exception as e:
            raise ValueError(f"Failed to record grade: {str(e)}")
    
    async def update_grade(
        self, 
        grade_id: UUID, 
        update_data: Dict[str, Any],
        updated_by: UUID
    ) -> Optional[GradeResponse]:
        """
        Update an existing grade with audit trail.
        
        Args:
            grade_id: ID of the grade to update
            update_data: Data to update
            updated_by: ID of the user updating the grade
            
        Returns:
            Updated grade information or None if not found
        """
        try:
            existing_grade = self.grade_repo.get_by_id(grade_id)
            if not existing_grade:
                return None
            
            # Recalculate letter grade if score or max_score changed
            if 'score' in update_data or 'max_score' in update_data:
                score = update_data.get('score', existing_grade.score)
                max_score = update_data.get('max_score', existing_grade.max_score)
                percentage = (score / max_score) * 100
                update_data['grade'] = self._calculate_letter_grade(percentage)
            
            # Add audit information
            update_data['recorded_by'] = updated_by
            update_data['recorded_at'] = datetime.utcnow()
            
            updated_grade = self.grade_repo.update(grade_id, update_data)
            
            return GradeResponse.from_orm(updated_grade) if updated_grade else None
            
        except Exception as e:
            raise ValueError(f"Failed to update grade: {str(e)}")
    
    async def delete_grade(self, grade_id: UUID) -> bool:
        """
        Delete a grade record.
        
        Args:
            grade_id: ID of the grade to delete
            
        Returns:
            True if deleted successfully, False if not found
        """
        try:
            return self.grade_repo.delete(grade_id)
        except Exception as e:
            raise ValueError(f"Failed to delete grade: {str(e)}")
    
    async def get_student_grades(
        self, 
        student_id: UUID, 
        course_id: Optional[UUID] = None
    ) -> List[GradeResponse]:
        """
        Get all grades for a student, optionally filtered by course.
        
        Args:
            student_id: ID of the student
            course_id: Optional course ID to filter by
            
        Returns:
            List of student grades
        """
        try:
            grades = self.grade_repo.get_student_grades(student_id, course_id)
            return [GradeResponse.from_orm(grade) for grade in grades]
        except Exception as e:
            raise ValueError(f"Failed to get student grades: {str(e)}")
    
    async def get_course_grades(self, course_id: UUID) -> List[GradeResponse]:
        """
        Get all grades for a course.
        
        Args:
            course_id: ID of the course
            
        Returns:
            List of course grades
        """
        try:
            grades = self.grade_repo.get_course_grades(course_id)
            return [GradeResponse.from_orm(grade) for grade in grades]
        except Exception as e:
            raise ValueError(f"Failed to get course grades: {str(e)}")
    
    async def calculate_student_gpa(self, student_id: UUID) -> Optional[float]:
        """
        Calculate GPA for a student.
        
        Args:
            student_id: ID of the student
            
        Returns:
            Student's GPA or None if no grades found
        """
        try:
            return self.grade_repo.calculate_student_gpa(student_id)
        except Exception as e:
            raise ValueError(f"Failed to calculate GPA: {str(e)}")
    
    async def get_student_performance_summary(
        self, 
        student_id: UUID
    ) -> Dict[str, Any]:
        """
        Get comprehensive performance summary for a student.
        
        Args:
            student_id: ID of the student
            
        Returns:
            Dictionary with performance metrics
        """
        try:
            grades = self.grade_repo.get_student_grades(student_id)
            
            if not grades:
                return {
                    'total_grades': 0,
                    'gpa': None,
                    'average_score': 0,
                    'grade_distribution': {},
                    'course_performance': {},
                    'assessment_breakdown': {}
                }
            
            # Calculate basic metrics
            scores = [(g.score / g.max_score) * 100 for g in grades]
            average_score = sum(scores) / len(scores)
            gpa = await self.calculate_student_gpa(student_id)
            
            # Grade distribution
            grade_distribution = {}
            for grade in grades:
                letter_grade = grade.grade
                grade_distribution[letter_grade] = grade_distribution.get(letter_grade, 0) + 1
            
            # Course performance breakdown
            course_performance = {}
            for grade in grades:
                course_id = str(grade.course_id)
                if course_id not in course_performance:
                    course_performance[course_id] = {
                        'grades': [],
                        'average_score': 0,
                        'letter_grades': []
                    }
                
                score_percentage = (grade.score / grade.max_score) * 100
                course_performance[course_id]['grades'].append(score_percentage)
                course_performance[course_id]['letter_grades'].append(grade.grade)
            
            # Calculate averages for each course
            for course_id, data in course_performance.items():
                if data['grades']:
                    data['average_score'] = sum(data['grades']) / len(data['grades'])
                    data['grade_count'] = len(data['grades'])
                    del data['grades']  # Remove raw scores from response
            
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
                'gpa': round(gpa, 2) if gpa else None,
                'average_score': round(average_score, 2),
                'grade_distribution': grade_distribution,
                'course_performance': course_performance,
                'assessment_breakdown': assessment_breakdown
            }
            
        except Exception as e:
            raise ValueError(f"Failed to get performance summary: {str(e)}")
    
    async def get_grade_analytics(self, course_id: UUID) -> Dict[str, Any]:
        """
        Get grade analytics for a course.
        
        Args:
            course_id: ID of the course
            
        Returns:
            Dictionary with grade analytics
        """
        try:
            return self.grade_repo.get_grade_analytics(course_id)
        except Exception as e:
            raise ValueError(f"Failed to get grade analytics: {str(e)}")
    
    async def bulk_record_grades(
        self, 
        grades_data: List[GradeCreate], 
        recorded_by: UUID
    ) -> List[GradeResponse]:
        """
        Record multiple grades in bulk.
        
        Args:
            grades_data: List of grade data to record
            recorded_by: ID of the user recording the grades
            
        Returns:
            List of recorded grades
        """
        try:
            # Validate all grades before creating any
            for grade_data in grades_data:
                course = self.course_repo.get_by_id(grade_data.course_id)
                if not course:
                    raise ValueError(f"Course {grade_data.course_id} not found")
                
                if not course.is_active:
                    raise ValueError(f"Course {grade_data.course_id} is inactive")
                
                if not course.enrolled_students or grade_data.student_id not in course.enrolled_students:
                    raise ValueError(f"Student {grade_data.student_id} not enrolled in course {grade_data.course_id}")
            
            # Prepare grade data for bulk creation
            grades_dict_list = []
            for grade_data in grades_data:
                percentage = (grade_data.score / grade_data.max_score) * 100
                letter_grade = self._calculate_letter_grade(percentage)
                
                grade_dict = grade_data.dict()
                grade_dict.update({
                    'grade': letter_grade,
                    'recorded_by': recorded_by,
                    'recorded_at': datetime.utcnow()
                })
                grades_dict_list.append(grade_dict)
            
            # Bulk create grades
            db_grades = self.grade_repo.bulk_create_grades(grades_dict_list)
            
            return [GradeResponse.from_orm(grade) for grade in db_grades]
            
        except Exception as e:
            raise ValueError(f"Failed to bulk record grades: {str(e)}")
    
    async def get_grade_trends(
        self, 
        student_id: UUID, 
        course_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """
        Get grade trends for a student over time.
        
        Args:
            student_id: ID of the student
            course_id: Optional course ID to filter by
            
        Returns:
            Dictionary with trend analysis
        """
        try:
            grades = self.grade_repo.get_student_grades(student_id, course_id)
            
            if not grades:
                return {
                    'trend': 'no_data',
                    'improvement': 0,
                    'recent_average': 0,
                    'overall_average': 0,
                    'grade_history': []
                }
            
            # Sort grades by date
            sorted_grades = sorted(grades, key=lambda g: g.recorded_at)
            
            # Calculate scores as percentages
            grade_history = []
            for grade in sorted_grades:
                percentage = (grade.score / grade.max_score) * 100
                grade_history.append({
                    'date': grade.recorded_at.isoformat(),
                    'score': round(percentage, 2),
                    'letter_grade': grade.grade,
                    'assessment_type': grade.assessment_type
                })
            
            # Calculate overall average
            all_scores = [item['score'] for item in grade_history]
            overall_average = sum(all_scores) / len(all_scores)
            
            # Calculate recent average (last 5 grades)
            recent_scores = all_scores[-5:] if len(all_scores) >= 5 else all_scores
            recent_average = sum(recent_scores) / len(recent_scores)
            
            # Determine trend
            improvement = recent_average - overall_average
            if improvement > 5:
                trend = 'improving'
            elif improvement < -5:
                trend = 'declining'
            else:
                trend = 'stable'
            
            return {
                'trend': trend,
                'improvement': round(improvement, 2),
                'recent_average': round(recent_average, 2),
                'overall_average': round(overall_average, 2),
                'grade_history': grade_history
            }
            
        except Exception as e:
            raise ValueError(f"Failed to get grade trends: {str(e)}")
    
    def _calculate_letter_grade(self, percentage: float) -> str:
        """
        Convert percentage score to letter grade.
        
        Args:
            percentage: Score as percentage
            
        Returns:
            Letter grade
        """
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
    
    async def validate_grade_data(self, grade_data: GradeCreate) -> Dict[str, Any]:
        """
        Validate grade data before recording.
        
        Args:
            grade_data: Grade data to validate
            
        Returns:
            Dictionary with validation results
        """
        try:
            validation_errors = []
            
            # Check course exists and is active
            course = self.course_repo.get_by_id(grade_data.course_id)
            if not course:
                validation_errors.append("Course not found")
            elif not course.is_active:
                validation_errors.append("Course is inactive")
            elif not course.enrolled_students or grade_data.student_id not in course.enrolled_students:
                validation_errors.append("Student is not enrolled in this course")
            
            # Validate score ranges
            if grade_data.score < 0:
                validation_errors.append("Score cannot be negative")
            
            if grade_data.max_score <= 0:
                validation_errors.append("Maximum score must be positive")
            
            if grade_data.score > grade_data.max_score:
                validation_errors.append("Score cannot exceed maximum score")
            
            # Validate assessment type
            allowed_types = ['quiz', 'exam', 'assignment', 'project', 'participation']
            if grade_data.assessment_type.lower() not in allowed_types:
                validation_errors.append(f"Invalid assessment type. Must be one of: {', '.join(allowed_types)}")
            
            return {
                'is_valid': len(validation_errors) == 0,
                'errors': validation_errors,
                'calculated_percentage': (grade_data.score / grade_data.max_score) * 100 if grade_data.max_score > 0 else 0,
                'calculated_letter_grade': self._calculate_letter_grade((grade_data.score / grade_data.max_score) * 100) if grade_data.max_score > 0 else 'F'
            }
            
        except Exception as e:
            return {
                'is_valid': False,
                'errors': [f"Validation error: {str(e)}"],
                'calculated_percentage': 0,
                'calculated_letter_grade': 'F'
            }