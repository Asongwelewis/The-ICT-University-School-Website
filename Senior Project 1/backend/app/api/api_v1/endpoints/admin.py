"""
System administration endpoints for ICT University ERP System

This module handles admin operations:
- User management
- System settings
- Administrative reports
"""

from fastapi import APIRouter, Depends
from typing import Dict
from app.core.security import get_current_user, require_admin

router = APIRouter()


@router.get("/users")
async def get_users(current_user: Dict = Depends(require_admin())):
    """Get all users (admin only)"""
    return {"message": "Admin users endpoint - coming soon", "user": current_user["email"]}


@router.get("/settings")
async def get_settings(current_user: Dict = Depends(require_admin())):
    """Get system settings (admin only)"""
    return {"message": "Admin settings endpoint - coming soon", "user": current_user["email"]}