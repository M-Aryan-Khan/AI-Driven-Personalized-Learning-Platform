from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CardType(str, Enum):
    VISA = "visa"
    MASTERCARD = "mastercard"
    AMEX = "amex"
    DISCOVER = "discover"
    OTHER = "other"

class PaymentMethod(BaseModel):
    id: Optional[str] = None
    card_type: CardType
    last_four: str
    expiry_month: str
    expiry_year: str
    cardholder_name: str
    is_default: bool = False
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentHistory(BaseModel):
    id: str
    student_id: str
    expert_id: Optional[str] = None
    session_id: Optional[str] = None
    amount: float
    currency: str = "USD"
    status: PaymentStatus
    payment_method_id: str
    payment_method_last_four: str
    date: datetime
    description: str
    
    class Config:
        from_attributes = True
