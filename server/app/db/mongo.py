import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the MongoDB URI and the database name from environment variables
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB")

if not MONGODB_URI or not MONGODB_DB:
    raise ValueError("Missing MongoDB connection info. Check your .env file.")

# Create a MongoClient and select the database
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
