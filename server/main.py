# server/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user

app = FastAPI()

# Allow frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routes
app.include_router(user.router, prefix="/api/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "FastAPI is running"}
