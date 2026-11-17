from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, description="Username or email")
    password: str = Field(..., min_length=1, description="Password")

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
