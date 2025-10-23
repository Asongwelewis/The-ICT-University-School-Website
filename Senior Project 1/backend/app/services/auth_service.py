"""
Authentication service for user management and authentication.
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from app.schemas.auth import UserCreate, UserLogin, LoginResponse, UserResponse
from app.models.user import User


class AuthService:
    """Service class for authentication operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """
        Create a new user account.
        
        Args:
            user_data: User creation data
            
        Returns:
            Created user information
            
        Raises:
            ValueError: If user already exists or validation fails
        """
        try:
            # Check if user already exists
            existing_user = self.db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                raise ValueError("User with this email already exists")
            
            # Hash password
            hashed_password = get_password_hash(user_data.password)
            
            # Create user
            db_user = User(
                email=user_data.email,
                hashed_password=hashed_password,
                role=user_data.role,
                profile={
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name
                },
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            
            return UserResponse(
                id=db_user.id,
                email=db_user.email,
                role=db_user.role,
                profile=db_user.profile,
                permissions=db_user.permissions or [],
                is_active=db_user.is_active,
                created_at=db_user.created_at,
                updated_at=db_user.updated_at
            )
            
        except IntegrityError:
            self.db.rollback()
            raise ValueError("User with this email already exists")
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Failed to create user: {str(e)}")
    
    async def login(self, credentials: UserLogin) -> LoginResponse:
        """
        Authenticate user and return access token.
        
        Args:
            credentials: User login credentials
            
        Returns:
            Login response with access token and user info
            
        Raises:
            ValueError: If authentication fails
        """
        # Find user by email
        user = self.db.query(User).filter(User.email == credentials.email).first()
        
        if not user:
            raise ValueError("Invalid email or password")
        
        if not user.is_active:
            raise ValueError("Account is deactivated")
        
        # Verify password
        if not verify_password(credentials.password, user.hashed_password):
            raise ValueError("Invalid email or password")
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=str(user.id),
            expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            profile=user.profile,
            permissions=user.permissions or [],
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        return self.db.query(User).filter(User.email == email).first()
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        """Get user by ID."""
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return None
        
        return UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            profile=user.profile,
            permissions=user.permissions or [],
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
            updated_at=user.updated_at
        )