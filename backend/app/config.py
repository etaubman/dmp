"""
Application configuration from environment variables.
Used by database, S3 client, and app startup.
"""
import os
from functools import lru_cache


@lru_cache
def get_settings():
    """Return settings object; cached so env is read once."""
    return Settings()


class Settings:
    """Settings loaded from environment (or .env file via os.environ)."""

    # Database
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://dmp:dmp_secret@localhost:5432/dmp",
    )

    # S3 (MinIO or real AWS)
    s3_endpoint_url: str = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
    s3_access_key: str = os.getenv("S3_ACCESS_KEY", "minioadmin")
    s3_secret_key: str = os.getenv("S3_SECRET_KEY", "minioadmin")
    s3_bucket_uploads: str = os.getenv("S3_BUCKET_UPLOADS", "bulk-uploads")
    s3_bucket_exports: str = os.getenv("S3_BUCKET_EXPORTS", "exports")

    # Optional: use in-memory or local path for tests (no S3)
    s3_use_local: bool = os.getenv("S3_USE_LOCAL", "").lower() in ("1", "true", "yes")

    # Auth: JWT secret (change in production); dev bypass avoids login during local dev
    auth_jwt_secret: str = os.getenv("AUTH_JWT_SECRET", "dev-secret-change-in-production")
    auth_jwt_algorithm: str = os.getenv("AUTH_JWT_ALGORITHM", "HS256")
    auth_jwt_expire_minutes: int = int(os.getenv("AUTH_JWT_EXPIRE_MINUTES", "60"))
    # When True, unauthenticated requests are treated as a dev user (first admin). See README.
    auth_dev_always_logged_in: bool = os.getenv("AUTH_DEV_ALWAYS_LOGGED_IN", "").lower() in ("1", "true", "yes")
