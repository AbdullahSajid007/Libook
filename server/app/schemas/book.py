from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict

class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    isbn: Optional[str] = Field(None, max_length=20)
    total_copies: int = Field(1, ge=0)

    @field_validator("title", "author", "category")
    @classmethod
    def not_empty_str(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Field cannot be blank or only whitespace")
        return s

    @field_validator("isbn")
    @classmethod
    def clean_isbn(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip()
        return cleaned if cleaned else None

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    author: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    isbn: Optional[str] = Field(None, max_length=20)
    total_copies: Optional[int] = Field(None, ge=0)
    available_copies: Optional[int] = Field(None, ge=0)

    @field_validator("title", "author", "category")
    @classmethod
    def not_empty_str(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            s = v.strip()
            if not s:
                raise ValueError("Field cannot be blank or only whitespace")
            return s
        return v

class BookOut(BookBase):
    book_id: int
    available_copies: int
    borrowed_copies: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
