"""
Announcements API endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.announcements import Announcement
from app.schemas.announcements import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse,
    AnnouncementListResponse
)

router = APIRouter()


@router.get("/", response_model=AnnouncementListResponse)
async def get_announcements(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    type_filter: Optional[str] = Query(None),
    priority_filter: Optional[str] = Query(None),
    department_filter: Optional[str] = Query(None),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get announcements with filtering and pagination"""
    
    # Build query
    query = db.query(Announcement)
    
    # Apply filters
    if active_only:
        query = query.filter(Announcement.is_active == True)
    
    if type_filter:
        query = query.filter(Announcement.type == type_filter)
    
    if priority_filter:
        query = query.filter(Announcement.priority == priority_filter)
    
    if department_filter:
        query = query.filter(
            or_(
                Announcement.department == department_filter,
                Announcement.department.is_(None)
            )
        )
    
    # Filter by user role (check target_roles)
    user_role = current_user.get("user_metadata", {}).get("role")
    if user_role:
        query = query.filter(
            or_(
                Announcement.target_roles.is_(None),
                Announcement.target_roles.contains(f'"{user_role}"')
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    announcements = query.order_by(
        Announcement.is_pinned.desc(),
        Announcement.priority.desc(),
        Announcement.published_at.desc()
    ).offset(offset).limit(per_page).all()
    
    return AnnouncementListResponse(
        announcements=announcements,
        total=total,
        page=page,
        per_page=per_page,
        has_next=offset + per_page < total,
        has_prev=page > 1
    )


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific announcement"""
    
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id
    ).first()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return announcement


@router.post("/", response_model=AnnouncementResponse)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new announcement"""
    
    # Check if user has permission to create announcements
    user_role = current_user.get("user_metadata", {}).get("role")
    allowed_roles = ["system_admin", "hr_personnel", "finance_staff", "academic_staff"]
    
    if user_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create announcements"
        )
    
    # Create announcement
    announcement = Announcement(
        **announcement_data.model_dump(),
        author_id=current_user["id"],
        author_name=current_user.get("user_metadata", {}).get("full_name", "Unknown"),
        author_role=user_role
    )
    
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    
    return announcement


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: str,
    announcement_data: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an announcement"""
    
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id
    ).first()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Check permissions (only author or admin can update)
    user_role = current_user.get("user_metadata", {}).get("role")
    if (announcement.author_id != current_user["id"] and 
        user_role not in ["system_admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update this announcement"
        )
    
    # Update announcement
    update_data = announcement_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)
    
    db.commit()
    db.refresh(announcement)
    
    return announcement


@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an announcement"""
    
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id
    ).first()
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    # Check permissions (only author or admin can delete)
    user_role = current_user.get("user_metadata", {}).get("role")
    if (announcement.author_id != current_user["id"] and 
        user_role not in ["system_admin"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete this announcement"
        )
    
    db.delete(announcement)
    db.commit()
    
    return {"message": "Announcement deleted successfully"}