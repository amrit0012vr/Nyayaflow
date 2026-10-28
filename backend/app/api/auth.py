from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db, User
from app.schemas.schemas import UserLogin, TokenResponse, UserOut
from app.core.security import verify_password, create_access_token
from app.core.rbac import get_current_user_payload

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_payload = {
        "sub": user.id,
        "user_id": user.id,
        "name": user.name,
        "role": user.role,
        "org": user.org
    }
    token = create_access_token(token_payload)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "org": user.org
        }
    }

@router.get("/me")
def get_current_user(current_user: dict = Depends(get_current_user_payload)):
    return current_user
