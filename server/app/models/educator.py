from pydantic import BaseModel, EmailStr

class Educator(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  #'educator'