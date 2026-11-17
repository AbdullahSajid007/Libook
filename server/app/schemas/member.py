from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict

class MemberBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr = Field(..., max_length=255)
    phone: str = Field(..., min_length=1, max_length=30)
    registration_date: Optional[date] = Field(default_factory=date.today)

    @field_validator("full_name", "phone")
    @classmethod
    def not_empty_str(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Field cannot be blank or only whitespace")
        return s

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[EmailStr] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, min_length=1, max_length=30)
    registration_date: Optional[date] = None

    @field_validator("full_name", "phone")
    @classmethod
    def not_empty_str(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            s = v.strip()
            if not s:
                raise ValueError("Field cannot be blank or only whitespace")
            return s
        return v

class MemberOut(MemberBase):
    member_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
