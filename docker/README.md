# Docker helpers

- **postgres/** — Optional init scripts. Any `.sql` or `.sh` files here can be mounted into the Postgres container at `/docker-entrypoint-initdb.d/` to run on first start (when the data volume is empty). Phase 1 uses env vars only; schema and seed are added in Phase 2.
- S3 buckets `bulk-uploads` and `exports` are created automatically by the `s3-init` service in `docker-compose.yml` on first run.
