"""
Main API router for ICT University ERP System

This module combines all API endpoints into a single router:
- Authentication endpoints
- Academic management endpoints
- Financial management endpoints  
- HR management endpoints
- Marketing management endpoints
- System administration endpoints
"""

from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, academic, finance, hr, marketing, admin

# Create main API router
api_router = APIRouter()

# Include all endpoint routers with their respective prefixes and tags

# Authentication endpoints - handles user login, registration, role management
api_router.include_router(
    auth.router, 
    prefix="/auth", 
    tags=["Authentication"]
)

# Academic management endpoints - courses, grades, attendance
api_router.include_router(
    academic.router, 
    prefix="/academic", 
    tags=["Academic Management"]
)

# Financial management endpoints - invoices, payments, reports
api_router.include_router(
    finance.router, 
    prefix="/finance", 
    tags=["Financial Management"]
)

# HR management endpoints - employees, payroll, leave management
api_router.include_router(
    hr.router, 
    prefix="/hr", 
    tags=["Human Resources"]
)

# Marketing management endpoints - campaigns, leads, analytics
api_router.include_router(
    marketing.router, 
    prefix="/marketing", 
    tags=["Marketing Management"]
)

# System administration endpoints - user management, system settings
api_router.include_router(
    admin.router, 
    prefix="/admin", 
    tags=["System Administration"]
)