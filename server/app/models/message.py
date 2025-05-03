from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    timestamp: datetime
    read: bool = False
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    expert_id: str
    expert_name: str
    expert_profile_image: Optional[str] = None
    last_message: str
    last_message_date: datetime
    unread: bool = False
    
    class Config:
        from_attributes = True
