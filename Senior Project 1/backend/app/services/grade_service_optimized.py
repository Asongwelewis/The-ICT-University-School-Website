"""
Optimized Grade management service with performance improvements.
"""
from typing import List, Optional, Dict, Any, Set
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_, func
from uuid import UUID
from datetime import datetime
from functools import lru_cache
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.repositories.academic_repository import GradeRepository, CourseRepository
from app.schemas.academic import GradeCreate, GradeResponse
from app.models.academic import Grade, Course


class OptimizedGradeService:
    """Optimized service class for grade management operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.grade_repo = GradeRepository(db)
        self.course_repo = CourseRepository(db)
        self._grade_scale_cache = {}
        self._executor = ThreadPoolExecutor(max_workers=4)
    
    async def record_grade_batch(
        self, 
        grades_data: List[GradeCreate], 
        recorded_by: UUID
    ) -> List[GradeResponse]:
        """
        Record multiple grades efficiently with batch validation.
        
        Performance improvements:
        - Single query to fetch all courses
        - Batch validation
        - Single bulk insert operation
        """
        if not grades_data:
            return []
        
        # Extract unique course IDs for batch fetching
        course_ids = list(set(grade.course_id for grade in grades_data))
        
        # Fetch all required courses in single query with eager loading
        courses = self.db.query(Course).filter(
            Course.id.in_(course_ids)
        ).options(
            selectinload(Course.enrolled_students)
        ).all()
        
        # Create course lookup for O(1) access
        course_lookup = {course.id: course for course in courses}
        
        # Batch validation
        validation_errors = []
        validated_grades = []
        
        for i, grade_data in enumerate(grades_data):
            course = course_lookup.get(grade_data.course_id)
            
            if not course:
                validation_errors.append(f"Grade {i}: Course not found")
                continue
                
            if not course.is_active:
                validation_errors.append(f"Grade {i}: Course is inactive")
                continue
                
            if not course.enrolled_students or grade_data.student_id not in course.enrolled_students:
                validation_errors.append(f"Grade {i}: Student not enrolled")
                continue
            
            # Calculate letter grade using cached scale
            percentage = (grade_data.score / grade_data.max_score) * 100
            letter_grade = self._get_letter_grade_cached(percentage)
            
            grade_dict = grade_data.dict()
            grade_dict.update({
                'grade': letter_grade,
                'recorded_by': recorded_by,
                'recorded_at': datetime.utcnow()
            })
            validated_grades.append(grade_dict)
        
        if validation_errors:
            raise ValueError("; ".join(validation_errors))
        
        # Bulk insert with single transaction
        try:
            db_grades = self.grade_repo.bulk_create(validated_grades)
            return [GradeResponse.from_orm(grade) for grade in db_grades]
        except IntegrityError as e:
            raise ValueError(f"Failed to record grades: {str(e)}")
    
    async def get_student_performance_optimized(
        self, 
        student_id: UUID,
        include_trends: bool = True
    ) -> Dict[str, Any]:
        """
        Get comprehensive performance summary with optimized queries.
        
        Performance improvements:
        - Single query with joins
        - Parallel computation of metrics
        - Cached calculations
        """
        # Single optimized query with joins
        grades_query = self.db.query(Grade).filter(
            Grade.student_id == student_id
        ).options(
            joinedload(Grade.course)
        ).order_by(Grade.recorded_at.desc())
        
        grades = grades_query.all()
        
        if not grades:
            return self._empty_performance_summary()
        
        # Parallel computation of different metrics
        tasks = []
        if include_trends:
            tasks.extend([
                self._calculate_basic_metrics(grades),
                self._calculate_grade_distribution(grades),
                self._calculate_course_performance(grades),
                self._calculate_assessment_breakdown(grades),
                self._calculate_trends(grades)
            ])
        else:
            tasks.extend([
                self._calculate_basic_metrics(grades),
                self._calculate_grade_distribution(grades),
                self._calculate_course_performance(grades),
                self._calculate_assessment_breakdown(grades)
            ])
        
        # Execute calculations in parallel
        results = await asyncio.gather(*tasks)
        
        # Combine results
        performance_summary = {
            'total_grades': len(grades),
            **results[0],  # basic_metrics
            'grade_distribution': results[1],
            'course_performance': results[2],
            'assessment_breakdown': results[3]
        }
        
        if include_trends:
            performance_summary['trends'] = results[4]
        
        return performance_summary
    
    @lru_cache(maxsize=128)
    def _get_letter_grade_cached(self, percentage: float) -> str:
        """Cached letter grade calculation to avoid repeated computations."""
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
    
    async def _calculate_basic_metrics(self, grades: List[Grade]) -> Dict[str, Any]:
        """Calculate basic performance metrics."""
        def compute():
            scores = [(g.score / g.max_score) * 100 for g in grades]
            average_score = sum(scores) / len(scores)
            
            # Calculate GPA more efficiently
            gpa = self._calculate_gpa_optimized(grades)
            
            return {
                'average_score': round(average_score, 2),
                'gpa': round(gpa, 2) if gpa else None
            }
        
        return await asyncio.get_event_loop().run_in_executor(
            self._executor, compute
        )
    
    async def _calculate_grade_distribution(self, grades: List[Grade]) -> Dict[str, int]:
        """Calculate grade distribution."""
        def compute():
            distribution = {}
            for grade in grades:
                letter_grade = grade.grade
                distribution[letter_grade] = distribution.get(letter_grade, 0) + 1
            return distribution
        
        return await asyncio.get_event_loop().run_in_executor(
            self._executor, compute
        )
    
    async def _calculate_course_performance(self, grades: List[Grade]) -> Dict[str, Any]:
        """Calculate performance breakdown by course."""
        def compute():
            course_performance = {}
            for grade in grades:
                course_id = str(grade.course_id)
                if course_id not in course_performance:
                    course_performance[course_id] = {
                        'grades': [],
                        'letter_grades': []
                    }
                
                score_percentage = (grade.score / grade.max_score) * 100
                course_performance[course_id]['grades'].append(score_percentage)
                course_performance[course_id]['letter_grades'].append(grade.grade)
            
            # Calculate averages
            for course_id, data in course_performance.items():
                if data['grades']:
                    data['average_score'] = sum(data['grades']) / len(data['grades'])
                    data['grade_count'] = len(data['grades'])
                    del data['grades']  # Remove raw scores
            
            return course_performance
        
        return await asyncio.get_event_loop().run_in_executor(
            self._executor, compute
        )
    
    async def _calculate_assessment_breakdown(self, grades: List[Grade]) -> Dict[str, Any]:
        """Calculate performance breakdown by assessment type."""
        def compute():
            assessment_breakdown = {}
            for grade in grades:
                assessment_type = grade.assessment_type
                if assessment_type not in assessment_breakdown:
                    assessment_breakdown[assessment_type] = {
                        'count': 0,
                        'scores': []
                    }
                
                score_percentage = (grade.score / grade.max_score) * 100
                assessment_breakdown[assessment_type]['scores'].append(score_percentage)
                assessment_breakdown[assessment_type]['count'] += 1
            
            # Calculate averages
            for assessment_type, data in assessment_breakdown.items():
                if data['scores']:
                    data['average_score'] = sum(data['scores']) / len(data['scores'])
                    del data['scores']
            
            return assessment_breakdown
        
        return await asyncio.get_event_loop().run_in_executor(
            self._executor, compute
        )
    
    async def _calculate_trends(self, grades: List[Grade]) -> Dict[str, Any]:
        """Calculate grade trends over time."""
        def compute():
            if len(grades) < 2:
                return {'trend': 'insufficient_data', 'improvement': 0}
            
            # Sort by date
            sorted_grades = sorted(grades, key=lambda g: g.recorded_at)
            
            # Calculate recent vs overall performance
            all_scores = [(g.score / g.max_score) * 100 for g in sorted_grades]
            overall_average = sum(all_scores) / len(all_scores)
            
            # Recent performance (last 25% of grades or minimum 3)
            recent_count = max(3, len(all_scores) // 4)
            recent_scores = all_scores[-recent_count:]
            recent_average = sum(recent_scores) / len(recent_scores)
            
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
                'overall_average': round(overall_average, 2)
            }
        
        return await asyncio.get_event_loop().run_in_executor(
            self._executor, compute
        )
    
    def _calculate_gpa_optimized(self, grades: List[Grade]) -> Optional[float]:
        """Optimized GPA calculation with course grouping."""
        if not grades:
            return None
        
        # Group by course for final grade calculation
        course_grades = {}
        for grade in grades:
            course_id = grade.course_id
            if course_id not in course_grades:
                course_grades[course_id] = []
            course_grades[course_id].append(grade)
        
        total_points = 0
        total_credits = 0
        
        for course_id, course_grade_list in course_grades.items():
            # Get average score for the course
            course_scores = [(g.score / g.max_score) * 100 for g in course_grade_list]
            course_average = sum(course_scores) / len(course_scores)
            
            # Convert to GPA points
            gpa_points = self._percentage_to_gpa(course_average)
            total_points += gpa_points
            total_credits += 1
        
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
    
    def _empty_performance_summary(self) -> Dict[str, Any]:
        """Return empty performance summary structure."""
        return {
            'total_grades': 0,
            'gpa': None,
            'average_score': 0,
            'grade_distribution': {},
            'course_performance': {},
            'assessment_breakdown': {},
            'trends': {'trend': 'no_data', 'improvement': 0}
        }
    
    def __del__(self):
        """Cleanup executor on service destruction."""
        if hasattr(self, '_executor'):
            self._executor.shutdown(wait=False)