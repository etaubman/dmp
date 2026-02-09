"""Critical Data Elements API: list by domain, lineage for an element, SOR."""
from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.api.domain_scope import domain_ids_for_scope
from app.api.helpers import get_or_404
from app.models import DataElement, Domain, DataQualityRule, DataConcern, Endpoint, DataElementSOR, Application
from app.schemas.data_element import DataElementOut
from app.schemas.data_element_sor import DataElementSOROut, DataElementSORSummaryOut
from app.schemas.data_quality import LineageApplicationOut
from app.schemas.lineage import LineageResponse, LineageNode, LineageEdge

router = APIRouter(prefix="/data-elements", tags=["data-elements"])


def _node_id(prefix: str, pk: int) -> str:
    return f"{prefix}-{pk}"


@router.get("/sor", response_model=list[DataElementSORSummaryOut])
def list_data_element_sor_by_domain(
    domain_id: int = Query(..., description="Filter by domain"),
    scope: Literal["owned", "upstream", "downstream"] = Query("owned", description="Scope for data elements"),
    db: Session = Depends(get_db_dep),
):
    """List all SOR records for data elements in the given domain (and scope). Used for grid counts and panel."""
    domain_ids = domain_ids_for_scope(db, domain_id, scope)
    if not domain_ids:
        return []
    rows = (
        db.query(DataElementSOR, Application.name.label("application_name"))
        .join(Application, DataElementSOR.application_id == Application.id)
        .join(DataElement, DataElementSOR.data_element_id == DataElement.id)
        .filter(DataElement.domain_id.in_(domain_ids))
        .order_by(DataElementSOR.data_element_id, Application.name)
        .all()
    )
    return [
        DataElementSORSummaryOut(
            data_element_id=sor.data_element_id,
            application_id=sor.application_id,
            application_name=app_name,
            physical_data_attribute=sor.physical_data_attribute,
        )
        for sor, app_name in rows
    ]


@router.get("/{data_element_id}/lineage-applications", response_model=list[LineageApplicationOut])
def get_data_element_lineage_applications(
    data_element_id: int,
    db: Session = Depends(get_db_dep),
):
    """Return applications in the lineage path for this data element (from SOR and from endpoints of rules)."""
    get_or_404(db, DataElement, data_element_id, "Data element not found")
    seen: set[tuple[int, str]] = set()
    out: list[LineageApplicationOut] = []
    # From SOR
    sors = (
        db.query(DataElementSOR, Application.name)
        .join(Application, DataElementSOR.application_id == Application.id)
        .filter(DataElementSOR.data_element_id == data_element_id)
        .all()
    )
    for sor, app_name in sors:
        key = (sor.application_id, "sor")
        if key not in seen:
            seen.add(key)
            out.append(
                LineageApplicationOut(
                    application_id=sor.application_id,
                    application_name=app_name,
                    source="sor",
                )
            )
    # From endpoints of rules that reference this element
    rules = (
        db.query(DataQualityRule, Endpoint, Application.name)
        .join(Endpoint, DataQualityRule.endpoint_id == Endpoint.id)
        .join(Application, Endpoint.application_id == Application.id)
        .filter(DataQualityRule.data_element_id == data_element_id)
        .all()
    )
    for rule, ep, app_name in rules:
        app_id = ep.application_id
        if app_id is None:
            continue
        key = (app_id, "endpoint")
        if key not in seen:
            seen.add(key)
            out.append(
                LineageApplicationOut(
                    application_id=app_id,
                    application_name=app_name,
                    source="endpoint",
                )
            )
    return out


# More specific route first so /api/data-elements/1/lineage is not matched by list
@router.get("/{data_element_id}/lineage", response_model=LineageResponse)
def get_data_element_lineage(
    data_element_id: int,
    db: Session = Depends(get_db_dep),
):
    """Return 1-hop upstream and downstream lineage for a data element."""
    de = get_or_404(db, DataElement, data_element_id, "Data element not found")

    nodes: list[LineageNode] = []
    edges: list[LineageEdge] = []
    center_id = _node_id("de", de.id)

    # Center node: data element
    nodes.append(
        LineageNode(
            id=center_id,
            type="data_element",
            label=de.name,
            data={
                "id": de.id,
                "name": de.name,
                "description": de.description,
                "element_type": de.element_type,
                "domain_id": de.domain_id,
            },
        )
    )

    # Upstream 1-hop: domain
    domain = db.query(Domain).filter(Domain.id == de.domain_id).first()
    if domain:
        domain_id = _node_id("domain", domain.id)
        nodes.append(
            LineageNode(
                id=domain_id,
                type="domain",
                label=domain.name,
                data={
                    "id": domain.id,
                    "name": domain.name,
                    "description": domain.description,
                    "parent_id": domain.parent_id,
                },
            )
        )
        edges.append(
            LineageEdge(id=f"e-domain-{domain.id}-de-{de.id}", source=domain_id, target=center_id, type="upstream")
        )

    # Downstream 1-hop: DQ rules that reference this element
    rules = (
        db.query(DataQualityRule)
        .filter(DataQualityRule.data_element_id == data_element_id)
        .order_by(DataQualityRule.name)
        .all()
    )
    for r in rules:
        rule_id = _node_id("rule", r.id)
        nodes.append(
            LineageNode(
                id=rule_id,
                type="dq_rule",
                label=r.name,
                data={
                    "id": r.id,
                    "name": r.name,
                    "description": r.description,
                    "rule_type": r.rule_type,
                    "data_element_id": r.data_element_id,
                    "endpoint_id": r.endpoint_id,
                },
            )
        )
        edges.append(
            LineageEdge(id=f"e-de-{de.id}-rule-{r.id}", source=center_id, target=rule_id, type="downstream")
        )
        # Rule -> Endpoint if present
        if r.endpoint_id:
            ep = db.query(Endpoint).filter(Endpoint.id == r.endpoint_id).first()
            if ep:
                ep_id = _node_id("endpoint", ep.id)
                if not any(n.id == ep_id for n in nodes):
                    nodes.append(
                        LineageNode(
                            id=ep_id,
                            type="endpoint",
                            label=ep.name,
                            data={
                                "id": ep.id,
                                "name": ep.name,
                                "description": ep.description,
                                "domain_id": ep.domain_id,
                                "application_id": ep.application_id,
                            },
                        )
                    )
                edges.append(
                    LineageEdge(id=f"e-rule-{r.id}-endpoint-{ep.id}", source=rule_id, target=ep_id, type="downstream")
                )

    # Downstream 1-hop: Data concerns that reference this element
    concerns = (
        db.query(DataConcern)
        .filter(DataConcern.data_element_id == data_element_id)
        .order_by(DataConcern.title)
        .all()
    )
    for c in concerns:
        concern_id = _node_id("concern", c.id)
        nodes.append(
            LineageNode(
                id=concern_id,
                type="data_concern",
                label=c.title,
                data={
                    "id": c.id,
                    "title": c.title,
                    "description": c.description,
                    "status": c.status,
                    "domain_id": c.domain_id,
                    "application_id": c.application_id,
                    "euc_id": c.euc_id,
                    "endpoint_id": c.endpoint_id,
                    "data_element_id": c.data_element_id,
                },
            )
        )
        edges.append(
            LineageEdge(id=f"e-de-{de.id}-concern-{c.id}", source=center_id, target=concern_id, type="downstream")
        )

    return LineageResponse(nodes=nodes, edges=edges)


@router.get("/{data_element_id}/sor", response_model=list[DataElementSOROut])
def get_data_element_sor(
    data_element_id: int,
    db: Session = Depends(get_db_dep),
):
    """Return systems of record for a data element: applications and physical data attribute names."""
    get_or_404(db, DataElement, data_element_id, "Data element not found")
    rows = (
        db.query(DataElementSOR, Application.name.label("application_name"))
        .join(Application, DataElementSOR.application_id == Application.id)
        .filter(DataElementSOR.data_element_id == data_element_id)
        .order_by(Application.name)
        .all()
    )
    return [
        DataElementSOROut(
            application_id=sor.application_id,
            application_name=app_name,
            physical_data_attribute=sor.physical_data_attribute,
        )
        for sor, app_name in rows
    ]


@router.get("", response_model=list[DataElementOut])
def list_data_elements(
    domain_id: int = Query(..., description="Filter by domain"),
    scope: Literal["owned", "upstream", "downstream"] = Query("owned", description="Owned by domain, upstream of domain, or downstream of domain"),
    db: Session = Depends(get_db_dep),
):
    """List Critical Data Elements: owned by domain, or in upstream/downstream domains."""
    domain_ids = domain_ids_for_scope(db, domain_id, scope)
    if not domain_ids:
        return []
    return (
        db.query(DataElement)
        .filter(DataElement.domain_id.in_(domain_ids))
        .order_by(DataElement.name)
        .all()
    )
