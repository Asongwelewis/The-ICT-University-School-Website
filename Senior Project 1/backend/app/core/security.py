"""
Security utilities for ICT University ERP System with Supabase Integration

This module provides:
- Supabase JWT token verification
- Role-based access control decorators
- User authentication via Supabase
- Permission management system
"""

from datetime import datetime, timedelta
from typing import Any, Union, Optional, List, Dict
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import logging

from app.core.config import settings, UserRoles, ROLE_PERMISSIONS

# Configure logging
logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer()

# Supabase client for backend operations
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify Supabase JWT token and extract user information
    
    Args:
        token: JWT token from Supabase authentication
    
    Returns:
        dict: Decoded token payload with user info or None if invalid
    """
    try:
        # Decode JWT token using Supabase JWT secret
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,  # Use the unified JWT secret
            algorithms=[settings.JWT_ALGORITHM],
            audience="authenticated"
        )
        
        # Check if token has expired
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            logger.warning("Supabase token has expired")
            return None
        
        return payload
        
    except JWTError as e:
        logger.warning(f"Supabase JWT verification failed: {e}")
        return None


async def get_user_from_supabase(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user information from Supabase
    
    Args:
        user_id: Supabase user ID
    
    Returns:
        dict: User information from Supabase or None if not found
    """
    try:
        # Get user from Supabase auth
        response = supabase.auth.admin.get_user_by_id(user_id)
        
        if response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata or {},
                "app_metadata": response.user.app_metadata or {},
                "created_at": response.user.created_at,
                "email_confirmed_at": response.user.email_confirmed_at,
                "last_sign_in_at": response.user.last_sign_in_at,
            }
        
        return None
        
    except Exception as e:
        logger.error(f"Failed to get user from Supabase: {e}")
        return None


async def update_user_role_in_supabase(user_id: str, role: str, permissions: List[str]) -> bool:
    """
    Update user role and permissions in Supabase user metadata
    
    Args:
        user_id: Supabase user ID
        role: User role
        permissions: List of user permissions
    
    Returns:
        bool: True if update successful, False otherwise
    """
    try:
        # Update user metadata in Supabase
        response = supabase.auth.admin.update_user_by_id(
            user_id,
            {
                "user_metadata": {
                    "role": role,
                    "permissions": permissions,
                }
            }
        )
        
        if response.user:
            logger.info(f"Updated role for user {user_id}: {role}")
            return True
        
        return False
        
    except Exception as e:
        logger.error(f"Failed to update user role in Supabase: {e}")
        return False


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    FastAPI dependency to get current authenticated user from Supabase
    
    Args:
        credentials: HTTP Bearer token from Supabase authentication
    
    Returns:
        dict: Current authenticated user information from Supabase
    
    Raises:
        HTTPException: If token is invalid or user not found
    
    Usage:
        @app.get("/protected")
        def protected_route(current_user: dict = Depends(get_current_user)):
            return {"user": current_user["email"]}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify Supabase JWT token
        payload = await verify_supabase_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        # Extract user ID from token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user information from Supabase
        user_info = await get_user_from_supabase(user_id)
        
        if user_info is None:
            raise credentials_exception
        
        # Check if user email is confirmed
        if not user_info.get("email_confirmed_at"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email not verified"
            )
        
        # Add role and permissions from user metadata
        user_metadata = user_info.get("user_metadata", {})
        user_role = user_metadata.get("role", UserRoles.STUDENT)  # Default to student
        user_permissions = ROLE_PERMISSIONS.get(user_role, [])
        
        # Return enhanced user information
        return {
            **user_info,
            "role": user_role,
            "permissions": user_permissions,
            "is_staff": user_role in UserRoles.get_staff_roles(),
            "is_admin": user_role in UserRoles.get_admin_roles(),
        }
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise credentials_exception


def require_roles(allowed_roles: List[str]):
    """
    Decorator factory for role-based access control
    
    Args:
        allowed_roles: List of roles that can access the endpoint
    
    Returns:
        Dependency function for FastAPI
    
    Usage:
        @app.get("/admin-only")
        def admin_endpoint(
            current_user: User = Depends(require_roles([UserRoles.SYSTEM_ADMIN]))
        ):
            return {"message": "Admin access granted"}
    """
    def role_checker(current_user = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}"
            )
        return current_user
    
    return role_checker


def require_permissions(required_permissions: List[str]):
    """
    Decorator factory for permission-based access control
    
    Args:
        required_permissions: List of permissions required to access endpoint
    
    Returns:
        Dependency function for FastAPI
    
    Usage:
        @app.get("/manage-users")
        def manage_users(
            current_user: User = Depends(require_permissions(["manage_users"]))
        ):
            return {"message": "User management access granted"}
    """
    def permission_checker(current_user = Depends(get_current_user)):
        # Get user's permissions based on role
        user_permissions = ROLE_PERMISSIONS.get(current_user.role, [])
        
        # Check if user has all required permissions
        missing_permissions = set(required_permissions) - set(user_permissions)
        
        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Missing permissions: {list(missing_permissions)}"
            )
        
        return current_user
    
    return permission_checker


def require_admin():
    """
    Dependency that requires admin role (system_admin or hr_personnel)
    
    Returns:
        User: Current user if they have admin privileges
    
    Usage:
        @app.get("/admin-dashboard")
        def admin_dashboard(admin_user: User = Depends(require_admin)):
            return {"message": "Welcome to admin dashboard"}
    """
    from app.core.config import UserRoles
    
    admin_roles = [UserRoles.SYSTEM_ADMIN, UserRoles.HR_PERSONNEL]
    return require_roles(admin_roles)


def require_staff():
    """
    Dependency that requires staff role (any non-student role)
    
    Returns:
        User: Current user if they are staff member
    
    Usage:
        @app.get("/staff-portal")
        def staff_portal(staff_user: User = Depends(require_staff)):
            return {"message": "Welcome to staff portal"}
    """
    staff_roles = UserRoles.get_staff_roles()
    return require_roles(staff_roles)


class SecurityUtils:
    """
    Utility class for security-related operations
    """
    
    @staticmethod
    def generate_password_reset_token(email: str) -> str:
        """
        Generate password reset token
        
        Args:
            email: User email address
        
        Returns:
            str: Password reset token
        """
        delta = timedelta(hours=1)  # Token expires in 1 hour
        now = datetime.utcnow()
        expires = now + delta
        
        exp = expires.timestamp()
        encoded_jwt = jwt.encode(
            {"exp": exp, "nbf": now, "sub": email, "type": "password_reset"},
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )
        return encoded_jwt
    
    @staticmethod
    def verify_password_reset_token(token: str) -> Optional[str]:
        """
        Verify password reset token and extract email
        
        Args:
            token: Password reset token
        
        Returns:
            str: Email address if token is valid, None otherwise
        """
        try:
            decoded_token = jwt.decode(
                token, 
                settings.JWT_SECRET_KEY, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Check token type
            if decoded_token.get("type") != "password_reset":
                return None
            
            return decoded_token.get("sub")
            
        except JWTError:
            return None
    
    @staticmethod
    def generate_email_verification_token(email: str) -> str:
        """
        Generate email verification token
        
        Args:
            email: User email address
        
        Returns:
            str: Email verification token
        """
        delta = timedelta(days=7)  # Token expires in 7 days
        now = datetime.utcnow()
        expires = now + delta
        
        exp = expires.timestamp()
        encoded_jwt = jwt.encode(
            {"exp": exp, "nbf": now, "sub": email, "type": "email_verification"},
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )
        return encoded_jwt
    
    @staticmethod
    def verify_email_verification_token(token: str) -> Optional[str]:
        """
        Verify email verification token and extract email
        
        Args:
            token: Email verification token
        
        Returns:
            str: Email address if token is valid, None otherwise
        """
        try:
            decoded_token = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Check token type
            if decoded_token.get("type") != "email_verification":
                return None
            
            return decoded_token.get("sub")
            
        except JWTError:
            return None