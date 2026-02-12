# FastAPI → Spring Boot: Phased Migration Checklist

Complete checklist to replicate all routes and functionality from the FastAPI backend. Migrate one phase at a time; run parity tests after each; route frontend incrementally (or use proxy).

---

## Phase Overview

| Phase | Focus | Endpoints | Dependencies |
|-------|-------|-----------|--------------|
| 1 | Domains (list) | 1 | — |
| 2 | Domains (full CRUD + tree) | 5 | Phase 1 |
| 3 | Auth | 3 | — |
| 4 | Simple domain-scoped lists | 3 | domain_scope |
| 5 | Users (CRUD) | 5 | Phase 3 (optional) |
| 6 | Data elements | 5 | domain_scope |
| 7 | Data concerns | 1 | — |
| 8 | Data feeds | 2 | domain_scope |
| 9 | Data quality | 19 | domain_scope, sqlparse |
| 10 | Metrics | 1 | — |
| 11 | Bulk (S3) | 2 | AWS SDK |
| 12 | Infrastructure | 4 | — |

---

## Phase 1: Domains (list) — ✅ DONE

- [x] `GET /api/domains` — list all, ordered by name
- [x] `Domain` entity, `DomainRepository`, `DomainOut` DTO
- [x] Docker, parity tests

---

## Phase 2: Domains (full CRUD + tree) — ✅ DONE

**Shared dependency:** `domain_scope` service (owned / upstream / downstream).

| # | Method | Path | Notes |
|---|--------|------|-------|
| 1 | GET | `/api/domain-tree` | Recursive tree L0→L3; `DomainTreeOut` |
| 2 | GET | `/api/domains/{id}` | Single domain |
| 3 | POST | `/api/domains` | Create; max depth L0–L3; 201 |
| 4 | PATCH | `/api/domains/{id}` | Update; no circular parent |
| 5 | DELETE | `/api/domains/{id}` | 409 if children or related data |

**Checklist:**

- [x] `DomainTreeOut` DTO (id, name, description, parent_id, level, children)
- [x] `GET /api/domain-tree` — roots = parent_id null; recursive children by name
- [x] `GET /api/domains/{id}` — 404 if not found
- [x] `DomainCreate`, `DomainUpdate` request DTOs
- [x] `POST /api/domains` — validate parent exists, depth L0–L3
- [x] `PATCH /api/domains/{id}` — validate no circular parent, depth
- [x] `DELETE /api/domains/{id}` — 409 if has children, data_elements, applications, eucs, endpoints, data_feeds, dq_rules, data_concerns
- [x] Parity tests for domain-tree, get, create, update, delete (test_get_domain, test_create_domain, test_update_domain, test_delete_domain, test_domain_tree)

---

## Phase 3: Auth — ✅ DONE

| # | Method | Path | Notes |
|---|--------|------|-------|
| 1 | POST | `/api/auth/login` | email, password → `{ access_token }` |
| 2 | GET | `/api/auth/me` | Bearer required → `AuthUserOut` |
| 3 | POST | `/api/auth/logout` | No-op; `{ message }` |

**Checklist:**

- [x] `spring-boot-starter-security` dependency
- [x] `User` entity (id, email, name, role, password_hash, created_at, updated_at)
- [x] BCrypt password verification
- [x] JWT library (jjwt)
- [x] `TokenService` — create token (sub=user_id, email, expiry)
- [x] `JwtAuthenticationFilter` — read Bearer, validate, load User, set SecurityContext
- [x] `AuthController` — login, me, logout
- [x] Security config: permit `/api/auth/login`, `/health`, `/ready`, `/swagger-ui/**`, `/v3/api-docs`; authenticate `/api/auth/me`
- [x] `AUTH_DEV_ALWAYS_LOGGED_IN` — bypass JWT, set default user
- [x] Parity tests: login, /me (with shared token), logout

---

## Parity Tests (Phases 1–3)

All 11 tests in `backend/tests/test_fastapi_spring_parity.py` pass:
- `test_domains_parity_count`, `test_domains_parity_content`, `test_domains_parity_order`
- `test_domain_tree_parity`
- `test_auth_login_parity`, `test_auth_me_parity`, `test_logout_parity`
- `test_get_domain_parity`, `test_create_domain_parity`, `test_update_domain_parity`, `test_delete_domain_parity`

Run: `pytest backend/tests/test_fastapi_spring_parity.py -v` (requires both backends up).

---

## Phase 4: Simple domain-scoped lists

**Shared:** `domain_ids_for_scope(domain_id, scope)` — owned / upstream / downstream.

| # | Method | Path | Query params | Notes |
|---|--------|------|--------------|-------|
| 1 | GET | `/api/applications` | domain_id, scope | List by domain scope |
| 2 | GET | `/api/eucs` | domain_id, scope | List by domain scope |
| 3 | GET | `/api/endpoints` | domain_id?, application_id?, scope | Optional filters |

**Checklist:**

- [ ] `Application`, `EUC`, `Endpoint` entities
- [ ] `ApplicationRepository`, `EUCRepository`, `EndpointRepository`
- [ ] `ApplicationOut`, `EUCOut`, `EndpointOut` DTOs
- [ ] `DomainScopeService` — domain_ids_for_scope logic
- [ ] `GET /api/applications` — domain_id required, scope default owned
- [ ] `GET /api/eucs` — same
- [ ] `GET /api/endpoints` — domain_id optional, application_id optional
- [ ] Parity tests

---

## Phase 5: Users (CRUD)

| # | Method | Path | Notes |
|---|--------|------|-------|
| 1 | GET | `/api/users` | List all, ordered by email |
| 2 | GET | `/api/users/{id}` | 404 if not found |
| 3 | POST | `/api/users` | Create; 409 if email exists; 201 |
| 4 | PATCH | `/api/users/{id}` | Update; 409 if email taken |
| 5 | DELETE | `/api/users/{id}` | 204 |

**Checklist:**

- [ ] `UserOut`, `UserCreate`, `UserUpdate` DTOs
- [ ] `UserRepository`
- [ ] `UsersController` — full CRUD
- [ ] Validate email required, unique on create/update
- [ ] Parity tests

---

## Phase 6: Data elements

| # | Method | Path | Query params | Notes |
|---|--------|------|--------------|-------|
| 1 | GET | `/api/data-elements` | domain_id, scope | List by scope |
| 2 | GET | `/api/data-elements/sor` | domain_id, scope | SOR summary by domain |
| 3 | GET | `/api/data-elements/{id}/lineage` | — | Lineage graph (nodes, edges) |
| 4 | GET | `/api/data-elements/{id}/lineage-applications` | — | Applications in lineage |
| 5 | GET | `/api/data-elements/{id}/sor` | — | SOR for single element |

**Checklist:**

- [ ] `DataElement`, `DataElementSOR` entities
- [ ] `DataElementOut`, `DataElementSORSummaryOut`, `DataElementSOROut` DTOs
- [ ] `LineageResponse`, `LineageNode`, `LineageEdge`, `LineageApplicationOut` DTOs
- [ ] `GET /api/data-elements` — domain scope
- [ ] `GET /api/data-elements/sor` — join SOR + Application, filter by domain scope
- [ ] `GET /api/data-elements/{id}/lineage` — build graph from SOR + DQ rules/endpoints
- [ ] `GET /api/data-elements/{id}/lineage-applications` — dedupe from SOR and endpoints
- [ ] `GET /api/data-elements/{id}/sor` — list SOR for element
- [ ] Parity tests

---

## Phase 7: Data concerns

| # | Method | Path | Query params | Notes |
|---|--------|------|--------------|-------|
| 1 | GET | `/api/data-concerns` | domain_id, application_id?, euc_id?, endpoint_id?, data_element_id? | List with optional filters |

**Checklist:**

- [ ] `DataConcern` entity
- [ ] `DataConcernOut` DTO
- [ ] `GET /api/data-concerns` — domain_id required; optional filters
- [ ] Parity test

---

## Phase 8: Data feeds

| # | Method | Path | Query params | Notes |
|---|--------|------|--------------|-------|
| 1 | GET | `/api/data-feeds` | domain_id, scope | List; include element_count, control_count, app names |
| 2 | GET | `/api/data-feeds/{id}` | — | Detail with data_elements, controls |

**Checklist:**

- [ ] `DataFeed`, `DataFeedDataElement`, `DataFeedControl` entities
- [ ] `DataFeedOut`, `DataFeedDetailOut`, `DataFeedDataElementRefOut`, `DataFeedControlOut` DTOs
- [ ] `GET /api/data-feeds` — joined load producer/consumer, counts
- [ ] `GET /api/data-feeds/{id}` — full detail with embedded elements and controls
- [ ] Parity tests

---

## Phase 9: Data quality

| # | Method | Path | Notes |
|---|--------|------|-------|
| 1 | GET | `/api/data-quality-rules` | List; filter domain_id, data_element_id, endpoint_id |
| 2 | GET | `/api/data-quality-rules/{id}` | Single rule |
| 3 | POST | `/api/data-quality-rules` | Create |
| 4 | PATCH | `/api/data-quality-rules/{id}` | Update |
| 5 | GET | `/api/data-quality-rules/instances` | List instances; filters rule_id, data_element_id, application_id, from, to, limit |
| 6 | POST | `/api/data-quality-rules/instances` | Create instance |
| 7 | GET | `/api/data-quality-rules/instances/{id}` | Instance detail; optional prettify SQL |
| 8 | PATCH | `/api/data-quality-rules/instances/{id}/false-positive` | Mark instance |
| 9 | GET | `/api/data-quality-rules/instance-counts` | Aggregated counts by domain |
| 10 | GET | `/api/data-quality-exceptions` | List; filter rule_id, data_element_id |
| 11 | PATCH | `/api/data-quality-exceptions/{id}/false-positive` | Mark exception |
| 12 | GET | `/api/data-quality-rules/{id}/sql-versions` | List SQL versions |
| 13 | POST | `/api/data-quality-rules/{id}/sql-versions` | Add SQL version |
| 14 | PATCH | `/api/data-quality-rules/{id}/sql-versions/{vid}/live` | Set version live |
| 15 | GET | `/api/data-quality-rules/{id}/performance` | Performance summary |
| 16 | GET | `/api/data-quality-rules/{id}/performance/trend` | Trend data |
| 17 | POST | `/api/data-quality-rules/{id}/request-mod` | Request mod |
| 18 | GET | `/api/data-quality-rules/{id}/mod-requests` | List mod requests |
| 19 | PATCH | `/api/data-quality-rules/{id}/flag-monitoring` | Flag for monitoring |

**Checklist:**

- [ ] `DataQualityRule`, `DataQualityException`, `DataQualityRuleInstance`, `DataQualitySqlVersion`, `RuleModRequest` entities
- [ ] All DQ DTOs (Rule, Exception, Instance, InstanceDetail, SqlVersion, Performance, Trend, ModRequest)
- [ ] sqlparse equivalent (SQL prettify) — use `com.github.vertical-blank:sql-formatter` or similar
- [ ] DQ controllers split by concern (rules, exceptions, instances, sql-versions, performance, mod-requests)
- [ ] Parity tests for critical paths

---

## Phase 10: Metrics

| # | Method | Path | Query params | Notes |
|---|--------|------|--------------|-------|
| 1 | GET | `/api/metrics` | domain_id? | KPIs; global or scoped |

**Checklist:**

- [ ] `MetricsOut` DTO (structure from FastAPI)
- [ ] `MetricsController` — aggregate counts from domains, data_elements, applications, etc.
- [ ] Parity test

---

## Phase 11: Bulk (S3)

| # | Method | Path | Notes |
|---|--------|------|-------|
| 1 | POST | `/api/bulk/upload` | multipart: entity_type, file; parse CSV, upsert; store in S3 |
| 2 | GET | `/api/bulk/download` | entity_type, domain_id?; stream CSV or S3 link |

**Checklist:**

- [ ] AWS SDK v2 (`software.amazon.awssdk:s3`)
- [ ] S3 config (endpoint, keys, buckets) from env
- [ ] `S3Service` — upload, download/presign
- [ ] CSV parsing per entity type (domains, data_elements, applications, eucs, endpoints, data_quality_rules, data_quality_exceptions, data_concerns)
- [ ] `POST /api/bulk/upload` — validate columns, upsert via repositories
- [ ] `GET /api/bulk/download` — generate CSV, stream or S3
- [ ] Parity tests (with S3_USE_LOCAL or MinIO)

---

## Phase 12: Infrastructure

| # | Method | Path | Notes |
|---|--------|------|-------|
| 1 | GET | `/health` | `{ status: "ok" }` |
| 2 | GET | `/ready` | DB check; 503 if down |
| 3 | GET | `/` | `{ message, docs }` |
| 4 | CORS | — | From config (CORS_ORIGINS env) |
| 5 | Seed | startup | Optional; JSON seed loader |

**Checklist:**

- [ ] `GET /health` — simple ok
- [ ] `GET /ready` — DataSource or JPA query check
- [ ] `GET /` — API info
- [ ] CORS from `CORS_ORIGINS` env (comma-separated)
- [ ] Optional seed on startup (SEED_ON_STARTUP); ensure_all_users_have_passwords
- [ ] Flyway/Liquibase for schema (optional; or rely on FastAPI during parallel phase)

---

## JPA entities (complete list)

| Entity | Table | Phase |
|--------|-------|-------|
| Domain | domains | 1–2 |
| User | users | 3, 5 |
| Application | applications | 4 |
| EUC | eucs | 4 |
| Endpoint | endpoints | 4 |
| DataElement | data_elements | 6 |
| DataElementSOR | data_element_sor | 6 |
| DataFeed | data_feeds | 8 |
| DataFeedDataElement | data_feed_data_elements | 8 |
| DataFeedControl | data_feed_controls | 8 |
| DataConcern | data_concerns | 7 |
| DataQualityRule | data_quality_rules | 9 |
| DataQualityException | data_quality_exceptions | 9 |
| DataQualityRuleInstance | data_quality_rule_instances | 9 |
| DataQualitySqlVersion | data_quality_sql_versions | 9 |
| RuleModRequest | rule_mod_requests | 9 |
| SeedFlag | seed_flag | 12 |

---

## Summary counts

- **Total endpoints:** ~53
- **Total entities:** 17
- **Phases:** 12 (Phase 1 done)

---

## Execution order

1. Complete Phase 2 (domains) — enables domain-scoped logic used by Phases 4, 6, 7, 8, 9, 10.
2. Phase 3 (auth) — needed if you want to protect routes; can defer.
3. Phases 4–10 — can be parallelized by resource; Phase 4 unblocks many.
4. Phase 11 (bulk) — depends on S3 and all entity repos.
5. Phase 12 — can be done early (health/ready) or last (seed).
