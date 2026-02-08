"""
Shared API helpers: get by id or 404, optional query parsing.
Use get_or_404 in route handlers for consistent 404 semantics; use parse_* for query params where useful.
"""
from typing import TypeVar

from fastapi import HTTPException
from sqlalchemy.orm import Session

T = TypeVar("T")


def get_or_404(db: Session, model: type[T], pk: int, detail: str = "Not found") -> T:
    """Query model by id; raise 404 if not found. Model must have .id attribute."""
    obj = db.query(model).filter(model.id == pk).first()
    if not obj:
        raise HTTPException(status_code=404, detail=detail)
    return obj


def parse_optional_int(value: str | None) -> int | None:
    """Parse optional query string to int; return None for None or empty string."""
    if value is None or (isinstance(value, str) and value.strip() == ""):
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None
