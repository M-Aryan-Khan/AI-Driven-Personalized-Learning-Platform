from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from .JWTtoken import verify_token
from ..db.mongo import db
from bson import ObjectId
from datetime import datetime, timezone

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get the current user from the JWT token
    
    Args:
        token (str): JWT token
        
    Returns:
        dict: User data
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token)
    if token_data is None:
        raise credentials_exception
    
    # Check if token is expired
    if token_data.exp < datetime.now(timezone.utc):
        raise credentials_exception
    
    # Find user in database
    if token_data.role == "student":
        user = db.students.find_one({"email": token_data.email})
    elif token_data.role == "expert":
        user = db.experts.find_one({"email": token_data.email})
    else:
        raise credentials_exception
    
    if user is None:
        raise credentials_exception
    
    # Convert ObjectId to string
    user["_id"] = str(user["_id"])
    
    return {
        "id": user["_id"],
        "email": user["email"],
        "role": token_data.role,
        "is_verified": user.get("is_verified", False)
    }

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """
    Get the current active user
    
    Args:
        current_user (dict): Current user data
        
    Returns:
        dict: User data
        
    Raises:
        HTTPException: If user is not verified
    """
    if not current_user.get("is_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please check your email for verification instructions."
        )
    return current_user

def get_current_user_from_cookie(access_token: Optional[str] = Cookie(None)):
    """
    Get the current user from the access token cookie
    
    Args:
        access_token (str, optional): JWT token from cookie
        
    Returns:
        dict: User data or None if no token
    """
    if not access_token:
        return None
    
    token_data = verify_token(access_token)
    if token_data is None:
        return None
    
    # Check if token is expired
    if token_data.exp < datetime.now(timezone.utc):
        return None
    
    # Find user in database
    if token_data.role == "student":
        user = db.students.find_one({"email": token_data.email})
    elif token_data.role == "expert":
        user = db.experts.find_one({"email": token_data.email})
    else:
        return None
    
    if user is None:
        return None
    
    # Convert ObjectId to string
    user["_id"] = str(user["_id"])
    
    return {
        "id": user["_id"],
        "email": user["email"],
        "role": token_data.role,
        "is_verified": user.get("is_verified", False)
    }

def require_role(required_role: str):
    """
    Dependency to require a specific role
    
    Args:
        required_role (str): Required role (student or expert)
        
    Returns:
        function: Dependency function
    """
    async def role_dependency(current_user: dict = Depends(get_current_active_user)):
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied. Requires role: " + required_role
            )
        return current_user
    return role_dependency
