"""
HR management endpoints for ICT University ERP System

This module handles HR operations:
- Employee management
- Payroll processing
- Leave management
"""

from fastapi import APIRouter, Depends
from typing import Dict
from app.core.security import get_current_user

router = APIRouter()


@router.get("/employees")
async def get_employees(current_user: Dict = Depends(get_current_user)):
    """Get employees"""
    return {"message": "HR employees endpoint - coming soon", "user": current_user["email"]}


@router.get("/payroll")
async def get_payroll(current_user: Dict = Depends(get_current_user)):
    """Get payroll"""
    return {"message": "HR payroll endpoint - coming soon", "user": current_user["email"]}