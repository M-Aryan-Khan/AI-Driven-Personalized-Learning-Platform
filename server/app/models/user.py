# server/app/models/user.py

from pydantic import BaseModel, EmailStr

class User(BaseModel):
    name: str
    email: EmailStr
    role: str  # e.g. 'student' or 'educator'
