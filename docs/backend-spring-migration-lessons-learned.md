# Spring Migration: Lessons Learned and Implementation Guide

Summary of learnings from Phases 1–3 and a guide for implementing the remaining phases.

---

## 1. Lessons Learned

### JSON serialization parity

**Gotcha:** Jackson's `@JsonInclude(JsonInclude.Include.NON_NULL)` omits null fields. FastAPI/Pydantic includes them (e.g. `"parent_id": null`).

**Fix:** Do not use `NON_NULL` on DTOs that must match FastAPI. Use default serialization so nulls are included, or use `@JsonInclude(JsonInclude.Include.ALWAYS)` when you need explicit nulls.

### Datetime precision

**Gotcha:** FastAPI returns microseconds (e.g. `176576`); Spring/Jackson with `OffsetDateTime` returns milliseconds (e.g. `176`). Parity tests fail on exact equality.

**Fix:** In parity tests, compare parsed datetimes with a tolerance (e.g. 1 ms) instead of exact match:
```python
def _datetimes_equal(dt1, dt2, tolerance_ms=1):
    if dt1 is None and dt2 is None: return True
    if dt1 is None or dt2 is None: return False
    return abs((dt1 - dt2).total_seconds() * 1000) <= tolerance_ms
```

### Snake_case vs camelCase

**Gotcha:** FastAPI uses snake_case (`parent_id`, `created_at`). Jackson defaults to camelCase (`parentId`, `createdAt`).

**Fix:** Use `@JsonProperty("parent_id")` (and similar) on DTO fields so JSON keys match FastAPI.

### JWT secret length

**Gotcha:** JJWT 0.12.x requires JWT HMAC keys ≥ 256 bits (32 bytes). The default `"dev-secret-change-in-production"` is 31 chars → 248 bits → `WeakKeyException`.

**Fix:** Use a secret ≥ 32 characters. Set `AUTH_JWT_SECRET` in both backends (e.g. `dev-secret-change-in-production-32chars`) so tokens are interchangeable. Document in `.env.example`.

### PATCH and partial updates

**Gotcha:** For PATCH, you need to know if a field was sent or omitted. With a plain DTO, `null` is ambiguous.

**Fix:** Use a setter that sets a flag when the key is present:
```java
@JsonProperty("parent_id")
public void setParentId(Integer parentId) {
    this.parentId = parentId;
    this.parentIdIncluded = true;  // only set when JSON had the key
}
public boolean hasParentIdUpdate() { return parentIdIncluded; }
```

### Spring Security and 403 on POST

**Gotcha:** With `permitAll()` on login, POST still returned 403.

**Fix:** Explicitly disable form login, HTTP basic, and logout:
```java
http.formLogin(AbstractHttpConfigurer::disable)
    .httpBasic(AbstractHttpConfigurer::disable)
    .logout(AbstractHttpConfigurer::disable)
```

### Circular dependency (SecurityConfig ↔ JwtAuthenticationFilter)

**Gotcha:** `SecurityConfig` → `JwtAuthenticationFilter` → `AuthService` → `PasswordEncoder` (in SecurityConfig) → cycle.

**Fix:** Use `@Lazy` on the filter:
```java
public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthFilter) { ... }
```

### Native query for related-data count

**Gotcha:** Domain delete must check multiple tables (children, data_elements, applications, etc.). You don't have all entities yet.

**Fix:** Use `@Query(nativeQuery = true)` with a sum of subselects:
```java
@Query(value = "SELECT (SELECT COUNT(*) FROM domains WHERE parent_id = :id) + " +
        "(SELECT COUNT(*) FROM data_elements WHERE domain_id = :id) + ...", nativeQuery = true)
long countRelatedData(@Param("id") int id);
```

---

## 2. Parity Test Patterns

### List parity

Compare count, content (by id), and order. Use datetime tolerance for timestamps.

### Tree parity

Flatten tree to list of `(id, name, parent_id, level)` and compare. Recursive structure must match.

### Create parity

- POST to both with same payload.
- Compare structure (required keys) and field values (name, description, parent_id).
- IDs and timestamps will differ; don't compare those.
- Clean up: delete created resources.

### Update parity

- Create resource via one backend.
- PATCH via one backend, GET via the other — same DB, so response should match.
- Cross-verify: PATCH via other backend, GET via first.
- Clean up.

### Delete parity

- Create two resources (e.g. domains with no children).
- DELETE one via FastAPI, one via Spring; both should return 204.
- Verify 404 on GET for both.

### Auth parity

- Login: both return `access_token`.
- /me: use token from FastAPI login; call both; compare user fields.
- For token interchange, both must use the same `AUTH_JWT_SECRET`.

---

## 3. Steps to Implement Next Phases

### Phase 4: Simple domain-scoped lists

1. **Create `DomainScopeService`**
   - Port `domain_ids_for_scope(domain_id, scope)` from `backend/app/api/domain_scope.py`.
   - Logic: `owned` = [domain_id]; `upstream` = [parent_id] if any; `downstream` = immediate children.
   - Depends on `DomainRepository.findByParentIdOrderByNameAsc`, `findById`.

2. **Create entities**
   - `Application`, `EUC`, `Endpoint` — match SQLAlchemy models. Use `@Table(name="applications")` etc.

3. **Create repositories**
   - `ApplicationRepository`, `EUCRepository`, `EndpointRepository`.
   - Add `findByDomainIdInOrderByNameAsc(List<Integer> domainIds)` or equivalent.

4. **Create DTOs**
   - `ApplicationOut`, `EUCOut`, `EndpointOut` — match Pydantic schemas (snake_case, include nulls).

5. **Create controllers**
   - `ApplicationsController`, `EucsController`, `EndpointsController`.
   - Use `@RequestParam` for `domain_id`, `scope`, `application_id`.

6. **Parity tests**
   - Add tests for each list endpoint; compare output with FastAPI.

### Phase 5: Users (CRUD)

1. **DTOs**
   - `UserOut`, `UserCreate`, `UserUpdate` — User entity exists.

2. **UsersController**
   - Full CRUD; validate email unique on create/update.

3. **Parity tests**
   - List, get, create, update, delete.

### Phase 6: Data elements

1. **Entities**
   - `DataElement`, `DataElementSOR` (and `Application` if not done).

2. **Complex endpoints**
   - Lineage: build graph from SOR + DQ rules/endpoints. Port logic from `data_elements.py`.
   - SOR list: join with Application, filter by domain scope.

3. **Parity tests**
   - List, SOR, lineage, lineage-applications.

### Phase 9: Data quality (largest)

1. **Entities**
   - `DataQualityRule`, `DataQualityException`, `DataQualityRuleInstance`, `DataQualitySqlVersion`, `RuleModRequest`.

2. **SQL prettify**
   - FastAPI uses `sqlparse`. Use `com.github.vertical-blank:sql-formatter` or similar in Java.

3. **Split controllers**
   - `DataQualityRulesController`, `DataQualityExceptionsController`, etc. — or one controller with many methods.

4. **Performance/trend**
   - Port aggregation logic from FastAPI.

### Phase 11: Bulk (S3)

1. **AWS SDK v2**
   - Add `software.amazon.awssdk:s3`; configure endpoint for MinIO.

2. **CSV parsing**
   - Use OpenCSV or similar; match column names and validation per entity type.

3. **Upload**
   - Store file in S3; upsert rows via repositories.

4. **Download**
   - Stream CSV or generate and return link.

---

## 4. Implementation Checklist (Next Phase)

Before starting a new phase:

- [ ] Read the FastAPI router and schemas for that resource.
- [ ] Identify all DTOs (request/response) and their JSON shape.
- [ ] Create JPA entities matching table names and columns.
- [ ] Add `@JsonProperty` for any snake_case fields.
- [ ] Avoid `@JsonInclude(NON_NULL)` unless FastAPI omits nulls.
- [ ] Add parity tests for every new endpoint.
- [ ] Run `pytest backend/tests/test_fastapi_spring_parity.py` after implementation.
- [ ] Rebuild Docker: `docker-compose build backend-spring` and restart.

---

## 5. Useful Commands

```powershell
# Start both backends
docker-compose up -d postgres backend backend-spring

# Run parity tests
pytest backend/tests/test_fastapi_spring_parity.py -v

# Rebuild Spring after code changes
docker-compose build backend-spring
docker-compose up -d backend-spring --force-recreate
```

---

## 6. File Reference

| Purpose | Location |
|---------|----------|
| Migration checklist | `docs/backend-spring-migration-checklist.md` |
| Parity tests | `backend/tests/test_fastapi_spring_parity.py` |
| FastAPI routers | `backend/app/api/*.py` |
| FastAPI schemas | `backend/app/schemas/*.py` |
| FastAPI models | `backend/app/models/__init__.py` |
| Spring controllers | `backend-spring/src/main/java/com/dmp/controller/` |
| Spring DTOs | `backend-spring/src/main/java/com/dmp/dto/` |
| Spring entities | `backend-spring/src/main/java/com/dmp/model/` |
