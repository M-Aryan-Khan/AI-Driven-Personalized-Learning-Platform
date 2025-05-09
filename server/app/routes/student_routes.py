from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Body
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from ..models.student import StudentUpdate, StudentProfile, RecommendationResponse
from ..models.expert import ExpertSearchResult, ExpertProfile
from ..models.session import SessionCreate, SessionResponse, SessionUpdate
from ..models.message import MessageCreate, MessageResponse, ConversationResponse
from ..models.payment import PaymentMethod, PaymentHistory
from ..recommender.hybrid import HybridRecommender, Student, Tutor
from ..utils.auth import get_current_active_user, require_role
from ..utils.email import send_session_confirmation_email
from ..utils.hash import verify_password, hash_password
from ..db.mongo import db

router = APIRouter(
    prefix="/api/students",
    tags=["Students"],
)

@router.post("/experts/ids", response_model=List[ExpertSearchResult])
def get_experts_by_ids(payload: Dict[str, List[str]]):
    expert_ids = payload.get("expert_ids", [])
    object_ids = [ObjectId(eid) for eid in expert_ids]
    experts = list(db.experts.find({"_id": {"$in": object_ids}}))

    for expert in experts:
        expert["id"] = str(expert["_id"])

    return experts


@router.get("/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(top_n: int = 3,current_user: dict = Depends(require_role("student"))):
    student_id = str(current_user["id"])  # Convert to string early
    student_doc = db.students.find_one({"_id": ObjectId(student_id)})
    if not student_doc:
        raise HTTPException(status_code=404, detail="Student not found")

    # Fetch all tutors
    tutor_docs = list(db.experts.find({}))
    if not tutor_docs:
        raise HTTPException(status_code=404, detail="No tutors found")

    # Instantiate recommender
    students = [Student(student_doc)]
    tutors = [Tutor(doc) for doc in tutor_docs]
    

    recommender = HybridRecommender(students, tutors)
    recommended = recommender.recommend(str(current_user["id"]), top_n)


    # Prepare response
    response = [
        RecommendationResponse(
            tutor_id=tutor.id,
            tutor_name=tutor.name,
            similarity_score=round(score, 3),
            rating=tutor.avg_rating,
            hourly_rate=tutor.hourly_rate,
            skills=tutor.skills,
        )
        for tutor, score in recommended
    ]
    return response

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

@router.put("/change-password", response_model=dict)
async def change_password(
    current_password: str = Body(...),
    new_password: str = Body(...),
    current_user: dict = Depends(require_role("student"))
):
    """
    Change student password
    """
    # Get student
    student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Verify current password
    if not verify_password(current_password, student["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Update password
    hashed_password = hash_password(new_password)
    db.students.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return {"message": "Password updated successfully"}

@router.delete("/delete-account", response_model=dict)
async def delete_account(
    password: str = Body(..., embed=True),
    current_user: dict = Depends(require_role("student"))
):
    """
    Delete student account
    """
    # Get student
    student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Verify password
    if not verify_password(password, student["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Delete student
    db.students.delete_one({"_id": ObjectId(current_user["id"])})
    
    # Delete related data
    db.sessions.delete_many({"student_id": current_user["id"]})
    db.conversations.delete_many({"participants": current_user["id"]})
    db.messages.delete_many({"sender_id": current_user["id"]})
    
    return {"message": "Account deleted successfully"}

@router.get("/payment-methods", response_model=List[PaymentMethod])
async def get_payment_methods(current_user: dict = Depends(require_role("student"))):
    """
    Get student payment methods
    """
    # Get student
    student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get payment methods
    payment_methods = student.get("payment_methods", [])
    
    return payment_methods

@router.post("/payment-methods", response_model=PaymentMethod)
async def add_payment_method(
    payment_method: PaymentMethod,
    current_user: dict = Depends(require_role("student"))
):
    """
    Add a payment method
    """
    # Generate a unique ID for the payment method
    payment_method_id = str(ObjectId())
    payment_method.id = payment_method_id
    
    # Add created_at timestamp
    payment_method.created_at = datetime.now(timezone.utc)
    
    # Check if this should be the default payment method
    is_default = payment_method.is_default
    
    # First, check if the payment_methods array exists
    student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    if not student or "payment_methods" not in student:
        # Initialize the payment_methods array with this payment method
        db.students.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": {"payment_methods": [payment_method.dict()]}}
        )
    else:
        # If this is the default, unset any existing default
        if is_default:
            db.students.update_one(
                {"_id": ObjectId(current_user["id"])},
                {"$set": {"payment_methods.$[].is_default": False}}
            )
        
        # Add payment method to student
        db.students.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$push": {"payment_methods": payment_method.dict()}}
        )
    
    return payment_method

@router.delete("/payment-methods/{payment_method_id}", response_model=dict)
async def delete_payment_method(
    payment_method_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Delete a payment method
    """
    # Remove payment method from student
    db.students.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$pull": {"payment_methods": {"id": payment_method_id}}}
    )
    
    return {"message": "Payment method deleted successfully"}

@router.put("/payment-methods/{payment_method_id}/default", response_model=dict)
async def set_default_payment_method(
    payment_method_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Set a payment method as default
    """
    # Unset any existing default
    db.students.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"payment_methods.$[].is_default": False}}
    )
    
    # Set the specified payment method as default
    db.students.update_one(
        {"_id": ObjectId(current_user["id"]), "payment_methods.id": payment_method_id},
        {"$set": {"payment_methods.$.is_default": True}}
    )
    
    return {"message": "Default payment method updated successfully"}

@router.get("/payment-history", response_model=List[PaymentHistory])
async def get_payment_history(current_user: dict = Depends(require_role("student"))):
    """
    Get student payment history
    """
    # Get payment history
    payment_history = list(db.payments.find({"student_id": current_user["id"]}).sort("date", -1))
    
    # Convert ObjectId to string
    for payment in payment_history:
        payment["id"] = str(payment["_id"])
    
    return payment_history

@router.put("/notifications", response_model=dict)
async def update_notification_settings(
    email_notifications: bool = Body(...),
    sms_notifications: bool = Body(...),
    marketing_emails: bool = Body(...),
    current_user: dict = Depends(require_role("student"))
):
    """
    Update notification settings
    """
    # Update notification settings
    db.students.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "notification_settings": {
                    "email_notifications": email_notifications,
                    "sms_notifications": sms_notifications,
                    "marketing_emails": marketing_emails
                },
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Notification settings updated successfully"}

@router.get("/experts", response_model=List[ExpertSearchResult])
async def search_experts(
    specialty: Optional[str] = None,
    tags: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    min_rating: Optional[float] = None,
    language: Optional[str] = None,
    current_user: dict = Depends(require_role("student"))
):
    """
    Search for experts
    """
    # Build query
    query = {"is_approved": True, "is_verified": True}
    
    if specialty and specialty != "any":
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
        
    if language and language != "any":
        query["languages"] = {"$in": [language]}
    
    # Find experts
    experts = list(db.experts.find(query))
    
    # Convert ObjectId to string and ensure all required fields exist
    for expert in experts:
        expert["id"] = str(expert["_id"])
        
        # Set default values for missing fields
        if "specialty" not in expert or expert["specialty"] is None:
            expert["specialty"] = "General Tutoring"
            
        if "tags" not in expert or not expert["tags"]:
            expert["tags"] = []
            
        if "bio" not in expert or not expert["bio"]:
            expert["bio"] = f"Experienced tutor specializing in {expert.get('specialty', 'various subjects')}."
            
        if "languages" not in expert or not expert["languages"]:
            expert["languages"] = ["English"]
            
        if "experience_years" not in expert:
            expert["experience_years"] = 1
            
        if "completed_sessions" not in expert:
            expert["completed_sessions"] = 0
    
    return experts

@router.get("/experts/{expert_id}", response_model=ExpertProfile)
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
    
    # Set default values for missing required fields
    if "specialty" not in expert or expert["specialty"] is None:
        expert["specialty"] = "General Tutoring"
        
    if "tags" not in expert or not expert["tags"]:
        expert["tags"] = []
        
    if "bio" not in expert or not expert["bio"]:
        expert["bio"] = f"Experienced tutor specializing in {expert.get('specialty', 'various subjects')}."
        
    if "languages" not in expert or not expert["languages"]:
        expert["languages"] = ["English"]
        
    if "experience_years" not in expert:
        expert["experience_years"] = 1
        
    if "completed_sessions" not in expert:
        expert["completed_sessions"] = 0
        
    if "education" not in expert or not expert["education"]:
        expert["education"] = "Bachelor's Degree"
    
    # Handle availability field - remove it from the response if it exists
    # since it's causing validation errors
    if "availability" in expert:
        del expert["availability"]
    
    return expert

@router.get("/experts/{expert_id}/availability")
async def get_expert_availability(
    expert_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(require_role("student"))
):
    """
    Get expert availability for a specific date range
    """
    expert = db.experts.find_one({"_id": ObjectId(expert_id)})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # If no date range is provided, use the next 14 days
    if not start_date:
        start_date_obj = datetime.now(timezone.utc).date()
    else:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        except ValueError:
            start_date_obj = datetime.now(timezone.utc).date()
    
    if not end_date:
        # Use 14 days range
        end_date_obj = (datetime.now(timezone.utc) + timedelta(days=14)).date()
    else:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            # Ensure we don't exceed 14 days to prevent timeout
            max_end_date = start_date_obj + timedelta(days=14)
            if end_date_obj > max_end_date:
                end_date_obj = max_end_date
        except ValueError:
            end_date_obj = (datetime.now(timezone.utc) + timedelta(days=14)).date()
    
    # Get expert's availability settings
    expert_availability = expert.get("availability", {})
    weekly_schedule = expert_availability.get("weeklySchedule", [])
    blocked_dates = expert_availability.get("blockedDates", [])
    settings = expert_availability.get("settings", {
        "timezone": "UTC",
        "bufferTime": 15,
        "maxSessionsPerDay": 5,
        "autoAccept": False
    })
    
    # Convert blocked dates to a list of date strings for easy checking
    blocked_date_strings = []
    for blocked_date in blocked_dates:
        if isinstance(blocked_date, dict) and "date" in blocked_date:
            # Handle both string and datetime formats
            if isinstance(blocked_date["date"], str):
                blocked_date_strings.append(blocked_date["date"])
            else:
                blocked_date_strings.append(blocked_date["date"].strftime("%Y-%m-%d"))
    
    # Generate availability based on weekly schedule
    availability = {}
    current_date = start_date_obj
    
    while current_date <= end_date_obj:
        date_str = current_date.strftime("%Y-%m-%d")
        
        # Skip past dates
        if current_date < datetime.now(timezone.utc).date():
            current_date += timedelta(days=1)
            continue
        
        # Skip blocked dates
        if date_str in blocked_date_strings:
            current_date += timedelta(days=1)
            continue
        
        # Get day of week (0 = Monday, 6 = Sunday)
        day_of_week = current_date.weekday()
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        day_name = day_names[day_of_week]
        
        # Find time slots for this day
        day_slots = [slot for slot in weekly_schedule if slot.get("day") == day_name]
        
        if day_slots:
            availability[date_str] = []
            
            for slot in day_slots:
                start_time = slot.get("startTime", "09:00")
                end_time = slot.get("endTime", "17:00")
                
                # Generate time slots in 30-minute increments
                start_hour, start_minute = map(int, start_time.split(":"))
                end_hour, end_minute = map(int, end_time.split(":"))
                
                start_minutes = start_hour * 60 + start_minute
                end_minutes = end_hour * 60 + end_minute
                
                # Buffer time between sessions
                buffer_time = settings.get("bufferTime", 15)
                
                # Generate time slots
                current_minutes = start_minutes
                while current_minutes + buffer_time <= end_minutes:
                    hour = current_minutes // 60
                    minute = current_minutes % 60
                    time_slot = f"{hour:02d}:{minute:02d}"
                    availability[date_str].append(time_slot)
                    
                    # Increment by 30 minutes
                    current_minutes += 30
        
        current_date += timedelta(days=1)
    
    # Check for existing bookings and remove those time slots
    if availability:
        # Get all sessions for this expert in the date range
        start_of_range = datetime.combine(start_date_obj, datetime.min.time()).replace(tzinfo=timezone.utc)
        end_of_range = datetime.combine(end_date_obj, datetime.max.time()).replace(tzinfo=timezone.utc)
        
        sessions = list(db.sessions.find({
            "expert_id": expert_id,
            "date": {"$gte": start_of_range, "$lte": end_of_range},
            "status": {"$in": ["scheduled", "confirmed"]}
        }))
        
        # Buffer time between sessions (in minutes)
        buffer_time = settings.get("bufferTime", 15)
        
        # Remove booked time slots
        for session in sessions:
            session_date = session["date"]
            session_date_str = session_date.strftime("%Y-%m-%d")
            session_time = session_date.strftime("%H:%M")
            session_duration = session.get("duration", 60)  # in minutes
            
            # Skip if this date is not in our availability
            if session_date_str not in availability:
                continue
                
            # Calculate session end time in minutes since midnight
            session_start_minutes = int(session_time.split(":")[0]) * 60 + int(session_time.split(":")[1])
            session_end_minutes = session_start_minutes + session_duration
            
            # Add buffer time before and after the session
            buffer_start_minutes = max(0, session_start_minutes - buffer_time)
            buffer_end_minutes = session_end_minutes + buffer_time
            
            # Remove all time slots that overlap with this session (including buffer)
            slots_to_remove = []
            for time_slot in availability[session_date_str]:
                slot_hour, slot_minute = map(int, time_slot.split(":"))
                slot_minutes = slot_hour * 60 + slot_minute
                
                # Check if this slot starts during the session or buffer period
                if buffer_start_minutes <= slot_minutes < buffer_end_minutes:
                    slots_to_remove.append(time_slot)
                
                # Check if this slot would create a session that overlaps with the existing session
                # Assuming minimum session duration is 30 minutes
                if slot_minutes + 30 > buffer_start_minutes and slot_minutes < buffer_end_minutes:
                    slots_to_remove.append(time_slot)
            
            # Remove the identified slots
            for slot in slots_to_remove:
                if slot in availability[session_date_str]:
                    availability[session_date_str].remove(slot)
    
    # Remove dates with no available times
    availability = {date: times for date, times in availability.items() if times}
    
    return {"availability": availability}

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
    
    # If student_id is "current", use the current user's ID
    if session.student_id == "current":
        session.student_id = current_user["id"]
    
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
    
    # Send confirmation emails to both the student and expert
    if student and "email" in student and "first_name" in student and "last_name" in student:
        send_session_confirmation_email(
            student["email"], 
            f"{student['first_name']} {student['last_name']}", 
            session_details
        )
    
    if "email" in expert and "first_name" in expert and "last_name" in expert:
        send_session_confirmation_email(
            expert["email"], 
            f"{expert['first_name']} {expert['last_name']}", 
            session_details
        )
    
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

@router.post("/sessions/{session_id}/cancel", response_model=dict)
async def cancel_session(
    session_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Cancel a session
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
    
    # Update session status
    db.sessions.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Session cancelled successfully"}

@router.put("/sessions/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    session_update: SessionUpdate,
    current_user: dict = Depends(require_role("student"))
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
    
    # Verify student has access to this session
    if session["student_id"] != current_user["id"]:
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

@router.put("/sessions/{session_id}/confirm", response_model=dict)
async def confirm_session(
    session_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Confirm a session as completed
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
    
    # Update session status
    db.sessions.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": "completed",
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Update expert's completed_sessions count
    db.experts.update_one(
        {"_id": ObjectId(session["expert_id"])},
        {"$inc": {"completed_sessions": 1}}
    )
    
    # Process payment (in a real app, this would trigger a payment to the expert)
    # For now, we'll just create a payment record
    payment_data = {
        "student_id": current_user["id"],
        "expert_id": session["expert_id"],
        "session_id": session_id,
        "amount": calculate_session_cost(session),
        "status": "completed",
        "date": datetime.now(timezone.utc)
    }
    
    db.payments.insert_one(payment_data)
    
    return {"message": "Session confirmed as completed successfully"}

def calculate_session_cost(session):
    """
    Calculate the cost of a session based on expert's hourly rate and session duration
    """
    expert = db.experts.find_one({"_id": ObjectId(session["expert_id"])})
    if not expert:
        return 0
    
    hourly_rate = expert.get("hourly_rate", 45)
    duration_hours = session.get("duration", 60) / 60  # Convert minutes to hours
    
    return hourly_rate * duration_hours

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

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: dict = Depends(require_role("student"))
):
    """
    Get all conversations for the current student
    """
    # Find conversations where the student is a participant
    conversations = list(db.conversations.find({
        "participants": current_user["id"]
    }).sort("last_message_date", -1))
    
    result = []
    for conversation in conversations:
        # Get the other participant (expert)
        expert_id = next((p for p in conversation["participants"] if p != current_user["id"]), None)
        if not expert_id:
            continue
        
        # Get expert details
        expert = db.experts.find_one({"_id": ObjectId(expert_id)})
        if not expert:
            continue
        
        # Get the last message
        last_message = db.messages.find_one(
            {"conversation_id": str(conversation["_id"])},
            sort=[("timestamp", -1)]
        )
        
        if not last_message:
            continue
        
        # Check if there are unread messages for the student
        unread_count = db.messages.count_documents({
            "conversation_id": str(conversation["_id"]),
            "sender_id": expert_id,
            "read": False
        })
        
        result.append({
            "id": str(conversation["_id"]),
            "expert_id": expert_id,
            "expert_name": f"{expert['first_name']} {expert['last_name']}",
            "expert_profile_image": expert.get("profile_image"),
            "last_message": last_message["content"],
            "last_message_date": last_message["timestamp"],
            "unread": unread_count > 0
        })
    
    return result

@router.get("/conversations/{expert_id}", response_model=List[MessageResponse])
async def get_conversation_messages(
    expert_id: str,
    current_user: dict = Depends(require_role("student"))
):
    """
    Get messages for a conversation with an expert
    """
    # Find or create conversation
    conversation = db.conversations.find_one({
        "participants": {"$all": [current_user["id"], expert_id]}
    })
    
    if not conversation:
        # Create a new conversation
        conversation_id = str(ObjectId())
        db.conversations.insert_one({
            "_id": ObjectId(conversation_id),
            "participants": [current_user["id"], expert_id],
            "created_at": datetime.now(timezone.utc),
            "last_message_date": datetime.now(timezone.utc)
        })
        return []
    
    # Get messages
    messages = list(db.messages.find({
        "conversation_id": str(conversation["_id"])
    }).sort("timestamp", 1))
    
    # Mark messages from expert as read
    db.messages.update_many(
        {
            "conversation_id": str(conversation["_id"]),
            "sender_id": expert_id,
            "read": False
        },
        {"$set": {"read": True}}
    )
    
    # Convert ObjectId to string
    for message in messages:
        message["id"] = str(message["_id"])
    
    return messages

@router.post("/conversations/{expert_id}/messages", response_model=MessageResponse)
async def send_message(
    expert_id: str,
    message: MessageCreate,
    current_user: dict = Depends(require_role("student"))
):
    """
    Send a message to an expert
    """
    # Verify expert exists
    expert = db.experts.find_one({"_id": ObjectId(expert_id)})
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert not found"
        )
    
    # Find or create conversation
    conversation = db.conversations.find_one({
        "participants": {"$all": [current_user["id"], expert_id]}
    })
    
    if not conversation:
        # Create a new conversation
        conversation_id = str(ObjectId())
        db.conversations.insert_one({
            "_id": ObjectId(conversation_id),
            "participants": [current_user["id"], expert_id],
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
    
    # Get student info
    student = db.students.find_one({"_id": ObjectId(current_user["id"])})
    
    # Create message
    message_data = {
        "conversation_id": conversation_id,
        "sender_id": current_user["id"],
        "sender_name": f"{student['first_name']} {student['last_name']}",
        "sender_role": "student",
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
