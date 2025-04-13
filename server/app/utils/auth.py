from fastapi.security import OAuth2PasswordBearer
from app.utils.JWTtoken import verify_token
from fastapi import HTTPException, Security, Depends

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Security(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid token")
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    return {"email": payload["sub"], "role": payload["role"]}


def require_role(required_role: str):
    def role_dependency(user: dict = Depends(get_current_user)):
        if user["role"] != required_role:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return role_dependency