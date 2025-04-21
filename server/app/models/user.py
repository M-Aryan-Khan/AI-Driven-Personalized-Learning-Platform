from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    
    @validator('first_name', 'last_name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

class UserCreate(UserBase):
    password: str
    confirm_password: str
    agree_terms: bool = False
    receive_updates: bool = False
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('agree_terms')
    def must_agree_terms(cls, v):
        if not v:
            raise ValueError('You must agree to the terms and conditions')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    is_verified: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    exp: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    is_verified: bool

class PasswordReset(BaseModel):
    email: EmailStr

class VerifyEmail(BaseModel):
    email: EmailStr
    verification_code: str

class ResetPassword(BaseModel):
    email: EmailStr
    reset_code: str
    password: str
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
