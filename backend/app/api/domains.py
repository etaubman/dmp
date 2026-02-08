"""Domains API: list, get, tree, create, update, delete (L0–L3 hierarchy)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db_dep
from app.api.helpers import get_or_404
from app.models import Domain
from app.schemas.domain import DomainOut, DomainTreeOut, DomainCreate, DomainUpdate

router = APIRouter(prefix="/domains", tags=["domains"])

# Separate router for GET /api/domain-tree so path is not matched by GET /api/domains/{domain_id}
domain_tree_router = APIRouter(tags=["domains"])

MAX_DEPTH = 4  # L0 (0) through L3 (3)


def _depth_of(domain_id: int, db: Session) -> int:
    """Return depth of domain (0 = root). Assumes domain exists."""
    depth = 0
    row = db.get(Domain, domain_id)
    while row and row.parent_id is not None:
        depth += 1
        row = db.get(Domain, row.parent_id)
    return depth


def _descendant_ids(domain_id: int, db: Session) -> set[int]:
    """Return set of all descendant domain ids (children, grandchildren, ...)."""
    result = set()
    stack = [domain_id]
    while stack:
        pid = stack.pop()
        for row in db.query(Domain.id).filter(Domain.parent_id == pid).all():
            result.add(row.id)
            stack.append(row.id)
    return result


def _domain_to_tree_node(d: Domain, level: int) -> DomainTreeOut:
    """Build tree node from domain; children must be set by caller."""
    return DomainTreeOut(
        id=d.id,
        name=d.name,
        description=d.description,
        parent_id=d.parent_id,
        level=level,
        children=[_domain_to_tree_node(c, level + 1) for c in sorted(d.children, key=lambda x: x.name)],
    )


def get_domains_tree_list(db: Session) -> list[DomainTreeOut]:
    """Return domain hierarchy as a tree (L0→L1→L2→L3). Used by GET /api/domain-tree."""
    roots = db.query(Domain).filter(Domain.parent_id.is_(None)).order_by(Domain.name).all()
    return [_domain_to_tree_node(r, 0) for r in roots]


@domain_tree_router.get("/domain-tree", response_model=list[DomainTreeOut])
def api_domain_tree(db: Session = Depends(get_db_dep)):
    """Return domain hierarchy as a tree (L0→L1→L2→L3)."""
    return get_domains_tree_list(db)


@router.get("", response_model=list[DomainOut])
def list_domains(db: Session = Depends(get_db_dep)):
    """List all domains (for selector / current domain)."""
    return db.query(Domain).order_by(Domain.name).all()


@router.get("/{domain_id}", response_model=DomainOut)
def get_domain(domain_id: int, db: Session = Depends(get_db_dep)):
    """Get a single domain by id (current domain)."""
    return get_or_404(db, Domain, domain_id, "Domain not found")


@router.post("", response_model=DomainOut, status_code=201)
def create_domain(body: DomainCreate, db: Session = Depends(get_db_dep)):
    """Create a new domain. parent_id optional (null = L0). Enforces max depth L0–L3."""
    if body.parent_id is not None:
        parent = db.query(Domain).filter(Domain.id == body.parent_id).first()
        if not parent:
            raise HTTPException(status_code=400, detail="Parent domain not found")
        depth = _depth_of(body.parent_id, db)
        if depth >= MAX_DEPTH - 1:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum hierarchy depth is {MAX_DEPTH} (L0–L3). Cannot add a child here.",
            )
    domain = Domain(
        name=body.name.strip(),
        description=body.description.strip() if body.description else None,
        parent_id=body.parent_id,
    )
    db.add(domain)
    db.commit()
    db.refresh(domain)
    return domain


@router.patch("/{domain_id}", response_model=DomainOut)
def update_domain(domain_id: int, body: DomainUpdate, db: Session = Depends(get_db_dep)):
    """Update a domain. Validates no circular parent and max depth L0–L3."""
    domain = get_or_404(db, Domain, domain_id, "Domain not found")

    updates = body.model_dump(exclude_unset=True)
    if "name" in updates:
        domain.name = (updates["name"] or "").strip()
    if "description" in updates:
        domain.description = (updates["description"] or "").strip() or None

    if "parent_id" in updates:
        new_parent_id = updates["parent_id"]
        if new_parent_id == domain_id:
            raise HTTPException(status_code=400, detail="Domain cannot be its own parent")
        if new_parent_id is not None and new_parent_id < 1:
            raise HTTPException(status_code=400, detail="Invalid parent_id")
        if new_parent_id is not None:
            descendants = _descendant_ids(domain_id, db)
            if new_parent_id in descendants:
                raise HTTPException(status_code=400, detail="Circular parent: cannot move under a descendant")
            parent = db.query(Domain).filter(Domain.id == new_parent_id).first()
            if not parent:
                raise HTTPException(status_code=400, detail="Parent domain not found")
            new_depth = _depth_of(new_parent_id, db) + 1
            current_subtree_depth = 0
            stack = [(domain_id, 0)]
            while stack:
                nid, d = stack.pop()
                current_subtree_depth = max(current_subtree_depth, d)
                for row in db.query(Domain.id).filter(Domain.parent_id == nid).all():
                    stack.append((row.id, d + 1))
            if new_depth + current_subtree_depth >= MAX_DEPTH:
                raise HTTPException(
                    status_code=400,
                    detail=f"Maximum hierarchy depth is {MAX_DEPTH} (L0–L3). Moving here would exceed it.",
                )
        domain.parent_id = new_parent_id

    db.commit()
    db.refresh(domain)
    return domain


@router.delete("/{domain_id}", status_code=204)
def delete_domain(domain_id: int, db: Session = Depends(get_db_dep)):
    """Delete a domain only if it has no children and no related data. Otherwise 409."""
    domain = get_or_404(db, Domain, domain_id, "Domain not found")

    if domain.children:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete domain that has child domains. Remove or move children first.",
        )
    if domain.data_elements or domain.applications or domain.eucs or domain.endpoints or domain.data_quality_rules or domain.data_concerns or domain.data_feeds:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete domain that has related data (data elements, applications, EUCs, endpoints, data feeds, DQ rules, or data concerns). Remove or reassign them first.",
        )

    db.delete(domain)
    db.commit()
    return None
