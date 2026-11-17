from sqlalchemy import Column, Integer, String, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from server.app.database import Base

class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    isbn = Column(String(20), unique=True, nullable=True, index=True)
    total_copies = Column(Integer, nullable=False, default=1)
    available_copies = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("total_copies >= 0", name="chk_book_total_copies_non_negative"),
        CheckConstraint("available_copies >= 0", name="chk_book_available_copies_non_negative"),
        CheckConstraint("available_copies <= total_copies", name="chk_book_available_lte_total"),
    )

    loans = relationship("Loan", back_populates="book")

    @property
    def borrowed_copies(self) -> int:
        return self.total_copies - self.available_copies
