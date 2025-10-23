"""
Financial management endpoints for ICT University ERP System

This module handles financial operations:
- Invoice management
- Payment processing
- Financial reports
"""

from fastapi import APIRouter, Depends
from typing import Dict
from app.core.security import get_current_user

router = APIRouter()


@router.get("/invoices")
async def get_invoices(current_user: Dict = Depends(get_current_user)):
    """Get invoices"""
    return {"message": "Finance invoices endpoint - coming soon", "user": current_user["email"]}


@router.get("/payments")
async def get_payments(current_user: Dict = Depends(get_current_user)):
    """Get payments"""
    return {"message": "Finance payments endpoint - coming soon", "user": current_user["email"]}