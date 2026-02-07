"""Lineage graph for a data element: 1-hop upstream and downstream."""
from pydantic import BaseModel
from typing import Optional, Any


class LineageNode(BaseModel):
    id: str
    type: str  # domain, data_element, dq_rule, data_concern, endpoint
    label: str
    data: dict[str, Any] = {}  # entity fields for details panel


class LineageEdge(BaseModel):
    id: str
    source: str
    target: str
    type: Optional[str] = None  # upstream, downstream, etc.
    data: dict[str, Any] = {}


class LineageResponse(BaseModel):
    nodes: list[LineageNode]
    edges: list[LineageEdge]
