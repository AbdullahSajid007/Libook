from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.user import User
from server.app.schemas.member import MemberCreate, MemberUpdate, MemberOut
from server.app.schemas.loan import LoanOut
from server.app.schemas.common import ApiResponse
from server.app.services.member_service import MemberService
from server.app.services.loan_service import LoanService
from server.app.dependencies import get_current_user, require_admin, require_member

router = APIRouter(prefix="/members", tags=["Members"])

@router.get("/me/loans", response_model=ApiResponse[List[LoanOut]])
def get_my_borrowing_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_member)
):
    """
    FR-49..53: Retrieves the authenticated member's personal borrowing history.
    Strictly derives member_id from the verified JWT session.
    """
    loans = LoanService.get_member_loan_history(db, current_user.member_id)
    out_list = []
    for l in loans:
        item = LoanOut(
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
        out_list.append(item)
    return ApiResponse(
        success=True,
        message="Member loan history retrieved successfully",
        data=out_list
    )

@router.get("", response_model=ApiResponse[List[MemberOut]])
def list_members(
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    members = MemberService.list_members(db, search=search, skip=skip, limit=limit)
    return ApiResponse(
        success=True,
        message="Members retrieved successfully",
        data=[MemberOut.model_validate(m) for m in members]
    )

@router.get("/{member_id}", response_model=ApiResponse[MemberOut])
def get_member_details(
    member_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    member = MemberService.get_member_by_id(db, member_id)
    return ApiResponse(
        success=True,
        message="Member retrieved successfully",
        data=MemberOut.model_validate(member)
    )

@router.post("", response_model=ApiResponse[MemberOut], status_code=status.HTTP_201_CREATED)
def register_member(
    member_data: MemberCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    new_member = MemberService.create_member(db, member_data)
    return ApiResponse(
        success=True,
        message=f"Member '{new_member.full_name}' registered successfully",
        data=MemberOut.model_validate(new_member)
    )

@router.put("/{member_id}", response_model=ApiResponse[MemberOut])
def update_member(
    member_id: int,
    member_data: MemberUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    updated = MemberService.update_member(db, member_id, member_data)
    return ApiResponse(
        success=True,
        message=f"Member '{updated.full_name}' updated successfully",
        data=MemberOut.model_validate(updated)
    )

@router.delete("/{member_id}", response_model=ApiResponse[dict])
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    MemberService.delete_member(db, member_id)
    return ApiResponse(
        success=True,
        message="Member removed successfully",
        data={"member_id": member_id}
    )
