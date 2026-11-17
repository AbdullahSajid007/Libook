from pydantic import BaseModel

class DashboardSummaryOut(BaseModel):
    total_books: int
    total_physical_copies: int
    total_members: int
    currently_borrowed: int
    overdue_loans: int
