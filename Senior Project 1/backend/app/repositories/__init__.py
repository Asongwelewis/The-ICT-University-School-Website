"""
Repository layer for data access.
"""

from .base import BaseRepository
from .profile_repository import ProfileRepository
from .academic_repository import AcademicRepository
from .finance_repository import FinanceRepository
from .hr_repository import HRRepository
from .marketing_repository import MarketingRepository

__all__ = [
    "BaseRepository",
    "ProfileRepository", 
    "AcademicRepository",
    "FinanceRepository",
    "HRRepository",
    "MarketingRepository"
]