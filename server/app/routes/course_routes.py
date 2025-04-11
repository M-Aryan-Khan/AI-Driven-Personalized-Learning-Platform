# server/app/routes/course_routes.py

from fastapi import APIRouter
from app.models.course import Course
from app.db.mongo import db

router = APIRouter()

@router.post("/courses")
def create_course(course: Course):
    db.courses.insert_one(course.dict())
    return {"message": "Course created successfully"}

@router.get("/courses")
def get_courses():
    courses = list(db.courses.find({}, {"_id": 0}))  # Exclude MongoDB's _id
    return {"courses": courses}
