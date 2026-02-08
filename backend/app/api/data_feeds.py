"""Data feeds API: list by domain (scope), get by id (detail with elements and controls)."""
from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db_dep
from app.api.domain_scope import domain_ids_for_scope
from app.api.helpers import get_or_404
from app.models import DataFeed, DataFeedDataElement
from app.schemas.data_feed import DataFeedOut, DataFeedDetailOut, DataFeedDataElementRefOut, DataFeedControlOut

router = APIRouter(prefix="/data-feeds", tags=["data-feeds"])


@router.get("", response_model=list[DataFeedOut])
def list_data_feeds(
    domain_id: int = Query(..., description="Filter by domain"),
    scope: Literal["owned", "upstream", "downstream"] = Query("owned", description="Owned by domain, upstream, or downstream"),
    db: Session = Depends(get_db_dep),
):
    """List data feeds for the given domain (and scope)."""
    domain_ids = domain_ids_for_scope(db, domain_id, scope)
    if not domain_ids:
        return []
    rows = (
        db.query(DataFeed)
        .options(
            joinedload(DataFeed.producer_application),
            joinedload(DataFeed.consumer_application),
            joinedload(DataFeed.data_feed_elements),
            joinedload(DataFeed.controls),
        )
        .filter(DataFeed.domain_id.in_(domain_ids))
        .order_by(DataFeed.name)
        .all()
    )
    return [
        DataFeedOut(
            id=f.id,
            domain_id=f.domain_id,
            name=f.name,
            description=f.description,
            source_type=f.source_type,
            format=f.format,
            transmission_method=f.transmission_method,
            producer_application_id=f.producer_application_id,
            consumer_application_id=f.consumer_application_id,
            created_at=f.created_at,
            updated_at=f.updated_at,
            data_element_count=len(f.data_feed_elements),
            control_count=len(f.controls),
            producer_application_name=f.producer_application.name if f.producer_application else None,
            consumer_application_name=f.consumer_application.name if f.consumer_application else None,
        )
        for f in rows
    ]


@router.get("/{data_feed_id}", response_model=DataFeedDetailOut)
def get_data_feed(
    data_feed_id: int,
    db: Session = Depends(get_db_dep),
):
    """Get a single data feed with embedded data elements and controls."""
    feed = (
        db.query(DataFeed)
        .options(
            joinedload(DataFeed.producer_application),
            joinedload(DataFeed.consumer_application),
            joinedload(DataFeed.data_feed_elements).joinedload(DataFeedDataElement.data_element),
            joinedload(DataFeed.controls),
        )
        .filter(DataFeed.id == data_feed_id)
        .first()
    )
    if not feed:
        get_or_404(db, DataFeed, data_feed_id, "Data feed not found")
    # Build element refs from linked DataElement via DataFeedDataElement
    data_elements = [
        DataFeedDataElementRefOut(
            id=link.data_element.id,
            name=link.data_element.name,
            description=link.data_element.description,
        )
        for link in feed.data_feed_elements
    ]
    controls = [
        DataFeedControlOut(
            id=c.id,
            data_feed_id=c.data_feed_id,
            control_type=c.control_type,
            name=c.name,
            description=c.description,
        )
        for c in feed.controls
    ]
    return DataFeedDetailOut(
        id=feed.id,
        domain_id=feed.domain_id,
        name=feed.name,
        description=feed.description,
        source_type=feed.source_type,
        format=feed.format,
        transmission_method=feed.transmission_method,
        producer_application_id=feed.producer_application_id,
        consumer_application_id=feed.consumer_application_id,
        created_at=feed.created_at,
        updated_at=feed.updated_at,
        data_element_count=len(feed.data_feed_elements),
        control_count=len(feed.controls),
        producer_application_name=feed.producer_application.name if feed.producer_application else None,
        consumer_application_name=feed.consumer_application.name if feed.consumer_application else None,
        data_elements=data_elements,
        controls=controls,
    )
