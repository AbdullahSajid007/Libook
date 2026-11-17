from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.user import User
from server.app.schemas.loan import LoanCreate, LoanReturn, LoanOut
from server.app.schemas.common import ApiResponse
from server.app.services.loan_service import LoanService
from server.app.dependencies import require_admin

router = APIRouter(prefix="/loans", tags=["Loans & Returns"])

@router.get("", response_model=ApiResponse[List[LoanOut]])
def list_loans(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by BORROWED, OVERDUE, RETURNED, or ALL"),
    member_id: Optional[int] = Query(None, description="Filter by member ID"),
    book_id: Optional[int] = Query(None, description="Filter by book ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    loans = LoanService.list_loans(
        db, status_filter=status_filter, member_id=member_id, book_id=book_id, skip=skip, limit=limit
    )
    out_list = [
        LoanOut(
            loan_id=l.loan_id,
            member_id=l.member_id,
            book_id=l.book_id,
            borrowed_at=l.borrowed_at,
            due_date=l.due_date,
            returned_at=l.returned_at,
            created_at=l.created_at,
            status=l.get_status(),
            member=l.member,
            book=l.book
        )
        for l in loans
    ]
    return ApiResponse(
        success=True,
        message="Loans retrieved successfully",
        data=out_list
    )

@router.get("/overdue", response_model=ApiResponse[List[LoanOut]])
def list_overdue_loans(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    loans = LoanService.get_overdue_loans(db)
    out_list = [
        LoanOut(
            loan_id=l.loan_id,
            member_id=l.member_id,
            book_id=l.book_id,
            borrowed_at=l.borrowed_at,
            due_date=l.due_date,
            returned_at=l.returned_at,
            created_at=l.created_at,
            status=l.get_status(),
            member=l.member,
            book=l.book
        )
        for l in loans
    ]
    return ApiResponse(
        success=True,
        message=f"{len(out_list)} overdue loans retrieved",
        data=out_list
    )

@router.post("", response_model=ApiResponse[LoanOut], status_code=status.HTTP_201_CREATED)
def borrow_book(
    loan_data: LoanCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    loan = LoanService.borrow_book(db, loan_data)
    out = LoanOut(
        loan_id=loan.loan_id,
        member_id=loan.member_id,
        book_id=loan.book_id,
        borrowed_at=loan.borrowed_at,
        due_date=loan.due_date,
        returned_at=loan.returned_at,
        created_at=loan.created_at,
        status=loan.get_status(),
        member=loan.member,
        book=loan.book
    )
    return ApiResponse(
        success=True,
        message="Book borrowed successfully. Available copies decreased by 1.",
        data=out
    )

@router.patch("/{loan_id}/return", response_model=ApiResponse[LoanOut])
def return_book(
    loan_id: int,
    return_data: Optional[LoanReturn] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    loan = LoanService.return_book(db, loan_id, return_data)
    out = LoanOut(
        loan_id=loan.loan_id,
        member_id=loan.member_id,
        book_id=loan.book_id,
        borrowed_at=loan.borrowed_at,
        due_date=loan.due_date,
        returned_at=loan.returned_at,
        created_at=loan.created_at,
        status=loan.get_status(),
        member=loan.member,
        book=loan.book
    )
    return ApiResponse(
        success=True,
        message="Book marked as returned successfully. Available copies increased by 1.",
        data=out
    )
