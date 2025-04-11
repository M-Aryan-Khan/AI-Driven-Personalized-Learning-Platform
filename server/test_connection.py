import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment
mongodb_uri = os.getenv("MONGODB_URI")
mongodb_db = os.getenv("MONGODB_DB")

print(f"Attempting to connect to database: {mongodb_db}")
print(f"Using URI: {mongodb_uri.replace('://', '://').split('@')[0].split('://')[0]}://*****@{mongodb_uri.split('@')[1]}")

try:
    # Create client and connect
    client = MongoClient(mongodb_uri)
    
    # Test connection by listing database names
    dbs = client.list_database_names()
    print(f"Connection successful! Available databases: {dbs}")
    
    # Test specific database access
    db = client[mongodb_db]
    collections = db.list_collection_names()
    print(f"Collections in {mongodb_db}: {collections}")
    
except Exception as e:
    print(f"Connection failed: {e}")
finally:
    # Close connection
    if 'client' in locals():
        client.close()
        print("Connection closed")