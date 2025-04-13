# server/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.student_routes import router as student_router
from app.routes.educator_routes import router as educator_router
from app.routes.authentication import router as authentication_router
# from app.routes.course_routes import router as course_router

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
app.include_router(authentication_router)
app.include_router(student_router)
app.include_router(educator_router)
# app.include_router(course_router)

@app.get("/")
def root():
    return {"message": "AI Learning Platform API is running"}
