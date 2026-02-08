"""
Authentication: login, session, and optional SSO swap.
Uses an AuthProvider abstraction so local (email/password) can be replaced with SSO later.
"""
from app.auth.router import router

__all__ = ["router"]
