"""Auth dependencies: get_current_user for protected routes; dev bypass when flag set."""
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db_dep
from app.models import User
from app.auth.local_provider import LocalAuthProvider

security = HTTPBearer(auto_error=False)


def get_auth_provider(db: Session = Depends(get_db_dep)) -> LocalAuthProvider:
    """Current implementation: local provider. Swap for SSO provider when needed."""
    return LocalAuthProvider(db)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db_dep),
    provider: LocalAuthProvider = Depends(get_auth_provider),
) -> User:
    """Resolve current user from Bearer token. If AUTH_DEV_ALWAYS_LOGGED_IN, return dev user without token."""
    settings = get_settings()
    if settings.auth_dev_always_logged_in:
        # Prefer default dev user by email so header shows "Ethan Taubman"
        dev_user = db.query(User).filter(User.email == "ethan.taubman@example.com").first()
        if not dev_user:
            dev_user = db.query(User).filter(User.role == "admin").first()
        if dev_user:
            return dev_user
        # No admin in DB; fall through to require token
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = provider.get_user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
