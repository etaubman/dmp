"""
S3-compatible storage client (MinIO or AWS).
Used for storing bulk uploads and export files.
"""
import io
from typing import BinaryIO, Optional
from datetime import datetime

from app.config import get_settings


def _get_client():
    """Lazy boto3 client; only created when S3 is actually used."""
    import boto3
    from botocore.config import Config

    settings = get_settings()
    if settings.s3_use_local:
        return None  # Caller can check and skip or use local FS
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def upload_file_to_s3(
    bucket: str,
    key: str,
    body: BinaryIO,
    content_type: Optional[str] = None,
) -> str:
    """
    Upload a file to S3. Returns the key (path) of the uploaded object.
    """
    client = _get_client()
    if client is None:
        raise RuntimeError("S3 not configured (S3_USE_LOCAL is set)")
    settings = get_settings()
    actual_bucket = bucket or settings.s3_bucket_uploads
    extra = {}
    if content_type:
        extra["ContentType"] = content_type
    client.upload_fileobj(body, actual_bucket, key, ExtraArgs=extra)
    return key


def download_file_from_s3(bucket: str, key: str) -> bytes:
    """Download object from S3 and return bytes."""
    client = _get_client()
    if client is None:
        raise RuntimeError("S3 not configured")
    buf = io.BytesIO()
    client.download_fileobj(bucket, key, buf)
    return buf.getvalue()


def generate_upload_key(entity_type: str, filename: str) -> str:
    """Generate a unique S3 key for an upload (e.g. bulk-uploads/cdes/2025-02-07/abc.csv)."""
    date_prefix = datetime.utcnow().strftime("%Y-%m-%d")
    safe_name = filename.replace(" ", "_")
    return f"{entity_type}/{date_prefix}/{safe_name}"
