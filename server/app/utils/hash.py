import bcrypt
import random
import string
from datetime import datetime, timedelta, timezone
import os
import secrets
from dotenv import load_dotenv

load_dotenv()

# Constants
TOKEN_LENGTH = 64
VERIFICATION_CODE_LENGTH = 6
VERIFICATION_CODE_EXPIRY = int(os.getenv("VERIFICATION_CODE_EXPIRY", 24))  # hours
PASSWORD_RESET_CODE_EXPIRY = int(os.getenv("PASSWORD_RESET_CODE_EXPIRY", 1))  # hours

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token() -> str:
    """Generate a secure random token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(TOKEN_LENGTH))

def generate_verification_code() -> str:
    """Generate a numeric verification code"""
    return ''.join(random.choices(string.digits, k=VERIFICATION_CODE_LENGTH))

def get_verification_code_expiry() -> datetime:
    """Get expiry time for verification code"""
    return datetime.now(timezone.utc) + timedelta(hours=VERIFICATION_CODE_EXPIRY)

def get_password_reset_code_expiry() -> datetime:
    """Get expiry time for password reset code"""
    return datetime.now(timezone.utc) + timedelta(hours=PASSWORD_RESET_CODE_EXPIRY)
