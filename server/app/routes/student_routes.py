# server/app/routes/user_routes.py

from fastapi import APIRouter,Depends
from app.models.student import Student
from app.utils.auth import require_role
from app.db.mongo import db

router = APIRouter(

    tags = ["Students"],
    prefix = "/students"
)

@router.get("/")
def get_all_students(student: dict = Depends(require_role("student"))):
    students = []
    for student in db.students.find():
        student["_id"] = str(student["_id"])  # Convert ObjectId to string
        students.append(student)
    return students
