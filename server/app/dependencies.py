from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.user import User
from server.app.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required for this operation"
        )
    return current_user

def require_member(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "MEMBER" or not current_user.member_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Member access required and user must be linked to a registered member"
        )
    return current_user
