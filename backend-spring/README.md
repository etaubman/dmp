# Data Manager Portal — Spring Backend

Spring Boot backend with full API parity to FastAPI. The frontend can switch between backends via `npm run start` (FastAPI) or `npm run start:spring` (Spring). See [frontend/README.md](../frontend/README.md) for switching.

## Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL (same DB as FastAPI; typically via docker-compose)

## Run locally

```powershell
# Set DB connection (or use defaults in application.yml)
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/dmp"
$env:SPRING_DATASOURCE_USERNAME = "dmp"
$env:SPRING_DATASOURCE_PASSWORD = "dmp_secret"

mvn spring-boot:run
```

App runs on port 8081. Test: `GET http://localhost:8081/api/domains`

**API docs** (when running):
- Swagger UI: http://localhost:8081/swagger-ui.html

## Run with frontend

1. Start Postgres (e.g. `.\start-postgres-only.ps1` from repo root).
2. Run Spring: `mvn spring-boot:run` from `backend-spring/`.
3. Run frontend: `cd frontend && npm run start:spring` (targets Spring at port 8081).

## Run with Docker

```powershell
docker-compose up -d postgres backend backend-spring
```

- FastAPI: http://localhost:8000 (docs: /docs, /redoc)
- Spring: http://localhost:8081 (docs: /swagger-ui.html)

## Parity tests

Verifies FastAPI and Spring return identical output for all migrated endpoints:

```powershell
# With both backends running:
pytest backend/tests/test_fastapi_spring_parity.py -v
```

Tests skip automatically if either backend is unreachable.
