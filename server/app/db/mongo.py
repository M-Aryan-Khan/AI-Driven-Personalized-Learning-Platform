import os
from pymongo import MongoClient
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Get the MongoDB URI and the database name from environment variables
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB")

if not MONGODB_URI or not MONGODB_DB:
    raise ValueError("Missing MongoDB connection info. Check your .env file.")

try:
    # Create a MongoClient and select the database
    client = MongoClient(MONGODB_URI)
    db = client[MONGODB_DB]
    
    # Test connection
    client.admin.command('ping')
    logger.info(f"Connected to MongoDB: {MONGODB_DB}")
    
    # Create indexes for better performance
    # Email indexes for quick lookups and to ensure uniqueness
    db.students.create_index("email", unique=True)
    db.experts.create_index("email", unique=True)
    
    # Verification token indexes
    db.students.create_index("verification_token")
    db.experts.create_index("verification_token")
    
    # Password reset token indexes
    db.students.create_index("password_reset_token")
    db.experts.create_index("password_reset_token")
    
    # Session indexes
    db.sessions.create_index("expert_id")
    db.sessions.create_index("student_id")
    db.sessions.create_index("date")
    
    # Review indexes
    db.reviews.create_index("expert_id")
    db.reviews.create_index("session_id", unique=True)
    
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise
