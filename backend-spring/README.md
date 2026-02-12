# Data Manager Portal — Spring Backend (Phase 1)

Incremental migration: Spring Boot backend running in parallel with FastAPI. Phase 1 implements `GET /api/domains` only.

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

## Run with Docker

```powershell
docker-compose up -d postgres backend backend-spring
```

- FastAPI: http://localhost:8000 (docs: /docs, /redoc)
- Spring: http://localhost:8081 (docs: /swagger-ui.html)

## Parity tests

Verifies FastAPI and Spring return identical output for `GET /api/domains`:

```powershell
# With both backends running:
pytest backend/tests/test_fastapi_spring_parity.py -v
```

Tests skip automatically if either backend is unreachable.
