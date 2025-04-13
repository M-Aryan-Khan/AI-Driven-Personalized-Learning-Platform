
from fastapi import APIRouter, HTTPException, Depends
from app.models.user import User
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.hash import hash_password, verify_password
from app.utils.JWTtoken import create_access_token
from app.db.mongo import db

router = APIRouter(
    tags = ["Authentication"],
)

@router.post("/register")
def register(user: User):
    user_dict = user.dict()
    if user_dict["role"] == "educator":
       existing_educator = db.educators.find_one({"email": user_dict["email"]})
       if existing_educator:
          raise HTTPException(status_code=409, detail="User with this email already exists")
       user_dict["password"] = hash_password(user_dict["password"])
       db.educators.insert_one(user_dict)

    elif user_dict["role"] == "student":
        existing_student = db.students.find_one({"email": user_dict["email"]})
        if existing_student:
          raise HTTPException(status_code=409, detail="User with this email already exists")
        user_dict["password"] = hash_password(user_dict["password"])
        db.students.insert_one(user_dict)

    else:
        raise HTTPException(status_code=400, detail="Invalid role")
    return {"message": "User created successfully"}


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.students.find_one({"email": form_data.username})
    user_role = "student"

    # If not found in students, try educators
    if not user:
        user = db.educators.find_one({"email": form_data.username})
        user_role = "educator"

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_access_token({
        "sub": user["email"],
        "role": user_role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user_role
    }