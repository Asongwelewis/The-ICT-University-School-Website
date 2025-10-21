from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    profile: Optional[Dict[str, Any]] = None
    permissions: Optional[List[str]] = None


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    profile: Dict[str, Any]
    permissions: List[str]
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse