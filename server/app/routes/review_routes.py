from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

from ..models.review import ReviewCreate, ReviewResponse
from ..utils.auth import get_current_active_user, require_role
from ..db.mongo import db

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)

@router.post("/", response_model=dict)
async def create_review(
    review: ReviewCreate,
    current_user: dict = Depends(require_role("student"))
):
    """
    Create a review for an expert
    """
    # Verify session exists
    session = db.sessions.find_one({"_id": ObjectId(review.session_id)})
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
    
    # Verify session is completed
    if session["status"] != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only review completed sessions"
        )
    
    # Check if review already exists
    existing_review = db.reviews.find_one({
        "session_id": review.session_id,
        "student_id": current_user["id"]
    })
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reviewed this session"
        )
    
    # Create review
    review_data = review.dict()
    review_data["created_at"] = datetime.now(timezone.utc)
    
    # Insert review
    result = db.reviews.insert_one(review_data)
    
    # Update expert rating
    expert_reviews = list(db.reviews.find({"expert_id": review.expert_id}))
    average_rating = sum(r["rating"] for r in expert_reviews) / len(expert_reviews)
    
    db.experts.update_one(
        {"_id": ObjectId(review.expert_id)},
        {
            "$set": {
                "rating": average_rating,
                "reviews_count": len(expert_reviews)
            }
        }
    )
    
    return {
        "message": "Review submitted successfully",
        "review_id": str(result.inserted_id)
    }

@router.get("/expert/{expert_id}", response_model=List[ReviewResponse])
async def get_expert_reviews(
    expert_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get reviews for an expert
    """
    # Verify expert exists
    expert = db.experts.find_one({"_id": ObjectId(expert_id)})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Find reviews
    reviews = list(db.reviews.find({"expert_id": expert_id}).sort("created_at", -1))
    
    # Enrich reviews with student info
    for review in reviews:
        review["id"] = str(review["_id"])
        
        # Get student info
        student = db.students.find_one({"_id": ObjectId(review["student_id"])})
        if student:
            review["student_name"] = f"{student['first_name']} {student['last_name']}"
            review["student_profile_image"] = student.get("profile_image")
    
    return reviews

@router.get("/session/{session_id}", response_model=ReviewResponse)
async def get_session_review(
    session_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get review for a session
    """
    # Find review
    review = db.reviews.find_one({"session_id": session_id})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Convert ObjectId to string
    review["id"] = str(review["_id"])
    
    # Get student info
    student = db.students.find_one({"_id": ObjectId(review["student_id"])})
    if student:
        review["student_name"] = f"{student['first_name']} {student['last_name']}"
        review["student_profile_image"] = student.get("profile_image")
    
    return review
