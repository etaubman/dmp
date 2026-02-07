"""
Bulk upload and download: CSV per entity type; store uploads in S3, stream download.
"""
import csv
import io
from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db_dep
from app.config import get_settings
from app.s3_client import upload_file_to_s3, generate_upload_key

from app.models import (
    Domain,
    DataElement,
    Application,
    EUC,
    Endpoint,
    DataQualityRule,
    DataQualityException,
    DataConcern,
)

router = APIRouter(prefix="/bulk", tags=["bulk"])

# Entity type -> (model, required columns for create, optional columns)
BULK_SCHEMAS = {
    "domains": (Domain, ["name"], ["description", "parent_id"]),
    "data_elements": (DataElement, ["domain_id", "name"], ["description", "element_type"]),
    "applications": (Application, ["domain_id", "name"], ["description"]),
    "eucs": (EUC, ["domain_id", "name"], ["description", "euc_type"]),
    "endpoints": (Endpoint, ["name"], ["domain_id", "application_id", "description"]),
    "data_quality_rules": (DataQualityRule, ["name"], ["domain_id", "data_element_id", "endpoint_id", "description", "rule_type"]),
    "data_quality_exceptions": (DataQualityException, ["rule_id"], ["data_element_id", "description", "status"]),
    "data_concerns": (DataConcern, ["domain_id", "title"], ["application_id", "euc_id", "endpoint_id", "data_element_id", "description", "status"]),
}


def _parse_row(row: dict, required: list[str], optional: list[str]) -> dict:
    """Convert CSV row to kwargs; coerce types for known fields."""
    out = {}
    for k in required + optional:
        v = row.get(k)
        if k in required and (v is None or (isinstance(v, str) and not v.strip())):
            raise ValueError(f"Missing required: {k}")
        if v is None or v == "":
            continue
        if isinstance(v, str):
            v = v.strip()
        # Integer fields
        if k in ("id", "domain_id", "parent_id", "application_id", "euc_id", "endpoint_id", "data_element_id", "rule_id"):
            try:
                v = int(v)
            except (ValueError, TypeError):
                raise ValueError(f"Invalid integer for {k}: {v}")
        out[k] = v
    return out


@router.post("/upload")
def bulk_upload(
    entity_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db_dep),
):
    """
    Upload a CSV for the given entity type. File is stored in S3; rows are upserted.
    entity_type: one of domains, data_elements, applications, eucs, endpoints, data_quality_rules, data_quality_exceptions, data_concerns.
    CSV must have a header row; columns depend on entity type (see /docs).
    """
    if entity_type not in BULK_SCHEMAS:
        raise HTTPException(status_code=400, detail=f"Unknown entity_type: {entity_type}")
    model, required, optional = BULK_SCHEMAS[entity_type]

    content = file.file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("utf-8-skip")

    # Store raw file in S3
    settings = get_settings()
    if not settings.s3_use_local:
        try:
            key = generate_upload_key(entity_type, file.filename or "upload.csv")
            upload_file_to_s3(
                settings.s3_bucket_uploads,
                key,
                io.BytesIO(content),
                content_type=file.content_type or "text/csv",
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"S3 upload failed: {e}")

    reader = csv.DictReader(io.StringIO(text))
    created = 0
    updated = 0
    errors = []

    for i, row in enumerate(reader):
        row_num = i + 2  # 1-based + header
        try:
            kwargs = _parse_row(row, required, optional)
        except ValueError as e:
            errors.append({"row": row_num, "error": str(e)})
            continue

        # Upsert: if "id" in row and exists, update; else create
        if "id" in kwargs and kwargs["id"]:
            existing = db.query(model).filter(model.id == kwargs["id"]).first()
            if existing:
                for k, v in kwargs.items():
                    if k != "id" and hasattr(existing, k):
                        setattr(existing, k, v)
                updated += 1
                continue
            del kwargs["id"]

        try:
            db.add(model(**kwargs))
            created += 1
        except Exception as e:
            errors.append({"row": row_num, "error": str(e)})

    # Commit is done by get_db_dep after this handler returns
    return {"created": created, "updated": updated, "errors": errors}


@router.get("/download")
def bulk_download(
    entity_type: str = Query(...),
    domain_id: int | None = Query(None),
    db: Session = Depends(get_db_dep),
):
    """
    Download entities as CSV. Optional domain_id to filter by domain where applicable.
    entity_type: one of domains, data_elements, applications, eucs, endpoints, data_quality_rules, data_quality_exceptions, data_concerns.
    """
    if entity_type not in BULK_SCHEMAS:
        raise HTTPException(status_code=400, detail=f"Unknown entity_type: {entity_type}")
    model, required, optional = BULK_SCHEMAS[entity_type]

    q = db.query(model)
    if domain_id is not None and hasattr(model, "domain_id"):
        q = q.filter(model.domain_id == domain_id)
    rows = q.all()

    # Column names from model
    cols = ["id"] + [c.key for c in model.__table__.columns if c.key != "id"]
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=cols, extrasaction="ignore")
    writer.writeheader()
    for r in rows:
        d = {"id": r.id}
        for c in model.__table__.columns:
            if c.key != "id":
                d[c.key] = getattr(r, c.key)
        writer.writerow(d)

    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={entity_type}.csv"},
    )
