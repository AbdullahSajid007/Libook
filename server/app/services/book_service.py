from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status
from server.app.models.book import Book
from server.app.models.loan import Loan
from server.app.schemas.book import BookCreate, BookUpdate

class BookService:
    @staticmethod
    def list_books(
        db: Session,
        search: Optional[str] = None,
        title: Optional[str] = None,
        author: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Book]:
        query = db.query(Book)
        
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Book.title.ilike(term),
                    Book.author.ilike(term),
                    Book.category.ilike(term),
                    Book.isbn.ilike(term)
                )
            )
        if title:
            query = query.filter(Book.title.ilike(f"%{title.strip()}%"))
        if author:
            query = query.filter(Book.author.ilike(f"%{author.strip()}%"))
        if category:
            query = query.filter(Book.category.ilike(f"%{category.strip()}%"))
            
        return query.order_by(Book.title.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_book_by_id(db: Session, book_id: int) -> Book:
        book = db.query(Book).filter(Book.book_id == book_id).first()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with ID {book_id} not found"
            )
        return book

    @staticmethod
    def create_book(db: Session, data: BookCreate) -> Book:
        if data.isbn:
            existing = db.query(Book).filter(Book.isbn == data.isbn).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A book with ISBN '{data.isbn}' already exists"
                )

        new_book = Book(
            title=data.title,
            author=data.author,
            category=data.category,
            isbn=data.isbn,
            total_copies=data.total_copies,
            available_copies=data.total_copies
        )
        db.add(new_book)
        db.commit()
        db.refresh(new_book)
        return new_book

    @staticmethod
    def update_book(db: Session, book_id: int, data: BookUpdate) -> Book:
        book = BookService.get_book_by_id(db, book_id)

        # Check ISBN uniqueness if changed
        if data.isbn is not None and data.isbn != book.isbn:
            existing = db.query(Book).filter(Book.isbn == data.isbn, Book.book_id != book_id).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Another book with ISBN '{data.isbn}' already exists"
                )
            book.isbn = data.isbn

        if data.title is not None:
            book.title = data.title
        if data.author is not None:
            book.author = data.author
        if data.category is not None:
            book.category = data.category

        # Copies update logic preserving loan integrity
        if data.total_copies is not None:
            borrowed_now = book.total_copies - book.available_copies
            if data.total_copies < borrowed_now:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot reduce total copies below currently borrowed copies ({borrowed_now})"
                )
            # Adjust available copies proportionally
            copy_diff = data.total_copies - book.total_copies
            book.total_copies = data.total_copies
            book.available_copies = max(0, book.available_copies + copy_diff)

        if data.available_copies is not None:
            if data.available_copies > book.total_copies:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Available copies ({data.available_copies}) cannot exceed total copies ({book.total_copies})"
                )
            book.available_copies = data.available_copies

        db.commit()
        db.refresh(book)
        return book

    @staticmethod
    def delete_book(db: Session, book_id: int) -> bool:
        book = BookService.get_book_by_id(db, book_id)

        # Block deletion if active loans exist (FR-13, Business Rule 11)
        active_loans = db.query(Loan).filter(Loan.book_id == book_id, Loan.returned_at.is_(None)).count()
        if active_loans > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot remove book '{book.title}': it currently has {active_loans} active loan(s). All borrowed copies must be returned first."
            )

        # If only past returned loans exist, delete past loan records or prevent orphaned rows
        db.query(Loan).filter(Loan.book_id == book_id).delete()
        db.delete(book)
        db.commit()
        return True
