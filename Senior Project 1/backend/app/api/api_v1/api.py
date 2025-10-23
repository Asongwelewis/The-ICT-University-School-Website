from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, academic, finance, hr

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(academic.router, prefix="/academic", tags=["academic"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router.include_router(hr.router, prefix="/hr", tags=["hr"])