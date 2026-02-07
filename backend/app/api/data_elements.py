"""Critical Data Elements API: list by domain, lineage for an element."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.models import DataElement, Domain, DataQualityRule, DataConcern, Endpoint
from app.schemas.data_element import DataElementOut
from app.schemas.lineage import LineageResponse, LineageNode, LineageEdge

router = APIRouter(prefix="/data-elements", tags=["data-elements"])


def _node_id(prefix: str, pk: int) -> str:
    return f"{prefix}-{pk}"


# More specific route first so /api/data-elements/1/lineage is not matched by list
@router.get("/{data_element_id}/lineage", response_model=LineageResponse)
def get_data_element_lineage(
    data_element_id: int,
    db: Session = Depends(get_db_dep),
):
    """Return 1-hop upstream and downstream lineage for a data element."""
    de = db.query(DataElement).filter(DataElement.id == data_element_id).first()
    if not de:
        raise HTTPException(status_code=404, detail="Data element not found")

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


@router.get("", response_model=list[DataElementOut])
def list_data_elements(
    domain_id: int = Query(..., description="Filter by domain"),
    db: Session = Depends(get_db_dep),
):
    """List all Critical Data Elements for a domain."""
    return (
        db.query(DataElement)
        .filter(DataElement.domain_id == domain_id)
        .order_by(DataElement.name)
        .all()
    )
