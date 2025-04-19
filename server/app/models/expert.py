from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict
from datetime import datetime
from .user import UserBase, UserCreate, UserResponse

class ExpertCreate(UserCreate):
    role: str = "expert"
    specialty: Optional[str] = None

class ExpertUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    specialty: Optional[str] = None
    tags: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    time_zone: Optional[str] = None
    languages: Optional[List[str]] = None
    education: Optional[List[Dict]] = None
    experience: Optional[List[Dict]] = None
    availability: Optional[Dict] = None

class ExpertInDB(UserResponse):
    role: str = "expert"
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    specialty: Optional[str] = None
    tags: Optional[List[str]] = []
    hourly_rate: Optional[float] = 45.0
    rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
    is_approved: Optional[bool] = False
    approval_status: Optional[str] = "pending"  # pending, approved, rejected
    time_zone: Optional[str] = None
    languages: Optional[List[str]] = []
    education: Optional[List[Dict]] = []
    experience: Optional[List[Dict]] = []
    availability: Optional[Dict] = {}
    completed_sessions: Optional[int] = 0
    
    class Config:
        orm_mode = True

class ExpertProfile(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    specialty: Optional[str] = None
    tags: Optional[List[str]] = []
    hourly_rate: Optional[float] = 45.0
    rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
    is_approved: Optional[bool] = False
    time_zone: Optional[str] = None
    languages: Optional[List[str]] = []
    education: Optional[List[Dict]] = []
    experience: Optional[List[Dict]] = []
    completed_sessions: Optional[int] = 0
    
    class Config:
        orm_mode = True

class ExpertSearchResult(BaseModel):
    id: str
    first_name: str
    last_name: str
    profile_image: Optional[str] = None
    specialty: Optional[str] = None
    tags: Optional[List[str]] = []
    hourly_rate: Optional[float] = 45.0
    rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0
