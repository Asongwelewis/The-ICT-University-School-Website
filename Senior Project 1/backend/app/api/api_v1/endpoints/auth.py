"""
Authentication endpoints for ICT University ERP System

This module handles user authentication using Supabase:
- User registration
- User login
- Token verification
- Password reset
- User profile management
"""

from typing import Any, Dict, Union
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import httpx
import json
from datetime import datetime
from supabase import create_client, Client

from app.core.config import settings
from app.core.security import verify_supabase_token, get_current_user
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate

router = APIRouter()
security = HTTPBearer()

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def serialize_datetime(obj):
    """Helper function to serialize datetime objects"""
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    elif isinstance(obj, str):
        return obj
    else:
        return str(obj) if obj is not None else None


def safe_serialize_user(user_obj):
    """Safely serialize user object avoiding datetime issues"""
    if not user_obj:
        return {}
    
    return {
        "id": getattr(user_obj, 'id', None),
        "email": getattr(user_obj, 'email', None),
        "created_at": serialize_datetime(getattr(user_obj, 'created_at', None)),
        "updated_at": serialize_datetime(getattr(user_obj, 'updated_at', None)),
        "last_sign_in_at": serialize_datetime(getattr(user_obj, 'last_sign_in_at', None)),
        "email_confirmed_at": serialize_datetime(getattr(user_obj, 'email_confirmed_at', None)),
        "user_metadata": getattr(user_obj, 'user_metadata', {}) or {},
        "app_metadata": getattr(user_obj, 'app_metadata', {}) or {},
    }


class AuthResponse(BaseModel):
    """Authentication response model"""
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    expires_in: int


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str


class RegistrationPendingResponse(BaseModel):
    """Response for registration requiring email confirmation"""
    message: str
    user: Dict[str, Any]
    email_confirmation_required: bool = True


@router.post("/register")
async def register_user(user_data: UserCreate) -> Union[AuthResponse, RegistrationPendingResponse]:
    """
    Register a new user with Supabase Auth
    
    Args:
        user_data: User registration data including email, password, and profile info
        
    Returns:
        AuthResponse: Access token and user information
        
    Raises:
        HTTPException: If registration fails
    """
    try:
        # Register user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name,
                    "role": user_data.role,
                    "phone": user_data.phone,
                    "department": getattr(user_data, 'department', None),
                    "student_id": getattr(user_data, 'student_id', None),
                    "employee_id": getattr(user_data, 'employee_id', None),
                }
            }
        })
        
        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Please check your information."
            )
        
        # Create user profile in public.profiles table
        profile_data = {
            "id": auth_response.user.id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "phone": user_data.phone,
            "department": getattr(user_data, 'department', None),
            "student_id": getattr(user_data, 'student_id', None),
            "employee_id": getattr(user_data, 'employee_id', None),
            "is_active": True,
            "created_at": serialize_datetime(auth_response.user.created_at),
        }
        
        # Try to insert profile data (optional - will work without profiles table)
        try:
            profile_response = supabase.table("profiles").insert(profile_data).execute()
        except Exception as profile_error:
            # Profile creation failed, but auth user was created successfully
            # This is okay - we can work without the profiles table for now
            print(f"Profile creation failed (this is okay): {profile_error}")
        
        # Convert user data to dict with safe serialization
        user_dict = safe_serialize_user(auth_response.user)
        
        # Handle case where session is None (email confirmation required)
        if auth_response.session is None:
            # User created but needs email confirmation
            return RegistrationPendingResponse(
                message="Registration successful! Please check your email to confirm your account before logging in.",
                user=user_dict,
                email_confirmation_required=True
            )
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            user=user_dict,
            expires_in=auth_response.session.expires_in or 3600
        )
        
    except Exception as e:
        if "already registered" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=AuthResponse)
async def login_user(user_credentials: UserLogin) -> AuthResponse:
    """
    Authenticate user with Supabase Auth
    
    Args:
        user_credentials: User login credentials (email and password)
        
    Returns:
        AuthResponse: Access token and user information
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_credentials.email,
            "password": user_credentials.password
        })
        
        if auth_response.user is None or auth_response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Get user profile from database
        profile_response = supabase.table("profiles").select("*").eq("id", auth_response.user.id).execute()
        
        user_profile = {}
        if profile_response.data:
            user_profile = profile_response.data[0]
        
        # Create properly serialized user data
        user_data = safe_serialize_user(auth_response.user)
        
        # Merge profile data if available
        if user_profile:
            user_data.update(user_profile)
        
        return AuthResponse(
            access_token=auth_response.session.access_token,
            user=user_data,
            expires_in=auth_response.session.expires_in or 3600
        )
        
    except Exception as e:
        if "invalid" in str(e).lower() or "unauthorized" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout_user(current_user: Dict = Depends(get_current_user)) -> MessageResponse:
    """
    Logout current user by invalidating the session
    
    Args:
        current_user: Current authenticated user from dependency
        
    Returns:
        MessageResponse: Success message
    """
    try:
        # Sign out from Supabase (this invalidates the session)
        supabase.auth.sign_out()
        
        return MessageResponse(message="Successfully logged out")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Logout failed: {str(e)}"
        )


@router.get("/me")
async def get_current_user_profile(current_user: Dict = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get current user's profile information
    
    Args:
        current_user: Current authenticated user from dependency
        
    Returns:
        Dict: User profile information from JWT token
    """
    try:
        # Extract user metadata from JWT token
        user_metadata = current_user.get("user_metadata", {})
        
        # Create user profile from JWT data
        profile = {
            "id": current_user.get("id"),
            "email": current_user.get("email"),
            "full_name": user_metadata.get("full_name"),
            "phone": user_metadata.get("phone"),
            "role": user_metadata.get("role"),
            "department": user_metadata.get("department"),
            "student_id": user_metadata.get("student_id"),
            "employee_id": user_metadata.get("employee_id"),
            "is_active": True,
            "email_verified": user_metadata.get("email_verified", False),
            "phone_verified": user_metadata.get("phone_verified", False),
            "created_at": current_user.get("created_at"),
            "updated_at": current_user.get("updated_at"),
            "last_sign_in_at": current_user.get("last_sign_in_at"),
            "email_confirmed_at": current_user.get("email_confirmed_at"),
        }
        
        # Try to get additional profile data from database if profiles table exists
        try:
            profile_response = supabase.table("profiles").select("*").eq("id", current_user["id"]).execute()
            if profile_response.data:
                # Merge database profile data
                db_profile = profile_response.data[0]
                profile.update(db_profile)
        except Exception:
            # Profiles table doesn't exist or query failed - that's okay
            pass
        
        return profile
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get user profile: {str(e)}"
        )


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: Dict = Depends(get_current_user)
) -> UserResponse:
    """
    Update current user's profile information
    
    Args:
        user_update: Updated user information
        current_user: Current authenticated user from dependency
        
    Returns:
        UserResponse: Updated user profile information
    """
    try:
        # Prepare update data (exclude None values)
        update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data provided for update"
            )
        
        # Update profile in database
        update_response = supabase.table("profiles").update(update_data).eq("id", current_user["id"]).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update profile"
            )
        
        updated_profile = update_response.data[0]
        
        return UserResponse(**updated_profile)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(email: EmailStr) -> MessageResponse:
    """
    Send password reset email to user
    
    Args:
        email: User's email address
        
    Returns:
        MessageResponse: Success message
    """
    try:
        # Send password reset email via Supabase
        supabase.auth.reset_password_email(email)
        
        return MessageResponse(
            message="If an account with this email exists, a password reset link has been sent."
        )
        
    except Exception as e:
        # Don't reveal whether the email exists or not for security
        return MessageResponse(
            message="If an account with this email exists, a password reset link has been sent."
        )


@router.post("/verify-token", response_model=Dict[str, Any])
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Verify JWT token validity
    
    Args:
        credentials: Bearer token from Authorization header
        
    Returns:
        Dict: Token verification result and user info
    """
    try:
        # Verify token using our security function
        user_data = await verify_supabase_token(credentials.credentials)
        
        return {
            "valid": True,
            "user": user_data,
            "message": "Token is valid"
        }
        
    except HTTPException as e:
        return {
            "valid": False,
            "user": None,
            "message": e.detail
        }
    except Exception as e:
        return {
            "valid": False,
            "user": None,
            "message": f"Token verification failed: {str(e)}"
        }