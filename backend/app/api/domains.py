"""Domains API: list and get by id."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import Domain
from app.schemas.domain import DomainOut

router = APIRouter(prefix="/domains", tags=["domains"])


@router.get("", response_model=list[DomainOut])
def list_domains(db: Session = Depends(get_db_dep)):
    """List all domains (for selector / current domain)."""
    return db.query(Domain).order_by(Domain.name).all()


@router.get("/{domain_id}", response_model=DomainOut)
def get_domain(domain_id: int, db: Session = Depends(get_db_dep)):
    """Get a single domain by id (current domain)."""
    domain = db.query(Domain).filter(Domain.id == domain_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain
