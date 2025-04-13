
from fastapi import APIRouter, Depends
from app.models.educator import Educator
from app.utils.auth import require_role
from app.db.mongo import db

router = APIRouter(

    tags = ["Educators"],
    prefix = "/educators"
)

@router.get("/")
def get_all_educators(educator: dict = Depends(require_role("educator"))):
    educators = []
    for educator in db.educators.find():
        educator["_id"] = str(educator["_id"])  # Convert ObjectId to string
        educators.append(educator)
    return educators
