from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.user import User
from server.app.models.member import Member
from server.app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserOut
from server.app.schemas.common import ApiResponse
from server.app.security import verify_password, hash_password, create_access_token
from server.app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(request: LoginRequest, db: Session = Depends(get_db)):
    identifier = request.username.strip()
    user = (
        db.query(User)
        .outerjoin(Member, User.member_id == Member.member_id)
        .filter(
            or_(
                User.username == identifier,
                Member.email.ilike(identifier)
            )
        )
        .first()
    )
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

@router.post("/signup", response_model=ApiResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    clean_email = request.email.strip().lower()

    # Check if member with this email already exists
    existing_member = db.query(Member).filter(Member.email.ilike(clean_email)).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{clean_email}' already exists. Please sign in."
        )

    # Determine username (custom or email prefix)
    desired_username = (
        request.username.strip()
        if request.username and request.username.strip()
        else clean_email.split("@")[0].replace("+", "").replace(".", "_")
    )

    # Ensure unique username
    candidate_username = desired_username
    counter = 1
    while db.query(User).filter(User.username == candidate_username).first():
        candidate_username = f"{desired_username}{counter}"
        counter += 1

    # 1. Create corresponding member profile
    new_member = Member(
        full_name=request.full_name.strip(),
        email=clean_email,
        phone=request.phone.strip() if request.phone and request.phone.strip() else "N/A"
    )
    db.add(new_member)
    db.flush()

    # 2. Create user credentials with role MEMBER
    new_user = User(
        username=candidate_username,
        password_hash=hash_password(request.password),
        role="MEMBER",
        member_id=new_member.member_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={
            "sub": new_user.username,
            "user_id": new_user.user_id,
            "role": new_user.role,
            "member_id": new_user.member_id
        }
    )

    return ApiResponse(
        success=True,
        message="Account registered successfully",
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserOut.model_validate(new_user)
        )
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
