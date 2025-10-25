"""
Database models for the School ERP System.

This module provides a centralized import point for all database models.
Models are imported conditionally to avoid ImportError for non-existent modules.
"""

from .base import Base
from .profiles import Profile
from .departments import Department

# Initialize __all__ with existing models
__all__ = [
    "Base",
    "Profile", 
    "Department"
]

# Conditionally import academic models
try:
    from .academic import Course, Enrollment, Attendance, Grade
    __all__.extend(["Course", "Enrollment", "Attendance", "Grade"])
except ImportError:
    pass

# Conditionally import finance models  
try:
    from .finance import FeeStructure, Invoice, Payment
    __all__.extend(["FeeStructure", "Invoice", "Payment"])
except ImportError:
    pass

# Conditionally import HR models
try:
    from .hr import Employee, LeaveRequest
    __all__.extend(["Employee", "LeaveRequest"])
except ImportError:
    pass

# Conditionally import marketing models
try:
    from .marketing import Campaign, Lead
    __all__.extend(["Campaign", "Lead"])
except ImportError:
    pass

# Conditionally import system models
try:
    from .system import SystemSetting, AuditLog
    __all__.extend(["SystemSetting", "AuditLog"])
except ImportError:
    pass

# Conditionally import attachment models
try:
    from .attachments import Attachment
    __all__.extend(["Attachment"])
except ImportError:
    pass

# Always import factory and utilities
from .factory import ModelFactory, ModelValidator, ModelRepository
__all__.extend(["ModelFactory", "ModelValidator", "ModelRepository"])