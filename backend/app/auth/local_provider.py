"""Local auth provider: email + password against User table, JWT tokens."""
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import User
from app.auth.provider import AuthProvider

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, email: str) -> str:
    settings = get_settings()
    payload = {"sub": str(user_id), "email": email}
    return jwt.encode(
        payload,
        settings.auth_jwt_secret,
        algorithm=settings.auth_jwt_algorithm,
    )


def decode_token(token: str) -> Optional[dict]:
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.auth_jwt_secret,
            algorithms=[settings.auth_jwt_algorithm],
        )
    except JWTError:
        return None


class LocalAuthProvider(AuthProvider):
    """Email/password against users table; JWT for session."""

    def __init__(self, db: Session):
        self._db = db

    def verify_credentials(self, email: str, password: str) -> Optional[User]:
        email = (email or "").strip().lower()
        if not email or not password:
            return None
        user = self._db.query(User).filter(User.email == email).first()
        if not user or not user.password_hash:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def get_user_from_token(self, token: str) -> Optional[User]:
        payload = decode_token(token)
        if not payload or "sub" not in payload:
            return None
        try:
            user_id = int(payload["sub"])
        except (ValueError, TypeError):
            return None
        user = self._db.query(User).filter(User.id == user_id).first()
        return user
