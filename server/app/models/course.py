# server/app/models/course.py

from pydantic import BaseModel

class Course(BaseModel):
    title: str
    description: str
    content: str
