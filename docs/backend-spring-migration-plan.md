# Backend Migration Plan: FastAPI → Spring Boot (Incremental, Parallel)

Migrate the Data Manager Portal backend from **FastAPI** to **Spring Boot** by migrating **one API endpoint at a time**. Spring and FastAPI run **in parallel**— each migrated endpoint is served by Spring; all others stay on FastAPI. The frontend is updated incrementally to route each migrated call to the Spring backend.

---

## 1. Current State Summary

| Layer | Technology |
|-------|------------|
| **Framework** | FastAPI |
| **ORM** | SQLAlchemy 2.x |
| **DB** | PostgreSQL |
| **Auth** | JWT + bcrypt |
| **Storage** | boto3 (S3/MinIO) |

**API surface:** Routes under `/api` (auth, domain-tree, domains, users, data-elements, applications, eucs, endpoints, data-feeds, data-quality, data-concerns, metrics, bulk). Health: `/health`, `/ready`.

**Frontend:** Uses `environment.apiUrl` (e.g. `http://localhost:8000`) as base; appends `/api` for all calls. Each service (e.g. `DomainsApiService`) calls `${API}/...` where `API = apiUrl + '/api'`.

---

## 2. Target State (End Goal)

| Layer | Technology |
|-------|------------|
| **Framework** | Spring Boot 3.x (Java 17+) |
| **ORM** | Spring Data JPA + Hibernate |
| **DB** | PostgreSQL (shared) |
| **Auth** | Spring Security + JWT |
| **Storage** | AWS SDK v2 (S3) |

Spring and FastAPI coexist until all endpoints are migrated; then FastAPI is retired.

---

## 3. Parallel Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Angular)      │
│  localhost:4200 │
└────────┬────────┘
         │
         │ apiUrl (8000) for FastAPI routes
         │ springApiUrl (8080) for migrated routes
         │
    ┌────┴────┬──────────────────┐
    │         │                  │
    ▼         ▼                  │
┌────────┐ ┌──────────────┐       │
│FastAPI │ │ Spring Boot  │       │
│ :8000  │ │    :8080     │       │
└───┬────┘ └──────┬───────┘       │
    │             │               │
    └─────────────┼───────────────┘
                  │
                  ▼
         ┌────────────────┐
         │   PostgreSQL   │
         │    :5432       │
         └────────────────┘
```

**Alternative (no frontend URL changes):** Add a reverse proxy (nginx, Traefik, or Caddy) on port 8000 that routes `/api/domains` → Spring:8080 and all other `/api/*` → FastAPI:8000. Frontend keeps a single `apiUrl`. Document both options; Phase 1 can use either.

---

## 4. Phase 1: Single Endpoint Proof of Concept

**Goal:** Spring web server in Docker that replaces **one** API call on the frontend and queries the database.

**Scope:**

1. Create Spring Boot project with minimal dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, PostgreSQL driver.
2. Configure Spring to connect to the **existing** PostgreSQL database (same `DATABASE_URL` as FastAPI).
3. Implement **one endpoint** that queries the DB and returns JSON matching the current contract.
4. Run Spring in Docker alongside FastAPI (different port).
5. Update the frontend so that **one call** goes to Spring instead of FastAPI.

**Chosen endpoint for Phase 1:** `GET /api/domains`

| Why this endpoint | Notes |
|------------------|-------|
| Simplest read | Flat list; no recursion or tree-building |
| Uses DB | `SELECT * FROM domains ORDER BY name` |
| Single entity | Domain only; one repository, one DTO |
| Response shape | `[{ id, name, description, parent_id, created_at, updated_at }, ...]` |

---

### Phase 1 Tasks

1. **Create Spring Boot project** (`backend-spring/` or similar)
   - Spring Boot 3.2+, Java 17.
   - Dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `postgresql`.
   - No security, no S3, no seed in Phase 1.

2. **Database config**
   - Use `DATABASE_URL` env var (same as FastAPI). Map to `spring.datasource.url` in `application.yml` (Spring expects `jdbc:postgresql://...`; parse or configure from `DATABASE_URL`).
   - **Read-only from existing schema:** Do not create tables. Existing FastAPI/seed has already created `domains`. JPA entities must match the current schema.

3. **JPA entity and repository**
   - `Domain` entity matching `domains` table (id, name, description, parent_id, created_at, updated_at).
   - `DomainRepository` extending `JpaRepository<Domain, Integer>` with `findAllByOrderByName()` (or equivalent).

4. **Controller and DTO**
   - `GET /api/domains` → returns `List<DomainOut>`.
   - DTO matches current shape: `{ id, name, description, parent_id, created_at, updated_at }`.

5. **CORS**
   - Allow `http://localhost:4200`, `http://127.0.0.1:4200` so the frontend can call Spring directly.

6. **Docker**
   - `Dockerfile` for Spring (multi-stage: build JAR, run with JRE).
   - Add `backend-spring` service to `docker-compose.yml` on port 8080.
   - Use same `DATABASE_URL` as FastAPI (postgres hostname in compose).

7. **Frontend change (Option A: dual URLs)**
   - Add `springApiUrl: 'http://localhost:8080'` to `environment.ts`.
   - In `DomainsApiService.getDomains()`, use `springApiUrl + '/api'` instead of `API` for the domains list call.
   - All other domain calls (`getDomainsTree`, `getDomain`, etc.) still use FastAPI.

8. **Frontend change (Option B: proxy)**
   - Add nginx (or similar) to docker-compose on 8000; route `/api/domains` → Spring:8080, `/api/*` → FastAPI:8000.
   - Set frontend `apiUrl` to proxy (8000). No per-service URL logic; proxy handles routing.

**Deliverable:** Angular app loads; domain list (used for selector/current domain) comes from Spring; everything else from FastAPI. Both backends share the same PostgreSQL.

---

### Phase 1 Success Criteria

- [ ] `docker-compose up` starts Postgres, FastAPI (8000), Spring (8080).
- [ ] `GET http://localhost:8080/api/domains` returns the same JSON shape as FastAPI.
- [ ] Frontend displays domains correctly when calling Spring for that endpoint.
- [ ] No regression on other features (they still hit FastAPI).

---

## 5. Later Phases (Outline)

Each subsequent phase follows the same pattern: pick one more endpoint, implement it in Spring, route the frontend (or proxy) to Spring for that path, verify. Order can be adjusted; auth endpoints are a natural next step before other protected routes.

| Phase | Focus | Notes |
|-------|-------|-------|
| **2** | More domain endpoints | e.g. `GET /api/domain-tree`, `GET /api/domains/{id}` |
| **3** | Auth | Login, `/me`, JWT; Spring Security config |
| **4** | Remaining resource APIs | Users, data-elements, applications, eucs, endpoints, etc. |
| **5** | Bulk + S3 | Upload/download |
| **6** | Seed, migrations | Optional in Spring; or rely on FastAPI seed during parallel phase |
| **7** | Cutover | Retire FastAPI; single Spring backend; remove dual-URL or proxy |

---

## 6. Component Mapping (Reference)

| FastAPI | Spring Boot |
|---------|-------------|
| Router + handler | `@RestController` + `@GetMapping` |
| `get_db_dep()` | `@Transactional` + `JpaRepository` |
| Pydantic schema | DTO (POJO with Jackson) |
| `get_or_404` | `orElseThrow()` → `ResponseStatusException(NOT_FOUND)` |

---

## 7. Suggested Layout (Phase 1)

```
backend-spring/
├── src/main/java/com/dmp/
│   ├── DmpApplication.java
│   ├── config/         # CORS, DataSource from DATABASE_URL
│   ├── controller/
│   │   └── DomainsController.java
│   ├── model/
│   │   └── Domain.java
│   ├── repository/
│   │   └── DomainRepository.java
│   └── dto/
│       └── DomainOut.java
├── src/main/resources/
│   └── application.yml
├── Dockerfile
└── pom.xml (or build.gradle)
```
