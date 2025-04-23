from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
import logging
from starlette.middleware.sessions import SessionMiddleware

# Load environment variables
load_dotenv(override=True)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log")
    ]
)

# Import routers
from app.routes.auth_routes import router as auth_router
from app.routes.student_routes import router as student_router
from app.routes.expert_routes import router as expert_router
#from app.routes.review_routes import router as review_router

# Create FastAPI app
app = FastAPI(
    title="Synapse API",
    description="API for Synapse learning platform",
    version="1.0.0"
)

app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv("FASTAPI_SECRET_KEY"),
    session_cookie="synapse_session",
    max_age=3600,  # Session timeout in seconds
    same_site="lax",  # Helps with CSRF protection
    https_only=False,  # Set to True in production with HTTPS
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(SessionMiddleware, secret_key=os.getenv("FASTAPI_SECRET_KEY"))

# Mount static files directory for profile images
os.makedirs("static/profile-images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(expert_router)
#app.include_router(review_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to the Synapse API",
        "documentation": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT", "development") == "development"
    )
