from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from server.app.models.loan import Loan
from server.app.models.book import Book
from server.app.models.member import Member
from server.app.schemas.loan import LoanCreate, LoanReturn

class LoanService:
    @staticmethod
    def borrow_book(db: Session, data: LoanCreate) -> Loan:
        # Validate member exists
        member = db.query(Member).filter(Member.member_id == data.member_id).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Member with ID {data.member_id} not found"
            )

        # Atomic borrowing transaction with row lock
        # In SQLite with_for_update() is a no-op, while in PostgreSQL it enforces row-level locking
        try:
            # Query book with FOR UPDATE lock to prevent race conditions on last copy (TC-19)
            book_query = db.query(Book).filter(Book.book_id == data.book_id)
            if db.bind.dialect.name != "sqlite":
                book_query = book_query.with_for_update()
            
            book = book_query.first()
            if not book:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Book with ID {data.book_id} not found"
                )

            # Check available copies
            if book.available_copies <= 0:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"No copies available for '{book.title}'. Total copies: {book.total_copies}, Available: {book.available_copies}"
                )

            # Create loan
            new_loan = Loan(
                member_id=data.member_id,
                book_id=data.book_id,
                borrowed_at=data.borrowed_at or date.today(),
                due_date=data.due_date,
                returned_at=None
            )
            db.add(new_loan)

            # Decrement available copies
            book.available_copies -= 1

            db.commit()
            db.refresh(new_loan)
            return new_loan
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while creating loan: {str(e)}"
            )

    @staticmethod
    def return_book(db: Session, loan_id: int, data: Optional[LoanReturn] = None) -> Loan:
        try:
            # Locate loan
            loan = db.query(Loan).filter(Loan.loan_id == loan_id).first()
            if not loan:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Loan record with ID {loan_id} not found"
                )

            # Prevent double return (FR-43, TC-21)
            if loan.returned_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Book has already been returned on {loan.returned_at}. Cannot return twice."
                )

            # Row lock book
            book_query = db.query(Book).filter(Book.book_id == loan.book_id)
            if db.bind.dialect.name != "sqlite":
                book_query = book_query.with_for_update()
            book = book_query.first()

            return_date = (data.returned_at if data and data.returned_at else None) or date.today()
            loan.returned_at = return_date

            if book:
                # Increment available copies (capped at total_copies)
                book.available_copies = min(book.total_copies, book.available_copies + 1)

            db.commit()
            db.refresh(loan)
            return loan
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while returning book: {str(e)}"
            )

    @staticmethod
    def list_loans(
        db: Session,
        status_filter: Optional[str] = None,
        member_id: Optional[int] = None,
        book_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Loan]:
        query = db.query(Loan).options(
            joinedload(Loan.member),
            joinedload(Loan.book)
        )

        if member_id:
            query = query.filter(Loan.member_id == member_id)
        if book_id:
            query = query.filter(Loan.book_id == book_id)

        all_loans = query.order_by(Loan.loan_id.desc()).offset(skip).limit(limit).all()

        if status_filter and status_filter.upper() != "ALL":
            filter_val = status_filter.upper()
            return [l for l in all_loans if l.get_status() == filter_val]

        return all_loans

    @staticmethod
    def get_overdue_loans(db: Session) -> List[Loan]:
        today = date.today()
        loans = db.query(Loan).options(
            joinedload(Loan.member),
            joinedload(Loan.book)
        ).filter(
            Loan.returned_at.is_(None),
            Loan.due_date < today
        ).order_by(Loan.due_date.asc()).all()
        return loans

    @staticmethod
    def get_member_loan_history(db: Session, member_id: int) -> List[Loan]:
        loans = db.query(Loan).options(
            joinedload(Loan.member),
            joinedload(Loan.book)
        ).filter(
            Loan.member_id == member_id
        ).order_by(Loan.loan_id.desc()).all()
        return loans
