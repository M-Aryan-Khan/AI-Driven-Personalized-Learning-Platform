from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str
    student_id: str
    student_name: str
    student_profile_image: Optional[str] = None
    expert_id: str
    created_at: datetime
    session_id: Optional[str] = None
