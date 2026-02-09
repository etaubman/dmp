"""Shared domain-scope resolution: owned, upstream, downstream. Used by domain-scoped list APIs."""
from sqlalchemy.orm import Session

from app.models import Domain


def domain_ids_for_scope(db: Session, domain_id: int, scope: str) -> list[int]:
    """Resolve domain IDs to filter by: owned (this domain), upstream (parent), downstream (children)."""
    if scope == "owned":
        return [domain_id]
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        return []
    if scope == "upstream":
        return [domain.parent_id] if domain.parent_id else []
    if scope == "downstream":
        return [row[0] for row in db.query(Domain.id).filter(Domain.parent_id == domain_id).all()]
    return [domain_id]
