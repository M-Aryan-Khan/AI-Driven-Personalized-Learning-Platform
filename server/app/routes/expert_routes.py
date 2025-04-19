from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from typing import List, Optional, Dict
from datetime import datetime, timezone
from bson import ObjectId

from ..models.expert import ExpertUpdate, ExpertProfile
from ..models.session import SessionResponse, SessionUpdate
from ..models.review import ReviewCreate, ReviewResponse
from ..utils.auth import get_current_active_user, require_role
from ..db.mongo import db

router = APIRouter(
    prefix="/api/experts",
    tags=["Experts"],
)

@router.get("/profile", response_model=ExpertProfile)
async def get_expert_profile(current_user: dict = Depends(require_role("expert"))):
    """
    Get current expert profile
    """
    expert = db.experts.find_one({"_id": ObjectId(current_user["id"])})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Convert ObjectId to string
    expert["id"] = str(expert["_id"])
    
    return expert

@router.put("/profile", response_model=ExpertProfile)
async def update_expert_profile(
    profile_update: ExpertUpdate,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Update expert profile
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
    
    # Update expert
    result = db.experts.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Get updated expert
    updated_expert = db.experts.find_one({"_id": ObjectId(current_user["id"])})
    
    # Convert ObjectId to string
    updated_expert["id"] = str(updated_expert["_id"])
    
    return updated_expert

@router.post("/profile/image", response_model=dict)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("expert"))
):
    """
    Upload expert profile image
    
    Note: In a production environment, you would upload this to a cloud storage service
    like AWS S3, Google Cloud Storage, or Azure Blob Storage.
    """
    # Read file content
    file_content = await file.read()
    
    # In a real implementation, you would upload this to a cloud storage service
    # and store the URL in the database
    
    # For now, we'll just update a placeholder URL
    image_url = f"/profile-images/{current_user['id']}-{file.filename}"
    
    # Update expert
    db.experts.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "profile_image": image_url,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Profile image uploaded successfully", "image_url": image_url}

@router.put("/availability", response_model=dict)
async def update_availability(
    availability: Dict,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Update expert availability
    """
    # Update expert
    db.experts.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "availability": availability,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Availability updated successfully"}

@router.get("/sessions", response_model=List[SessionResponse])
async def get_expert_sessions(
    status: Optional[str] = None,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Get expert sessions
    """
    # Build query
    query = {"expert_id": current_user["id"]}
    
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
    current_user: dict = Depends(require_role("expert"))
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
    
    # Verify expert has access to this session
    if session["expert_id"] != current_user["id"]:
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

@router.put("/sessions/{session_id}", response_model=dict)
async def update_session(
    session_id: str,
    session_update: SessionUpdate,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Update session details
    """
    # Verify session exists
    session = db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Verify expert has access to this session
    if session["expert_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this session"
        )
    
    # Filter out None values
    update_data = {k: v for k, v in session_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )
    
    # Add updated_at timestamp
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    # Update session
    db.sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": update_data}
    )
    
    # If session is completed, increment completed_sessions count for expert
    if session_update.status == "completed" and session["status"] != "completed":
        db.experts.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$inc": {"completed_sessions": 1}}
        )
        
        # Also increment for student
        db.students.update_one(
            {"_id": ObjectId(session["student_id"])},
            {"$inc": {"completed_sessions": 1}}
        )
    
    return {"message": "Session updated successfully"}

@router.get("/reviews", response_model=List[ReviewResponse])
async def get_expert_reviews(
    current_user: dict = Depends(require_role("expert"))
):
    """
    Get reviews for the expert
    """
    # Find reviews
    reviews = list(db.reviews.find({"expert_id": current_user["id"]}).sort("created_at", -1))
    
    # Enrich reviews with student info
    for review in reviews:
        review["id"] = str(review["_id"])
        
        # Get student info
        student = db.students.find_one({"_id": ObjectId(review["student_id"])})
        if student:
            review["student_name"] = f"{student['first_name']} {student['last_name']}"
            review["student_profile_image"] = student.get("profile_image")
    
    return reviews

@router.get("/stats", response_model=dict)
async def get_expert_stats(
    current_user: dict = Depends(require_role("expert"))
):
    """
    Get expert statistics
    """
    # Get expert
    expert = db.experts.find_one({"_id": ObjectId(current_user["id"])})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Get session stats
    upcoming_sessions = db.sessions.count_documents({
        "expert_id": current_user["id"],
        "status": "scheduled",
        "date": {"$gte": datetime.now(timezone.utc)}
    })
    
    completed_sessions = expert.get("completed_sessions", 0)
    
    # Get review stats
    reviews = list(db.reviews.find({"expert_id": current_user["id"]}))
    review_count = len(reviews)
    
    # Calculate average rating
    if review_count > 0:
        average_rating = sum(review["rating"] for review in reviews) / review_count
    else:
        average_rating = 0
    
    # Get earnings (in a real app, you would have a separate collection for earnings)
    # For now, we'll just estimate based on completed sessions and hourly rate
    estimated_earnings = completed_sessions * expert.get("hourly_rate", 45)
    
    return {
        "upcoming_sessions": upcoming_sessions,
        "completed_sessions": completed_sessions,
        "review_count": review_count,
        "average_rating": average_rating,
        "estimated_earnings": estimated_earnings
    }
