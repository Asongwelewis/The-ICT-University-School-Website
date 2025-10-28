from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID

from app.core.database import get_db
from app.services.course_service import CourseService
from app.services.grade_service import GradeService
from app.services.attendance_service import AttendanceService
from app.schemas.academic import (
    CourseCreate, CourseUpdate, CourseResponse,
    GradeCreate, GradeResponse,
    AttendanceCreate, AttendanceResponse,
    BulkGradeCreate, BulkAttendanceCreate, BulkEnrollmentRequest,
    StudentPerformanceSummary, CourseAnalytics, AttendanceAnalytics, AttendanceReport
)

router = APIRouter()

# Course Management Endpoints

@router.get("/courses", response_model=List[CourseResponse])
async def get_courses(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    search: Optional[str] = Query(None, description="Search term for course name or code"),
    instructor_id: Optional[UUID] = Query(None, description="Filter by instructor ID"),
    active_only: bool = Query(True, description="Only return active courses"),
    db: Session = Depends(get_db)
):
    """
    Retrieve courses with pagination, filtering, and search.
    """
    try:
        course_service = CourseService(db)
        courses = await course_service.get_courses(
            skip=skip,
            limit=limit,
            search=search,
            instructor_id=instructor_id,
            active_only=active_only
        )
        return courses
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve courses: {str(e)}"
        )


@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course: CourseCreate, 
    db: Session = Depends(get_db)
):
    """Create a new course with validation and conflict detection."""
    try:
        course_service = CourseService(db)
        new_course = await course_service.create_course(course)
        return new_course
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create course: {str(e)}"
        )


@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: UUID, 
    db: Session = Depends(get_db)
):
    """Retrieve a specific course by ID."""
    try:
        course_service = CourseService(db)
        course = await course_service.get_course(course_id)
        
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        return course
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve course: {str(e)}"
        )


@router.put("/courses/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: UUID,
    course_update: CourseUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing course."""
    try:
        course_service = CourseService(db)
        updated_course = await course_service.update_course(course_id, course_update)
        
        if not updated_course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        return updated_course
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update course: {str(e)}"
        )


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: UUID,
    soft_delete: bool = Query(True, description="Perform soft delete (set inactive) instead of hard delete"),
    db: Session = Depends(get_db)
):
    """Delete a course (soft delete by default)."""
    try:
        course_service = CourseService(db)
        success = await course_service.delete_course(course_id, soft_delete)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete course: {str(e)}"
        )


# Course Enrollment Endpoints

@router.post("/courses/{course_id}/enroll/{student_id}", status_code=status.HTTP_200_OK)
async def enroll_student(
    course_id: UUID,
    student_id: UUID,
    db: Session = Depends(get_db)
):
    """Enroll a student in a course."""
    try:
        course_service = CourseService(db)
        success = await course_service.enroll_student(course_id, student_id)
        
        return {"message": "Student enrolled successfully", "success": success}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enroll student: {str(e)}"
        )


@router.delete("/courses/{course_id}/enroll/{student_id}", status_code=status.HTTP_200_OK)
async def unenroll_student(
    course_id: UUID,
    student_id: UUID,
    db: Session = Depends(get_db)
):
    """Unenroll a student from a course."""
    try:
        course_service = CourseService(db)
        success = await course_service.unenroll_student(course_id, student_id)
        
        return {"message": "Student unenrolled successfully", "success": success}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unenroll student: {str(e)}"
        )


@router.post("/courses/{course_id}/bulk-enroll")
async def bulk_enroll_students(
    course_id: UUID,
    enrollment_request: BulkEnrollmentRequest,
    db: Session = Depends(get_db)
):
    """Enroll multiple students in a course."""
    try:
        course_service = CourseService(db)
        result = await course_service.bulk_enroll_students(course_id, enrollment_request.student_ids)
        
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk enroll students: {str(e)}"
        )


@router.get("/students/{student_id}/courses", response_model=List[CourseResponse])
async def get_student_courses(
    student_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all courses a student is enrolled in."""
    try:
        course_service = CourseService(db)
        courses = await course_service.get_student_courses(student_id)
        return courses
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get student courses: {str(e)}"
        )


@router.get("/instructors/{instructor_id}/courses", response_model=List[CourseResponse])
async def get_instructor_courses(
    instructor_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all courses taught by an instructor."""
    try:
        course_service = CourseService(db)
        courses = await course_service.get_instructor_courses(instructor_id)
        return courses
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get instructor courses: {str(e)}"
        )


# Grade Management Endpoints

@router.post("/grades", response_model=GradeResponse, status_code=status.HTTP_201_CREATED)
async def record_grade(
    grade: GradeCreate,
    recorded_by: UUID = Query(..., description="ID of the user recording the grade"),
    db: Session = Depends(get_db)
):
    """Record a new grade with validation."""
    try:
        grade_service = GradeService(db)
        new_grade = await grade_service.record_grade(grade, recorded_by)
        return new_grade
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record grade: {str(e)}"
        )


@router.post("/grades/bulk", response_model=List[GradeResponse])
async def bulk_record_grades(
    bulk_grades: BulkGradeCreate,
    recorded_by: UUID = Query(..., description="ID of the user recording the grades"),
    db: Session = Depends(get_db)
):
    """Record multiple grades in bulk."""
    try:
        grade_service = GradeService(db)
        new_grades = await grade_service.bulk_record_grades(bulk_grades.grades, recorded_by)
        return new_grades
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk record grades: {str(e)}"
        )


@router.get("/students/{student_id}/grades", response_model=List[GradeResponse])
async def get_student_grades(
    student_id: UUID,
    course_id: Optional[UUID] = Query(None, description="Filter by course ID"),
    db: Session = Depends(get_db)
):
    """Get all grades for a student, optionally filtered by course."""
    try:
        grade_service = GradeService(db)
        grades = await grade_service.get_student_grades(student_id, course_id)
        return grades
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get student grades: {str(e)}"
        )


@router.get("/courses/{course_id}/grades", response_model=List[GradeResponse])
async def get_course_grades(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all grades for a course."""
    try:
        grade_service = GradeService(db)
        grades = await grade_service.get_course_grades(course_id)
        return grades
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get course grades: {str(e)}"
        )


@router.get("/students/{student_id}/gpa")
async def get_student_gpa(
    student_id: UUID,
    db: Session = Depends(get_db)
):
    """Calculate and return student's GPA."""
    try:
        grade_service = GradeService(db)
        gpa = await grade_service.calculate_student_gpa(student_id)
        
        return {
            "student_id": str(student_id),
            "gpa": round(gpa, 2) if gpa else None,
            "message": "GPA calculated successfully" if gpa else "No grades found"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate GPA: {str(e)}"
        )


@router.get("/students/{student_id}/performance", response_model=StudentPerformanceSummary)
async def get_student_performance(
    student_id: UUID,
    db: Session = Depends(get_db)
):
    """Get comprehensive performance summary for a student."""
    try:
        grade_service = GradeService(db)
        performance = await grade_service.get_student_performance_summary(student_id)
        
        return StudentPerformanceSummary(
            student_id=student_id,
            **performance
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get performance summary: {str(e)}"
        )


@router.get("/courses/{course_id}/analytics", response_model=CourseAnalytics)
async def get_course_analytics(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    """Get grade analytics for a course."""
    try:
        grade_service = GradeService(db)
        analytics = await grade_service.get_grade_analytics(course_id)
        
        return CourseAnalytics(
            course_id=course_id,
            **analytics
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get course analytics: {str(e)}"
        )


# Attendance Management Endpoints

@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def record_attendance(
    attendance: AttendanceCreate,
    recorded_by: UUID = Query(..., description="ID of the user recording attendance"),
    db: Session = Depends(get_db)
):
    """Record attendance for a student."""
    try:
        attendance_service = AttendanceService(db)
        new_attendance = await attendance_service.record_attendance(attendance, recorded_by)
        return new_attendance
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record attendance: {str(e)}"
        )


@router.post("/attendance/bulk", response_model=List[AttendanceResponse])
async def bulk_record_attendance(
    bulk_attendance: BulkAttendanceCreate,
    recorded_by: UUID = Query(..., description="ID of the user recording attendance"),
    db: Session = Depends(get_db)
):
    """Record multiple attendance records in bulk."""
    try:
        attendance_service = AttendanceService(db)
        new_attendance_records = await attendance_service.bulk_record_attendance(
            bulk_attendance.attendance_records, recorded_by
        )
        return new_attendance_records
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk record attendance: {str(e)}"
        )


@router.get("/students/{student_id}/attendance", response_model=List[AttendanceResponse])
async def get_student_attendance(
    student_id: UUID,
    course_id: Optional[UUID] = Query(None, description="Filter by course ID"),
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    db: Session = Depends(get_db)
):
    """Get attendance records for a student."""
    try:
        attendance_service = AttendanceService(db)
        attendance_records = await attendance_service.get_student_attendance(
            student_id, course_id, start_date, end_date
        )
        return attendance_records
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get student attendance: {str(e)}"
        )


@router.get("/courses/{course_id}/attendance", response_model=List[AttendanceResponse])
async def get_course_attendance(
    course_id: UUID,
    attendance_date: Optional[date] = Query(None, description="Specific date to filter by"),
    db: Session = Depends(get_db)
):
    """Get attendance records for a course."""
    try:
        attendance_service = AttendanceService(db)
        attendance_records = await attendance_service.get_course_attendance(course_id, attendance_date)
        return attendance_records
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get course attendance: {str(e)}"
        )


@router.get("/students/{student_id}/attendance-rate")
async def get_student_attendance_rate(
    student_id: UUID,
    course_id: Optional[UUID] = Query(None, description="Filter by course ID"),
    db: Session = Depends(get_db)
):
    """Calculate attendance rate for a student."""
    try:
        attendance_service = AttendanceService(db)
        attendance_rate = await attendance_service.calculate_attendance_rate(student_id, course_id)
        
        return {
            "student_id": str(student_id),
            "course_id": str(course_id) if course_id else None,
            "attendance_rate": round(attendance_rate, 2),
            "message": "Attendance rate calculated successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate attendance rate: {str(e)}"
        )


@router.get("/courses/{course_id}/attendance-analytics", response_model=AttendanceAnalytics)
async def get_attendance_analytics(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    """Get attendance analytics for a course."""
    try:
        attendance_service = AttendanceService(db)
        analytics = await attendance_service.get_attendance_analytics(course_id)
        
        return AttendanceAnalytics(
            course_id=course_id,
            **analytics
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get attendance analytics: {str(e)}"
        )


@router.get("/courses/{course_id}/attendance-report", response_model=AttendanceReport)
async def generate_attendance_report(
    course_id: UUID,
    start_date: Optional[date] = Query(None, description="Start date for the report"),
    end_date: Optional[date] = Query(None, description="End date for the report"),
    db: Session = Depends(get_db)
):
    """Generate comprehensive attendance report for a course."""
    try:
        attendance_service = AttendanceService(db)
        report = await attendance_service.generate_attendance_report(course_id, start_date, end_date)
        
        return AttendanceReport(**report)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate attendance report: {str(e)}"
        )