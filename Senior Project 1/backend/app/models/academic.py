from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    description = Column(Text)
    credits = Column(Integer, nullable=False)
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    schedule = Column(JSON, default=[])
    enrolled_students = Column(ARRAY(UUID(as_uuid=True)), default=[])
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Grade(Base):
    __tablename__ = "grades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    assessment_type = Column(String, nullable=False)  # quiz, exam, assignment, project
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    grade = Column(String)
    feedback = Column(Text)
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False)  # present, absent, late
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())