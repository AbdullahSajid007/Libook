from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from server.app.models.book import Book
from server.app.models.member import Member
from server.app.models.loan import Loan
from server.app.schemas.dashboard import DashboardSummaryOut

class DashboardService:
    @staticmethod
    def get_summary(db: Session) -> DashboardSummaryOut:
        today = date.today()

        total_books = db.query(func.count(Book.book_id)).scalar() or 0
        total_copies = db.query(func.sum(Book.total_copies)).scalar() or 0
        total_members = db.query(func.count(Member.member_id)).scalar() or 0

        # Currently borrowed: active loans where returned_at is null
        currently_borrowed = db.query(func.count(Loan.loan_id)).filter(
            Loan.returned_at.is_(None)
        ).scalar() or 0

        # Overdue loans: active loans where due_date < today
        overdue_loans = db.query(func.count(Loan.loan_id)).filter(
            Loan.returned_at.is_(None),
            Loan.due_date < today
        ).scalar() or 0

        return DashboardSummaryOut(
            total_books=total_books,
            total_physical_copies=total_copies,
            total_members=total_members,
            currently_borrowed=currently_borrowed,
            overdue_loans=overdue_loans
        )
