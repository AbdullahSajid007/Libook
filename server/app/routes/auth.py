from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.user import User
from server.app.schemas.auth import LoginRequest, TokenResponse, UserOut
from server.app.schemas.common import ApiResponse
from server.app.security import verify_password, create_access_token
from server.app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        data={
            "sub": user.username,
            "user_id": user.user_id,
            "role": user.role,
            "member_id": user.member_id
        }
    )

    user_out = UserOut.model_validate(user)
    token_response = TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_out
    )

    return ApiResponse(
        success=True,
        message="Login successful",
        data=token_response
    )

@router.post("/logout", response_model=ApiResponse[dict])
def logout(current_user: User = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        message="Logged out successfully",
        data={"user": current_user.username}
    )

@router.get("/me", response_model=ApiResponse[UserOut])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        message="User profile retrieved",
        data=UserOut.model_validate(current_user)
    )
