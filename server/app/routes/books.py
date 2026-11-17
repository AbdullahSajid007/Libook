from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.user import User
from server.app.schemas.book import BookCreate, BookUpdate, BookOut
from server.app.schemas.common import ApiResponse
from server.app.services.book_service import BookService
from server.app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("", response_model=ApiResponse[List[BookOut]])
def list_books(
    search: Optional[str] = Query(None, description="Search across title, author, category, ISBN"),
    title: Optional[str] = Query(None, description="Filter by title"),
    author: Optional[str] = Query(None, description="Filter by author"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    books = BookService.list_books(
        db, search=search, title=title, author=author, category=category, skip=skip, limit=limit
    )
    return ApiResponse(
        success=True,
        message="Books retrieved successfully",
        data=[BookOut.model_validate(b) for b in books]
    )

@router.get("/{book_id}", response_model=ApiResponse[BookOut])
def get_book_details(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = BookService.get_book_by_id(db, book_id)
    return ApiResponse(
        success=True,
        message="Book retrieved successfully",
        data=BookOut.model_validate(book)
    )

@router.post("", response_model=ApiResponse[BookOut], status_code=status.HTTP_201_CREATED)
def create_book(
    book_data: BookCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    new_book = BookService.create_book(db, book_data)
    return ApiResponse(
        success=True,
        message=f"Book '{new_book.title}' created successfully",
        data=BookOut.model_validate(new_book)
    )

@router.put("/{book_id}", response_model=ApiResponse[BookOut])
def update_book(
    book_id: int,
    book_data: BookUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    updated_book = BookService.update_book(db, book_id, book_data)
    return ApiResponse(
        success=True,
        message=f"Book '{updated_book.title}' updated successfully",
        data=BookOut.model_validate(updated_book)
    )

@router.delete("/{book_id}", response_model=ApiResponse[dict])
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    BookService.delete_book(db, book_id)
    return ApiResponse(
        success=True,
        message="Book removed successfully",
        data={"book_id": book_id}
    )
