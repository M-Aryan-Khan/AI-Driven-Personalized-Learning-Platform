from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class ExpertBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    specialty: str
    hourly_rate: float
    bio: str
    languages: List[str]
    tags: List[str]
    experience_years: int
    education: str
    location: Optional[str] = None
    timezone: Optional[str] = None
    teaching_style: Optional[str] = None
    availability: Optional[Dict[str, List[str]]] = None
    what_to_expect: Optional[List[str]] = None
    phone: Optional[str] = None

class ExpertCreate(ExpertBase):
    password: str

class ExpertUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    specialty: Optional[str] = None
    hourly_rate: Optional[float] = None
    bio: Optional[str] = None
    languages: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    profile_image: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    teaching_style: Optional[str] = None
    availability: Optional[Dict[str, List[str]]] = None
    what_to_expect: Optional[List[str]] = None
    phone: Optional[str] = None

class ExpertSearchResult(BaseModel):
    id: str
    first_name: str
    last_name: str
    profile_image: Optional[str] = None
    specialty: Optional[str] = "General Tutoring"
    hourly_rate: float
    rating: float
    tags: List[str] = Field(default_factory=list)
    bio: Optional[str] = ""
    languages: List[str] = Field(default_factory=lambda: ["English"])
    experience_years: int = 0
    completed_sessions: int = 0

class ExpertProfile(ExpertSearchResult):
    education: Optional[str] = "Bachelor's Degree"
    location: Optional[str] = None
    timezone: Optional[str] = None
    teaching_style: Optional[str] = None
    availability: Optional[Dict[str, Any]] = None
    what_to_expect: Optional[List[str]] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class ExpertInDB(ExpertBase):
    id: str
    hashed_password: str
    is_verified: bool = False
    is_approved: bool = False
    is_profile_completed: bool = False
    verification_code: Optional[str] = None
    reset_code: Optional[str] = None
    profile_image: Optional[str] = None
    rating: float = 5.0
    completed_sessions: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
