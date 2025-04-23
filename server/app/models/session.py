from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SessionCreate(BaseModel):
    expert_id: str
    student_id: str
    date: datetime
    duration: int  # in minutes
    topic: str
    description: Optional[str] = None

class SessionUpdate(BaseModel):
    status: Optional[str] = None  # scheduled, completed, cancelled
    notes: Optional[str] = None
    recording_url: Optional[str] = None

class SessionInDB(BaseModel):
    id: str
    expert_id: str
    student_id: str
    date: datetime
    duration: int
    topic: str
    description: Optional[str] = None
    status: str = "scheduled"  # scheduled, completed, cancelled
    notes: Optional[str] = None
    recording_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SessionResponse(SessionInDB):
    expert_name: str
    student_name: str
    expert_profile_image: Optional[str] = None
    student_profile_image: Optional[str] = None
