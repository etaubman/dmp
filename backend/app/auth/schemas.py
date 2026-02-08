"""Auth request/response schemas."""
from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthUserOut(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True
