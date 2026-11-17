from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from server.app.models.member import Member
from server.app.models.user import User
from server.app.models.loan import Loan
from server.app.schemas.member import MemberCreate, MemberUpdate
from server.app.security import hash_password

class MemberService:
    @staticmethod
    def list_members(
        db: Session,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Member]:
        query = db.query(Member)
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Member.full_name.ilike(term),
                    Member.email.ilike(term),
                    Member.phone.ilike(term)
                )
            )
        return query.order_by(Member.member_id.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_member_by_id(db: Session, member_id: int) -> Member:
        member = db.query(Member).filter(Member.member_id == member_id).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Member with ID {member_id} not found"
            )
        return member

    @staticmethod
    def create_member(db: Session, data: MemberCreate) -> Member:
        # Check email uniqueness (FR-20)
        existing = db.query(Member).filter(Member.email == data.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A member with email '{data.email}' already exists"
            )

        new_member = Member(
            full_name=data.full_name,
            email=data.email.lower(),
            phone=data.phone,
            registration_date=data.registration_date
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)

        # Create or link a member login account so member can browse and see personal history
        # Username defaults to email prefix or member ID
        username = data.email.lower().split("@")[0]
        # Ensure username uniqueness
        base_username = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        member_user = User(
            username=username,
            password_hash=hash_password("Member123!"),
            role="MEMBER",
            member_id=new_member.member_id
        )
        db.add(member_user)
        db.commit()

        return new_member

    @staticmethod
    def update_member(db: Session, member_id: int, data: MemberUpdate) -> Member:
        member = MemberService.get_member_by_id(db, member_id)

        if data.email is not None and data.email.lower() != member.email:
            existing = db.query(Member).filter(Member.email == data.email.lower(), Member.member_id != member_id).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A member with email '{data.email}' already exists"
                )
            member.email = data.email.lower()

        if data.full_name is not None:
            member.full_name = data.full_name
        if data.phone is not None:
            member.phone = data.phone
        if data.registration_date is not None:
            member.registration_date = data.registration_date

        db.commit()
        db.refresh(member)
        return member

    @staticmethod
    def delete_member(db: Session, member_id: int) -> bool:
        member = MemberService.get_member_by_id(db, member_id)

        # Block deletion if active unreturned loans exist (FR-23, Business Rule 11)
        active_loans = db.query(Loan).filter(Loan.member_id == member_id, Loan.returned_at.is_(None)).count()
        if active_loans > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot remove member '{member.full_name}': member currently has {active_loans} active book loan(s). All borrowed books must be returned first."
            )

        # Delete any member login account
        db.query(User).filter(User.member_id == member_id).delete()
        # Delete member's past returned loan records
        db.query(Loan).filter(Loan.member_id == member_id).delete()
        db.delete(member)
        db.commit()
        return True
