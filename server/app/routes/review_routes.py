from fastapi import APIRouter, HTTPException, Depends, status, Body
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from ..models.review import ReviewCreate, ReviewResponse
from ..utils.auth import get_current_active_user, require_role
from ..db.mongo import db

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"],
)

@router.post("/expert/{expert_id}", response_model=ReviewResponse)
async def create_review(
    expert_id: str,
    review: ReviewCreate,
    current_user: dict = Depends(require_role("student"))
):
    """
    Create a review for an expert
    """
    # Verify expert exists
    expert = db.experts.find_one({"_id": ObjectId(expert_id)})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Verify student has had a session with this expert
    session = db.sessions.find_one({
        "student_id": current_user["id"],
        "expert_id": expert_id,
        "status": "completed"
    })
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review experts after completing a session with them"
        )
    
    # Check if student has already reviewed this expert
    existing_review = db.reviews.find_one({
        "student_id": current_user["id"],
        "expert_id": expert_id
    })
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this expert"
        )
    
    # Get student info
    student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    
    # Create review
    review_data = {
        "student_id": current_user["id"],
        "student_name": f"{student['first_name']} {student['last_name']}",
        "student_profile_image": student.get("profile_image"),
        "expert_id": expert_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc),
        "session_id": str(session["_id"]) if session else None
    }
    
    # Insert review
    result = db.reviews.insert_one(review_data)
    
    # Update expert rating
    all_reviews = list(db.reviews.find({"expert_id": expert_id}))
    total_rating = sum(r["rating"] for r in all_reviews)
    new_rating = total_rating / len(all_reviews)
    
    db.experts.update_one(
        {"_id": ObjectId(expert_id)},
        {
            "$set": {
                "rating": new_rating,
                "reviews_count": len(all_reviews)
            }
        }
    )
    
    # Return created review
    created_review = {
        "id": str(result.inserted_id),
        **review_data
    }
    
    return created_review

@router.get("/expert/{expert_id}", response_model=List[ReviewResponse])
async def get_expert_reviews(
    expert_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get all reviews for an expert
    """
    # Verify expert exists
    expert = db.experts.find_one({"_id": ObjectId(expert_id)})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Get reviews
    reviews = list(db.reviews.find({"expert_id": expert_id}).sort("created_at", -1))
    
    # Convert ObjectId to string
    for review in reviews:
        review["id"] = str(review["_id"])
    
    return reviews

@router.delete("/expert/{expert_id}/{review_id}", response_model=dict)
async def delete_review(
    expert_id: str,
    review_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Delete a review
    """
    # Get review
    review = db.reviews.find_one({"_id": ObjectId(review_id)})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Verify user has permission to delete this review
    if review["student_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this review"
        )
    
    # Delete review
    db.reviews.delete_one({"_id": ObjectId(review_id)})
    
    # Update expert rating
    all_reviews = list(db.reviews.find({"expert_id": expert_id}))
    
    if all_reviews:
        total_rating = sum(r["rating"] for r in all_reviews)
        new_rating = total_rating / len(all_reviews)
        
        db.experts.update_one(
            {"_id": ObjectId(expert_id)},
            {
                "$set": {
                    "rating": new_rating,
                    "reviews_count": len(all_reviews)
                }
            }
        )
    else:
        # No reviews left, reset rating
        db.experts.update_one(
            {"_id": ObjectId(expert_id)},
            {
                "$set": {
                    "rating": 0.0,
                    "reviews_count": 0
                }
            }
        )
    
    return {"message": "Review deleted successfully"}
