from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, model_validator, ConfigDict

class LoanCreate(BaseModel):
    member_id: int
    book_id: int
    borrowed_at: Optional[date] = Field(default_factory=date.today)
    due_date: date

    @model_validator(mode="after")
    def validate_due_date(self):
        borrowed = self.borrowed_at or date.today()
        if self.due_date < borrowed:
            raise ValueError("Expected return date (due_date) cannot be earlier than borrowing date")
        return self

class LoanReturn(BaseModel):
    returned_at: Optional[date] = Field(default_factory=date.today)

class LoanMemberSummary(BaseModel):
    member_id: int
    full_name: str
    email: str
    phone: str

    model_config = ConfigDict(from_attributes=True)

class LoanBookSummary(BaseModel):
    book_id: int
    title: str
    author: str
    category: str
    isbn: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LoanOut(BaseModel):
    loan_id: int
    member_id: int
    book_id: int
    borrowed_at: date
    due_date: date
    returned_at: Optional[date] = None
    created_at: datetime
    status: str
    member: Optional[LoanMemberSummary] = None
    book: Optional[LoanBookSummary] = None

    model_config = ConfigDict(from_attributes=True)
