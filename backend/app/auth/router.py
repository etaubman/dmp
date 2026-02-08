"""Auth routes: login, logout (no-op for JWT), me."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db_dep
from app.auth.schemas import LoginRequest, TokenResponse, AuthUserOut
from app.auth.local_provider import LocalAuthProvider, create_access_token
from app.auth.deps import get_auth_provider, get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(
    body: LoginRequest,
    db: Session = Depends(get_db_dep),
    provider: LocalAuthProvider = Depends(get_auth_provider),
):
    """Authenticate with email and password; returns JWT."""
    user = provider.verify_credentials(body.email.strip().lower(), body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=AuthUserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return AuthUserOut(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
    )


@router.post("/logout")
def logout():
    """Client should discard the token. JWT is stateless; no server-side invalidation."""
    return {"message": "Logged out"}
