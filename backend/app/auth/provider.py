"""
Auth provider abstraction: verify credentials and resolve user from token.
Implementations: LocalAuthProvider (email/password). SSO can be swapped in later.
"""
from abc import ABC, abstractmethod
from typing import Optional

from app.models import User


class AuthProvider(ABC):
    """Abstract auth: verify credentials and validate tokens. SSO can implement this."""

    @abstractmethod
    def verify_credentials(self, email: str, password: str) -> Optional[User]:
        """Return User if credentials are valid, else None."""

    @abstractmethod
    def get_user_from_token(self, token: str) -> Optional[User]:
        """Return User for a valid token, else None."""
