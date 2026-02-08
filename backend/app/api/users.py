"""Users API: list, get, create, update, delete (admin user management)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db_dep
from app.api.helpers import get_or_404
from app.models import User
from app.schemas.user import UserOut, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db_dep)):
    """List all users (for admin user management)."""
    return db.query(User).order_by(User.email).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db_dep)):
    """Get a single user by id."""
    return get_or_404(db, User, user_id, "User not found")


@router.post("", response_model=UserOut, status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db_dep)):
    """Create a new user."""
    email = (body.email or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="A user with this email already exists")
    user = User(
        email=email,
        name=(body.name or "").strip() or None,
        role=(body.role or "").strip() or None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db_dep)):
    """Update a user."""
    user = get_or_404(db, User, user_id, "User not found")

    updates = body.model_dump(exclude_unset=True)
    if "email" in updates and updates["email"] is not None:
        email = (updates["email"] or "").strip().lower()
        if not email:
            raise HTTPException(status_code=400, detail="Email cannot be empty")
        other = db.query(User).filter(User.email == email, User.id != user_id).first()
        if other:
            raise HTTPException(status_code=409, detail="A user with this email already exists")
        user.email = email
    if "name" in updates:
        user.name = (updates["name"] or "").strip() or None
    if "role" in updates:
        user.role = (updates["role"] or "").strip() or None

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db_dep)):
    """Delete a user."""
    user = get_or_404(db, User, user_id, "User not found")
    db.delete(user)
    db.commit()
    return None
