from fastapi import APIRouter, HTTPException, Depends, status, Response, Cookie, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import os
import logging
import secrets
import bcrypt
import string
import uuid
import traceback
import requests

from ..models.user import UserCreate, Token, PasswordReset, VerifyEmail, ResetPassword, UserLogin
from ..models.student import StudentCreate
from ..models.expert import ExpertCreate
from ..utils.hash import (
    hash_password, 
    verify_password, 
    generate_verification_code,
    get_verification_code_expiry,
    get_password_reset_code_expiry
)
from ..utils.JWTtoken import create_access_token, create_refresh_token, verify_token
from ..utils.email import (
    send_verification_code_email, 
    send_password_reset_code_email,
    send_welcome_email
)
from ..utils.auth import get_current_user, get_current_active_user, get_current_user_from_cookie
from ..db.mongo import db
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware
from jose import jwt, ExpiredSignatureError, JWTError
from dotenv import load_dotenv
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


config = Config('.env')
# Environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


# Setup logging
logger = logging.getLogger(__name__)

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
    authorize_params={"access_type": "offline", "prompt": "consent"},
    authorize_state=os.getenv("FASTAPI_SECRET_KEY"),
    # Make sure this matches the route you're handling callbacks on
    redirect_uri=os.getenv("REDIRECT_URL", "http://127.0.0.1:8000/api/auth"),
)
# JWT Configurations
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

@router.post("/register/student", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_student(student: UserCreate):
    """
    Register a new student
    """
    try:
        # Check if email already exists
        if db.students.find_one({"email": student.email}) or db.experts.find_one({"email": student.email}):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Generate verification code
        verification_code = generate_verification_code()
        
        # Prepare student data
        student_data = {
            "email": student.email,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "password": hash_password(student.password),
            "role": "student",
            "is_verified": False,
            "verification_code": verification_code,
            "verification_code_expires": get_verification_code_expiry(),
            "created_at": datetime.now(timezone.utc),
            "receive_updates": student.receive_updates
        }
        
        # Insert student into database
        result = db.students.insert_one(student_data)
        
        # Send verification email
        send_verification_code_email(
            student.email,
            student.first_name,
            verification_code
        )
        
        # Remove verification code from response in register_student
        return {
            "message": "Student registered successfully. Please check your email for verification code.",
            "id": str(result.inserted_id),
            "email": student.email
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error registering student: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during registration: {str(e)}"
        )

@router.post("/register/expert", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_expert(expert: UserCreate):
    """
    Register a new expert
    """
    try:
        # Check if email already exists
        if db.students.find_one({"email": expert.email}) or db.experts.find_one({"email": expert.email}):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Generate verification code
        verification_code = generate_verification_code()
        
        # Prepare expert data
        expert_data = {
            "email": expert.email,
            "first_name": expert.first_name,
            "last_name": expert.last_name,
            "password": hash_password(expert.password),
            "role": "expert",
            "is_verified": False,
            "is_approved": False,
            "approval_status": "pending",
            "verification_code": verification_code,
            "verification_code_expires": get_verification_code_expiry(),
            "created_at": datetime.now(timezone.utc),
            "specialty": expert.specialty if hasattr(expert, 'specialty') else None,
            "hourly_rate": 45.0,  # Default hourly rate
            "rating": 0.0,
            "reviews_count": 0,
            "receive_updates": expert.receive_updates
        }
        
        # Insert expert into database
        result = db.experts.insert_one(expert_data)
        
        # Send verification email
        send_verification_code_email(
            expert.email,
            expert.first_name,
            verification_code
        )
        
        # Remove verification code from response in register_expert
        return {
            "message": "Expert registered successfully. Please check your email for verification code.",
            "id": str(result.inserted_id),
            "email": expert.email
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error registering expert: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during registration: {str(e)}"
        )

@router.post("/verify-email", response_model=dict)
async def verify_email(verify_data: VerifyEmail):
    """
    Verify email with verification code
    """
    try:
        # Check if user exists in students collection
        user = db.students.find_one({"email": verify_data.email})
        collection = db.students
        role = "student"
        
        # If not found in students, check experts
        if not user:
            user = db.experts.find_one({"email": verify_data.email})
            collection = db.experts
            role = "expert"
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if already verified
        if user.get("is_verified", False):
            return {"message": "Email already verified"}
        
        # Check verification code
        if user.get("verification_code") != verify_data.verification_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        # Check if code is expired
        expires = user.get("verification_code_expires")
        if expires:
            # Ensure both datetimes are timezone-aware
            now = datetime.now(timezone.utc)
            # If expires doesn't have timezone info, add UTC timezone
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
                
            if expires < now:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification code expired"
                )
        
        # Update user as verified
        collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {"is_verified": True},
                "$unset": {"verification_code": "", "verification_code_expires": ""}
            }
        )
        
        # Send welcome email
        send_welcome_email(
            verify_data.email,
            f"{user['first_name']} {user['last_name']}",
            role
        )
        
        return {"message": "Email verified successfully"}
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error verifying email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during email verification: {str(e)}"
        )

@router.post("/resend-verification", response_model=dict)
async def resend_verification(email_data: PasswordReset):
    """
    Resend verification code
    """
    try:
        # Check if user exists in students collection
        user = db.students.find_one({"email": email_data.email})
        collection = db.students
        
        # If not found in students, check experts
        if not user:
            user = db.experts.find_one({"email": email_data.email})
            collection = db.experts
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if already verified
        if user.get("is_verified", False):
            return {"message": "Email already verified"}
        
        # Generate new verification code
        verification_code = generate_verification_code()
        
        # Update user with new verification code
        collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "verification_code": verification_code,
                    "verification_code_expires": get_verification_code_expiry()
                }
            }
        )
        
        # Send verification email
        send_verification_code_email(
            email_data.email,
            user["first_name"],
            verification_code
        )
        
        # Remove verification code from response in resend_verification
        return {
            "message": "Verification code sent successfully"
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error resending verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while resending verification code: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user in database
    student = db.students.find_one({"email": form_data.username})
    if student and verify_password(form_data.password, student["password"]):
        user_data = {
            "sub": student["email"],
            "role": "student"
        }
        access_token = create_access_token(user_data)
        
        # Set cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/",
            samesite="lax",
            secure=False  # Set to True in production with HTTPS
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": "student",
            "is_verified": student.get("is_verified", False)
        }
    
    expert = db.experts.find_one({"email": form_data.username})
    if expert and verify_password(form_data.password, expert["password"]):
        user_data = {
            "sub": expert["email"],
            "role": "expert"
        }
        access_token = create_access_token(user_data)
        
        # Set cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/",
            samesite="lax",
            secure=False  # Set to True in production with HTTPS
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": "expert",
            "is_verified": expert.get("is_verified", False)
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Successfully logged out"}

@router.post("/forgot-password")
async def forgot_password(reset_data: PasswordReset):
    """
    Send password reset code
    """
    try:
        # Check if user exists in students collection
        user = db.students.find_one({"email": reset_data.email})
        collection = db.students
        
        # If not found in students, check experts
        if not user:
            user = db.experts.find_one({"email": reset_data.email})
            collection = db.experts
        
        if not user:
            # Don't reveal that email doesn't exist for security
            return {"message": "If your email is registered, you will receive a password reset code"}
        
        # Generate reset code
        reset_code = generate_verification_code()
        
        # Update user with reset code
        collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "reset_code": reset_code,
                    "reset_code_expires": get_password_reset_code_expiry()
                }
            }
        )
        
        # Send password reset email
        send_password_reset_code_email(
            reset_data.email,
            user["first_name"],
            reset_code
        )
        
        return {
            "message": "Password reset code sent successfully"
        }
    except Exception as e:
        logger.error(f"Error sending password reset: {str(e)}")
        # Don't reveal specific errors for security
        return {"message": "If your email is registered, you will receive a password reset code"}

@router.post("/reset-password")
async def reset_password(reset_data: ResetPassword):
    """
    Reset password with code
    """
    try:
        # Check if user exists in students collection
        user = db.students.find_one({"email": reset_data.email})
        collection = db.students
        
        # If not found in students, check experts
        if not user:
            user = db.experts.find_one({"email": reset_data.email})
            collection = db.experts
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check reset code
        if user.get("reset_code") != reset_data.reset_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset code"
            )
        
        # Check if code is expired
        expires = user.get("reset_code_expires")
        if expires:
            # Ensure both datetimes are timezone-aware
            now = datetime.now(timezone.utc)
            # If expires.tzinfo is None:
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
                
            if expires < now:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Reset code expired"
                )
    
        if bcrypt.checkpw(reset_data.password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from the old password"
        )
        # Update user with new password
        collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {"password": hash_password(reset_data.password)},
                "$unset": {"reset_code": "", "reset_code_expires": ""}
            }
        )
        
        return {"message": "Password reset successfully"}
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during password reset: {str(e)}"
        )

@router.post("/refresh")
async def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None)
):
    """
    Refresh access token using refresh token
    """
    try:
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token missing"
            )
        
        # Verify refresh token
        payload = verify_token(refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new access token
        email = payload.email
        role = payload.role
        
        if not email or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": email, "role": role},
            expires_delta=access_token_expires
        )
        
        # Set cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax",
            secure=os.getenv("ENVIRONMENT") == "production"
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": role
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during token refresh: {str(e)}"
        )

@router.get("/me")
async def get_me(user = Depends(get_current_user_from_cookie)):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return user


@router.get("/login-google")
async def login_via_google(request: Request):
    # request.session.clear()
    frontend_url = os.getenv("FRONTEND_URL", "http://127.0.0.1:3000")
    redirect_url = os.getenv("REDIRECT_URL", "http://127.0.0.1:8000/api/auth")
    request.session["login_redirect"] = frontend_url 
    
    # Log the session before redirect
    print("Session before redirect:", dict(request.session))
    print("redirect_url:", redirect_url)
    
    return await oauth.google.authorize_redirect(request, redirect_url)

# @router.get('/')
# async def auth(request: Request):
#     # Log the session after callback
#     print("Session after callback:", dict(request.session))
#     print("Request query params:", request.query_params)
    
#     try:
#         token = await oauth.google.authorize_access_token(request)
#          # Here you would typically:
#         # 1. Check if the user exists in your database
#         # 2. Create a user if they don't exist
#         # 3. Generate a JWT token for your frontend
#         # 4. Redirect to frontend with token
        
#     except Exception as e:
#         print(f"Authentication error: {str(e)}")
#         raise HTTPException(status_code=401, detail=f"Google authentication failed: {str(e)}")


@router.get("/")
async def auth(request: Request):
    print("HERE IN AUTH")
    print("Session after callback:", dict(request.session))
    print("Request query params:", request.query_params)

    try:
        # Change from auth_demo to google to match registration
        token = await oauth.google.authorize_access_token(request)
        print("TOKEN: ", token)
    except Exception as e:
        print(f"Error getting access token: {str(e)}")
        raise HTTPException(status_code=401, detail="Google authentication failed.")

    try:
        # Get user info directly from token response
        user = token.get("userinfo")
        
        # If userinfo is not in token, fetch it
        if not user:
            user_info_endpoint = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f'Bearer {token["access_token"]}'}
            google_response = requests.get(user_info_endpoint, headers=headers)
            user = google_response.json()
            
        user_id = user.get("sub")
        user_email = user.get("email")
        user_name = user.get("name")
        user_pic = user.get("picture")
        
    except Exception as e:
        print(f"Error fetching user info: {str(e)}")
        raise HTTPException(status_code=401, detail="Failed to fetch user information.")
    
    # Validation
    if not user_id or not user_email:
        raise HTTPException(status_code=401, detail="Invalid user information from Google.")

    # Create JWT token
    expires_in = token.get("expires_in", ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    access_token_expires = timedelta(seconds=expires_in)
    access_token = create_access_token(data={"sub": user_id, "email": user_email}, expires_delta=access_token_expires)

    session_id = str(uuid.uuid4())
    # Your user logging logic here if needed
    # log_user(user_id, user_email, user_name, user_pic, datetime.utcnow(), datetime.utcnow())
    # log_token(access_token, user_email, session_id)

    # Use stored redirect URL or default to frontend URL
    # redirect_url = request.session.pop("login_redirect", FRONTEND_URL)
    # redirect_url = f"http://{os.getenv('BACKEND_HOST')}:{os.getenv('BACKEND_PORT')}/api/auth"
    redirect_url = "http://localhost:3000/auth/login"
    response = RedirectResponse(redirect_url)
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        domain="http://127.0.0.1:8000"            # ← explicitly set domain
    )

    return response