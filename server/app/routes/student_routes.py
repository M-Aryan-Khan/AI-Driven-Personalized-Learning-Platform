from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from ..models.student import StudentUpdate, StudentProfile
from ..models.expert import ExpertSearchResult
from ..models.session import SessionCreate, SessionResponse
from ..utils.auth import get_current_active_user, require_role
from ..db.mongo import db

router = APIRouter(
    prefix="/api/students",
    tags=["Students"],
)

@router.get("/profile", response_model=StudentProfile)
async def get_student_profile(current_user: dict = Depends(require_role("student"))):
    """
    Get current student profile
    """
    student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Convert ObjectId to string
    student["id"] = str(student["_id"])
    
    return student

@router.put("/profile", response_model=StudentProfile)
async def update_student_profile(
    profile_update: StudentUpdate,
    current_user: dict = Depends(require_role("student"))
):
    """
    Update student profile
    """
    # Filter out None values
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )
    
    # Add updated_at timestamp
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    # Update student
    result = db.students.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get updated student
    updated_student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    
    # Convert ObjectId to string
    updated_student["id"] = str(updated_student["_id"])
    
    return updated_student

@router.post("/profile/image", response_model=dict)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("student"))
):
    """
    Upload student profile image
    
    Note: In a production environment, you would upload this to a cloud storage service
    like AWS S3, Google Cloud Storage, or Azure Blob Storage.
    """
    # Read file content
    file_content = await file.read()
    
    # In a real implementation, you would upload this to a cloud storage service
    # and store the URL in the database
    
    # For now, we'll just update a placeholder URL
    image_url = f"/profile-images/{current_user['id']}-{file.filename}"
    
    # Update student
    db.students.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "profile_image": image_url,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Profile image uploaded successfully", "image_url": image_url}

@router.get("/experts", response_model=List[ExpertSearchResult])
async def search_experts(
    specialty: Optional[str] = None,
    tags: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    min_rating: Optional[float] = None,
    current_user: dict = Depends(require_role("student"))
):
    """
    Search for experts
    """
    # Build query
    query = {"is_approved": True, "is_verified": True}
    
    if specialty:
        query["specialty"] = {"$regex": specialty, "$options": "i"}
    
    if tags:
        tag_list = tags.split(",")
        query["tags"] = {"$in": tag_list}
    
    if min_rate is not None or max_rate is not None:
        query["hourly_rate"] = {}
        if min_rate is not None:
            query["hourly_rate"]["$gte"] = min_rate
        if max_rate is not None:
            query["hourly_rate"]["$lte"] = max_rate
    
    if min_rating is not None:
        query["rating"] = {"$gte": min_rating}
    
    # Find experts
    experts = list(db.experts.find(query))
    
    # Convert ObjectId to string
    for expert in experts:
        expert["id"] = str(expert["_id"])
    
    return experts

@router.get("/experts/{expert_id}", response_model=ExpertSearchResult)
async def get_expert_details(
    expert_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Get expert details
    """
    expert = db.experts.find_one({"_id": ObjectId(expert_id)})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Convert ObjectId to string
    expert["id"] = str(expert["_id"])
    
    return expert

@router.post("/sessions", response_model=dict)
async def book_session(
    session: SessionCreate,
    current_user: dict = Depends(require_role("student"))
):
    """
    Book a session with an expert
    """
    # Verify expert exists
    expert = db.experts.find_one({"_id": ObjectId(session.expert_id)})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Verify student is booking for themselves
    if session.student_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only book sessions for yourself"
        )
    
    # Create session
    session_data = session.dict()
    session_data["created_at"] = datetime.now(timezone.utc)
    session_data["status"] = "scheduled"
    
    # Insert session
    result = db.sessions.insert_one(session_data)
    
    # Get expert and student names for email
    student = db.students.find_one({"_id": ObjectId(session.student_id)})
    
    # Send confirmation emails
    session_details = {
        "id": str(result.inserted_id),
        "expert_name": f"{expert['first_name']} {expert['last_name']}",
        "date": session.date,
        "duration": session.duration,
        "topic": session.topic
    }
    
    # In a real implementation, you would send confirmation emails to both the student and expert
    # send_session_confirmation_email(student["email"], f"{student['first_name']} {student['last_name']}", session_details)
    # send_session_confirmation_email(expert["email"], f"{expert['first_name']} {expert['last_name']}", session_details)
    
    return {
        "message": "Session booked successfully",
        "session_id": str(result.inserted_id)
    }

@router.get("/sessions", response_model=List[SessionResponse])
async def get_student_sessions(
    status: Optional[str] = None,
    current_user: dict = Depends(require_role("student"))
):
    """
    Get student sessions
    """
    # Build query
    query = {"student_id": current_user["id"]}
    
    if status:
        query["status"] = status
    
    # Find sessions
    sessions = list(db.sessions.find(query).sort("date", -1))
    
    # Enrich sessions with expert and student info
    for session in sessions:
        session["id"] = str(session["_id"])
        
        # Get expert info
        expert = db.experts.find_one({"_id": ObjectId(session["expert_id"])})
        if expert:
            session["expert_name"] = f"{expert['first_name']} {expert['last_name']}"
            session["expert_profile_image"] = expert.get("profile_image")
        
        # Get student info
        student = db.students.find_one({"_id": ObjectId(session["student_id"])})
        if student:
            session["student_name"] = f"{student['first_name']} {student['last_name']}"
            session["student_profile_image"] = student.get("profile_image")
    
    return sessions

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session_details(
    session_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Get session details
    """
    session = db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Verify student has access to this session
    if session["student_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this session"
        )
    
    # Convert ObjectId to string
    session["id"] = str(session["_id"])
    
    # Get expert info
    expert = db.experts.find_one({"_id": ObjectId(session["expert_id"])})
    if expert:
        session["expert_name"] = f"{expert['first_name']} {expert['last_name']}"
        session["expert_profile_image"] = expert.get("profile_image")
    
    # Get student info
    student = db.students.find_one({"_id": ObjectId(session["student_id"])})
    if student:
        session["student_name"] = f"{student['first_name']} {student['last_name']}"
        session["student_profile_image"] = student.get("profile_image")
    
    return session

@router.post("/bookmark/{expert_id}", response_model=dict)
async def bookmark_expert(
    expert_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Bookmark an expert
    """
    # Verify expert exists
    expert = db.experts.find_one({"_id": ObjectId(expert_id)})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Add expert to bookmarks
    db.students.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$addToSet": {"bookmarked_experts": expert_id}}
    )
    
    return {"message": "Expert bookmarked successfully"}

@router.delete("/bookmark/{expert_id}", response_model=dict)
async def remove_bookmark(
    expert_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Remove expert bookmark
    """
    # Remove expert from bookmarks
    db.students.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$pull": {"bookmarked_experts": expert_id}}
    )
    
    return {"message": "Bookmark removed successfully"}

@router.get("/bookmarks", response_model=List[ExpertSearchResult])
async def get_bookmarked_experts(
    current_user: dict = Depends(require_role("student"))
):
    """
    Get bookmarked experts
    """
    # Get student
    student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get bookmarked experts
    bookmarked_experts = student.get("bookmarked_experts", [])
    
    # Convert to ObjectId
    bookmarked_expert_ids = [ObjectId(expert_id) for expert_id in bookmarked_experts]
    
    # Find experts
    experts = list(db.experts.find({"_id": {"$in": bookmarked_expert_ids}}))
    
    # Convert ObjectId to string
    for expert in experts:
        expert["id"] = str(expert["_id"])
    
    return experts
