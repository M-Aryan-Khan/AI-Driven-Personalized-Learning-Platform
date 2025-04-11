# server/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.user_routes import router as user_router
from app.routes.course_routes import router as course_router

app = FastAPI()

# Allow frontend (or other origins) access. For development, "*" is okay.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers. All endpoints are prefixed with /api
app.include_router(user_router, prefix="/api")
app.include_router(course_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AI Learning Platform API is running"}
