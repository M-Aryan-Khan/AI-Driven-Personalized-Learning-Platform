from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from .user import UserBase, UserCreate, UserResponse

class StudentCreate(UserCreate):
    role: str = "student"

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    learning_goals: Optional[List[str]] = None
    preferred_languages: Optional[List[str]] = None
    time_zone: Optional[str] = None

class StudentInDB(UserResponse):
    role: str = "student"
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    learning_goals: Optional[List[str]] = []
    preferred_languages: Optional[List[str]] = []
    time_zone: Optional[str] = None
    bookmarked_experts: Optional[List[str]] = []
    completed_sessions: Optional[int] = 0
    
    class Config:
        from_attributes = True

class StudentProfile(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    learning_goals: Optional[List[str]] = []
    preferred_languages: Optional[List[str]] = []
    time_zone: Optional[str] = None
    completed_sessions: Optional[int] = 0
    
    class Config:
        from_attributes = True
