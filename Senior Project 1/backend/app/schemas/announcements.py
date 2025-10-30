"""
Pydantic schemas for announcements
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.announcements import AnnouncementType, AnnouncementPriority


class AnnouncementBase(BaseModel):
    """Base announcement schema"""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    type: AnnouncementType = AnnouncementType.GENERAL
    priority: AnnouncementPriority = AnnouncementPriority.MEDIUM
    target_roles: Optional[List[str]] = None
    department: Optional[str] = None
    is_pinned: bool = False
    expires_at: Optional[datetime] = None


class AnnouncementCreate(AnnouncementBase):
    """Schema for creating announcements"""
    pass


class AnnouncementUpdate(BaseModel):
    """Schema for updating announcements"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    type: Optional[AnnouncementType] = None
    priority: Optional[AnnouncementPriority] = None
    target_roles: Optional[List[str]] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None
    expires_at: Optional[datetime] = None


class AnnouncementResponse(AnnouncementBase):
    """Schema for announcement responses"""
    id: str
    author_id: str
    author_name: str
    author_role: str
    is_active: bool
    published_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnnouncementListResponse(BaseModel):
    """Schema for announcement list responses"""
    announcements: List[AnnouncementResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool