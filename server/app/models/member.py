from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from server.app.database import Base

class Member(Base):
    __tablename__ = "members"

    member_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(200), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=False)
    registration_date = Column(Date, nullable=False, default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="member", uselist=False)
    loans = relationship("Loan", back_populates="member", cascade="all, delete-orphan")
