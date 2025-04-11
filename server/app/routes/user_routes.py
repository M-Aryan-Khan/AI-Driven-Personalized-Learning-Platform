# server/app/routes/user_routes.py

from fastapi import APIRouter
from app.models.user import User
from app.db.mongo import db

router = APIRouter()

@router.post("/users")
def create_user(user: User):
    db.users.insert_one(user.dict())
    return {"message": "User created successfully"}

@router.get("/users")
def get_users():
    users = list(db.users.find({}, {"_id": 0}))  # Exclude MongoDB's _id
    return {"users": users}
