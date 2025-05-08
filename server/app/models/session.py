from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SessionBase(BaseModel):
    student_id: str
    expert_id: str
    date: datetime
    duration: int = Field(..., ge=30, le=180)  # Duration in minutes
    topic: str
    description: Optional[str] = None
    meeting_link: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    date: Optional[datetime] = None
    duration: Optional[int] = Field(None, ge=30, le=180)
    topic: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None

class SessionResponse(SessionBase):
    id: str
    status: str  # scheduled, completed, cancelled
    created_at: datetime
    updated_at: Optional[datetime] = None
    expert_name: Optional[str] = None
    expert_profile_image: Optional[str] = None
    student_name: Optional[str] = None
    student_profile_image: Optional[str] = None
    notes: Optional[str] = None
    materials: Optional[List[str]] = None
    recording_url: Optional[str] = None
