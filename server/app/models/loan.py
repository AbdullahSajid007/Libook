from datetime import date
from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from server.app.database import Base

class Loan(Base):
    __tablename__ = "loans"

    loan_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("members.member_id", ondelete="RESTRICT"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.book_id", ondelete="RESTRICT"), nullable=False, index=True)
    borrowed_at = Column(Date, nullable=False, default=func.current_date())
    due_date = Column(Date, nullable=False, index=True)
    returned_at = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    member = relationship("Member", back_populates="loans")
    book = relationship("Book", back_populates="loans")

    def get_status(self) -> str:
        """
        Derives loan status per Section 2.7 & 5.1 of planning.md:
        - RETURNED if returned_at is not null.
        - OVERDUE if returned_at is null and due_date < today.
        - BORROWED otherwise.
        """
        if self.returned_at is not None:
            return "RETURNED"
        if self.due_date < date.today():
            return "OVERDUE"
        return "BORROWED"
