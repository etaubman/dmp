"""Shared API helpers: get by id or 404."""
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
