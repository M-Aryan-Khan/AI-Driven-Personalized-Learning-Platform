from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Body
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from ..models.expert import ExpertUpdate, ExpertProfile
from ..models.session import SessionResponse, SessionUpdate
from ..models.review import ReviewResponse
from ..utils.auth import get_current_active_user, require_role
from ..models.message import MessageCreate, MessageResponse, ConversationResponse
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

@router.put("/profile/complete", response_model=dict)
async def mark_profile_completed(
    current_user: dict = Depends(require_role("expert"))
):
    """
    Mark expert profile as completed
    """
    # Update expert
    result = db.experts.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "is_profile_completed": True,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    return {"message": "Profile marked as completed successfully"}

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

@router.put("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    session_update: SessionUpdate,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Update a session
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
    
    # Get updated session
    updated_session = db.sessions.find_one({"_id": ObjectId(session_id)})
    updated_session["id"] = str(updated_session["_id"])
    
    # Get expert info
    expert = db.experts.find_one({"_id": ObjectId(updated_session["expert_id"])})
    if expert:
        updated_session["expert_name"] = f"{expert['first_name']} {expert['last_name']}"
        updated_session["expert_profile_image"] = expert.get("profile_image")
    
    # Get student info
    student = db.students.find_one({"_id": ObjectId(updated_session["student_id"])})
    if student:
        updated_session["student_name"] = f"{student['first_name']} {student['last_name']}"
        updated_session["student_profile_image"] = student.get("profile_image")
    
    return updated_session

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: dict = Depends(require_role("expert"))
):
    """
    Get all conversations for the current expert
    """
    # Find conversations where the expert is a participant
    conversations = list(db.conversations.find({
        "participants": current_user["id"]
    }).sort("last_message_date", -1))
    
    result = []
    for conversation in conversations:
        # Get the other participant (student)
        student_id = next((p for p in conversation["participants"] if p != current_user["id"]), None)
        if not student_id:
            continue
        
        # Get student details
        student = db.students.find_one({"_id": ObjectId(student_id)})
        if not student:
            continue
        
        # Get the last message
        last_message = db.messages.find_one(
            {"conversation_id": str(conversation["_id"])},
            sort=[("timestamp", -1)]
        )
        
        if not last_message:
            continue
        
        # Check if there are unread messages for the expert
        unread_count = db.messages.count_documents({
            "conversation_id": str(conversation["_id"]),
            "sender_id": student_id,
            "read": False
        })
        
        result.append({
            "id": str(conversation["_id"]),
            "student_id": student_id,
            "student_name": f"{student['first_name']} {student['last_name']}",
            "student_profile_image": student.get("profile_image"),
            "last_message": last_message["content"],
            "last_message_date": last_message["timestamp"],
            "unread": unread_count > 0
        })
    
    return result

@router.get("/conversations/{student_id}", response_model=List[MessageResponse])
async def get_conversation_messages(
    student_id: str,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Get messages for a conversation with a student
    """
    # Find or create conversation
    conversation = db.conversations.find_one({
        "participants": {"$all": [current_user["id"], student_id]}
    })
    
    if not conversation:
        # Create a new conversation
        conversation_id = str(ObjectId())
        db.conversations.insert_one({
            "_id": ObjectId(conversation_id),
            "participants": [current_user["id"], student_id],
            "created_at": datetime.now(timezone.utc),
            "last_message_date": datetime.now(timezone.utc)
        })
        return []
    
    # Get messages
    messages = list(db.messages.find({
        "conversation_id": str(conversation["_id"])
    }).sort("timestamp", 1))
    
    # Mark messages from student as read
    db.messages.update_many(
        {
            "conversation_id": str(conversation["_id"]),
            "sender_id": student_id,
            "read": False
        },
        {"$set": {"read": True}}
    )
    
    # Convert ObjectId to string
    for message in messages:
        message["id"] = str(message["_id"])
    
    return messages

@router.post("/conversations/{student_id}/messages", response_model=MessageResponse)
async def send_message(
    student_id: str,
    message: MessageCreate,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Send a message to a student
    """
    # Verify student exists
    student = db.students.find_one({"_id": ObjectId(student_id)})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Find or create conversation
    conversation = db.conversations.find_one({
        "participants": {"$all": [current_user["id"], student_id]}
    })
    
    if not conversation:
        # Create a new conversation
        conversation_id = str(ObjectId())
        db.conversations.insert_one({
            "_id": ObjectId(conversation_id),
            "participants": [current_user["id"], student_id],
            "created_at": datetime.now(timezone.utc),
            "last_message_date": datetime.now(timezone.utc)
        })
    else:
        conversation_id = str(conversation["_id"])
        # Update last message date
        db.conversations.update_one(
            {"_id": conversation["_id"]},
            {"$set": {"last_message_date": datetime.now(timezone.utc)}}
        )
    
    # Get expert info
    expert = db.experts.find_one({"_id": ObjectId(current_user["id"])})
    
    # Create message
    message_data = {
        "conversation_id": conversation_id,
        "sender_id": current_user["id"],
        "sender_name": f"{expert['first_name']} {expert['last_name']}",
        "sender_role": "expert",
        "content": message.content,
        "timestamp": datetime.now(timezone.utc),
        "read": False
    }
    
    # Insert message
    result = db.messages.insert_one(message_data)
    
    # Return created message
    created_message = {
        "id": str(result.inserted_id),
        **message_data
    }
    
    return created_message

@router.post("/change-password", response_model=dict)
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Change expert password
    """
    from ..utils.hash import verify_password, get_password_hash
    
    # Get expert
    expert = db.experts.find_one({"_id": ObjectId(current_user["id"])})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Verify current password
    if not verify_password(current_password, expert["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Update password
    hashed_password = get_password_hash(new_password)
    db.experts.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return {"message": "Password updated successfully"}

@router.get("/reviews", response_model=List[ReviewResponse])
async def get_expert_reviews(current_user: dict = Depends(require_role("expert"))):
    """
    Get all reviews for the current expert
    """
    # Get reviews for this expert
    reviews = list(db.reviews.find({"expert_id": current_user["id"]}).sort("created_at", -1))
    
    # Convert ObjectId to string
    for review in reviews:
        review["id"] = str(review["_id"])
        if "_id" in review:
            del review["_id"]
    
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

@router.get("/availability", response_model=dict)
async def get_availability(
    current_user: dict = Depends(require_role("expert"))
):
    """
    Get expert availability
    """
    # Get expert
    expert = db.experts.find_one({"_id": ObjectId(current_user["id"])})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Initialize default availability if not present
    if "availability" not in expert:
        return {
            "weeklySchedule": [
                {"day": "Monday", "startTime": "09:00", "endTime": "17:00"},
                {"day": "Tuesday", "startTime": "09:00", "endTime": "17:00"},
                {"day": "Wednesday", "startTime": "09:00", "endTime": "17:00"},
                {"day": "Thursday", "startTime": "09:00", "endTime": "17:00"},
                {"day": "Friday", "startTime": "09:00", "endTime": "17:00"}
            ],
            "blockedDates": [],
            "settings": {
                "timezone": "UTC",
                "bufferTime": 15,
                "maxSessionsPerDay": 5,
                "autoAccept": False
            }
        }
    
    # Return availability data
    availability_data = expert.get("availability", {})
    
    # Ensure the structure is correct
    if not isinstance(availability_data, dict):
        availability_data = {}
    
    # Ensure weeklySchedule exists and is a list
    if "weeklySchedule" not in availability_data or not isinstance(availability_data["weeklySchedule"], list):
        availability_data["weeklySchedule"] = [
            {"day": "Monday", "startTime": "09:00", "endTime": "17:00"},
            {"day": "Tuesday", "startTime": "09:00", "endTime": "17:00"},
            {"day": "Wednesday", "startTime": "09:00", "endTime": "17:00"},
            {"day": "Thursday", "startTime": "09:00", "endTime": "17:00"},
            {"day": "Friday", "startTime": "09:00", "endTime": "17:00"}
        ]
    
    # Ensure blockedDates exists and is a list
    if "blockedDates" not in availability_data or not isinstance(availability_data["blockedDates"], list):
        availability_data["blockedDates"] = []
    
    # Ensure settings exists and is a dict
    if "settings" not in availability_data or not isinstance(availability_data["settings"], dict):
        availability_data["settings"] = {
            "timezone": "UTC",
            "bufferTime": 15,
            "maxSessionsPerDay": 5,
            "autoAccept": False
        }
    
    # Remove isRecurring field from time slots to simplify
    for slot in availability_data["weeklySchedule"]:
        if "isRecurring" in slot:
            del slot["isRecurring"]
    
    return availability_data

@router.put("/availability", response_model=dict)
async def update_availability(
    availability: Dict,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Update expert availability
    """
    # Remove isRecurring field from time slots to simplify
    if "weeklySchedule" in availability and isinstance(availability["weeklySchedule"], list):
        for slot in availability["weeklySchedule"]:
            if "isRecurring" in slot:
                del slot["isRecurring"]
    
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

@router.get("/earnings", response_model=dict)
async def get_expert_earnings(
    timeFilter: str = "this_month",
    current_user: dict = Depends(require_role("expert"))
):
    """
    Get expert earnings
    """
    from datetime import datetime, timedelta
    
    # Get current date
    now = datetime.now(timezone.utc)
    
    # Define date ranges based on timeFilter
    if timeFilter == "this_month":
        start_date = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    elif timeFilter == "last_month":
        if now.month == 1:
            start_date = datetime(now.year - 1, 12, 1, tzinfo=timezone.utc)
        else:
            start_date = datetime(now.year, now.month - 1, 1, tzinfo=timezone.utc)
        end_date = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    elif timeFilter == "this_year":
        start_date = datetime(now.year, 1, 1, tzinfo=timezone.utc)
    else:  # all_time
        start_date = datetime(2000, 1, 1, tzinfo=timezone.utc)
    
    # Set end date for last_month filter
    if timeFilter == "last_month":
        query_date = {"$gte": start_date, "$lt": end_date}
    else:
        query_date = {"$gte": start_date}
    
    # Get sessions for the expert
    sessions = list(db.sessions.find({
        "expert_id": current_user["id"],
        "date": query_date
    }).sort("date", -1))
    
    # Calculate earnings
    earnings = []
    total_earnings = 0
    pending_earnings = 0
    paid_earnings = 0
    
    for session in sessions:
        # Get student info
        student = db.students.find_one({"_id": ObjectId(session["student_id"])})
        student_name = f"{student['first_name']} {student['last_name']}" if student else "Unknown Student"
        
        # Calculate amount based on session duration and expert hourly rate
        expert = db.experts.find_one({"_id": ObjectId(current_user["id"])})
        hourly_rate = expert.get("hourly_rate", 45)
        duration_hours = session.get("duration", 60) / 60  # Convert minutes to hours
        amount = hourly_rate * duration_hours
        
        # Determine status
        if session["status"] == "completed":
            status = "paid"
            paid_earnings += amount
        elif session["status"] == "cancelled":
            status = "cancelled"
        else:
            status = "pending"
            pending_earnings += amount
        
        if status != "cancelled":
            total_earnings += amount
        
        # Add to earnings list
        earnings.append({
            "id": str(session["_id"]),
            "session_id": str(session["_id"]),
            "student_name": student_name,
            "date": session["date"].isoformat(),
            "amount": amount,
            "status": status,
            "payout_date": (session["date"] + timedelta(days=7)).isoformat() if status == "paid" else None
        })
    
    # Return earnings data
    return {
        "earnings": earnings,
        "stats": {
            "total_earnings": total_earnings,
            "pending_earnings": pending_earnings,
            "paid_earnings": paid_earnings,
            "total_sessions": len([e for e in earnings if e["status"] != "cancelled"])
        }
    }

@router.get("/earnings/statement", response_model=dict)
async def get_earnings_statement(
    timeFilter: str = "this_month",
    current_user: dict = Depends(require_role("expert"))
):
    """
    Generate earnings statement PDF
    """
    # In a real implementation, this would generate a PDF
    # For now, we'll just return a success message
    
    return {"message": "Statement generated successfully"}

@router.get("/payment-methods", response_model=List[dict])
async def get_payment_methods(
    current_user: dict = Depends(require_role("expert"))
):
    """
    Get expert payment methods
    """
    # Find payment methods
    payment_methods = list(db.payment_methods.find({"expert_id": current_user["id"]}))
    
    # Convert ObjectId to string
    for method in payment_methods:
        method["id"] = str(method["_id"])
        del method["_id"]
    
    return payment_methods

@router.post("/payment-methods", response_model=dict)
async def add_payment_method(
    payment_method: dict,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Add a payment method
    """
    # If this is set as default, unset any existing default
    if payment_method.get("is_default", False):
        db.payment_methods.update_many(
            {"expert_id": current_user["id"]},
            {"$set": {"is_default": False}}
        )
    
    # Add expert_id to payment method
    payment_method["expert_id"] = current_user["id"]
    payment_method["created_at"] = datetime.now(timezone.utc)
    
    # Insert payment method
    result = db.payment_methods.insert_one(payment_method)
    
    return {
        "id": str(result.inserted_id),
        "message": "Payment method added successfully"
    }

@router.put("/payment-methods/{payment_method_id}/default", response_model=dict)
async def set_default_payment_method(
    payment_method_id: str,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Set a payment method as default
    """
    # Verify payment method exists and belongs to expert
    payment_method = db.payment_methods.find_one({
        "_id": ObjectId(payment_method_id),
        "expert_id": current_user["id"]
    })
    
    if not payment_method:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    # Unset any existing default
    db.payment_methods.update_many(
        {"expert_id": current_user["id"]},
        {"$set": {"is_default": False}}
    )
    
    # Set this payment method as default
    db.payment_methods.update_one(
        {"_id": ObjectId(payment_method_id)},
        {"$set": {"is_default": True}}
    )
    
    return {"message": "Default payment method updated successfully"}

@router.delete("/payment-methods/{payment_method_id}", response_model=dict)
async def delete_payment_method(
    payment_method_id: str,
    current_user: dict = Depends(require_role("expert"))
):
    """
    Delete a payment method
    """
    # Verify payment method exists and belongs to expert
    payment_method = db.payment_methods.find_one({
        "_id": ObjectId(payment_method_id),
        "expert_id": current_user["id"]
    })
    
    if not payment_method:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    # Check if this is the default payment method
    if payment_method.get("is_default", False):
        # Find another payment method to set as default
        other_method = db.payment_methods.find_one({
            "expert_id": current_user["id"],
            "_id": {"$ne": ObjectId(payment_method_id)}
        })
        
        if other_method:
            db.payment_methods.update_one(
                {"_id": other_method["_id"]},
                {"$set": {"is_default": True}}
            )
    
    # Delete payment method
    db.payment_methods.delete_one({"_id": ObjectId(payment_method_id)})
    
    return {"message": "Payment method deleted successfully"}
