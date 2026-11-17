from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Username or email")
    password: str = Field(..., min_length=1, description="Password")

class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200, description="Full name of member")
    email: str = Field(..., min_length=5, max_length=255, description="Valid email address")
    password: str = Field(..., min_length=6, max_length=100, description="Account password (min 6 chars)")
    username: Optional[str] = Field(None, min_length=3, max_length=100, description="Optional custom username")
    phone: Optional[str] = Field(None, max_length=30, description="Contact phone number")

class UserOut(BaseModel):
    user_id: int
    username: str
    role: str
    member_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: str  # username
    user_id: int
    role: str
    member_id: Optional[int] = None
    exp: Optional[int] = None
