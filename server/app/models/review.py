from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    expert_id: str
    student_id: str
    session_id: str
    rating: int
    comment: Optional[str] = None
    
    @validator('rating')
    def rating_range(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class ReviewInDB(ReviewCreate):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: str
    expert_id: str
    student_id: str
    session_id: str
    rating: int
    comment: Optional[str] = None
    student_name: str
    student_profile_image: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
