# Refactor Plan: Maintainability Without Overcomplication

A ranked list of frontend and backend refactors to improve maintainability. Each item includes impact, effort, and risk so you can prioritize. The goal is **steady improvement**, not a full rewrite.

---

## Backend Refactors (ranked)

### 1. **Extract `domain_ids_for_scope` to a shared module** — Do first

**Problem:** The same `_domain_ids_for_scope(db, domain_id, scope)` function is copy-pasted in four API modules: `applications.py`, `eucs.py`, `endpoints.py`, and `data_elements.py`. Any fix or behavior change must be done in four places.

**Change:** Add a small shared module (e.g. `app/api/domain_scope.py` or `app/services/domain_scope.py`) with a single `domain_ids_for_scope(db, domain_id, scope) -> list[int]`. Have all four routers import and use it.

**Impact:** High (single source of truth for domain-scoped filtering). **Effort:** Low. **Risk:** Low.

---

### 2. **Add a `get_or_404`-style dependency or helper** — Do early

**Problem:** Multiple routes repeat the pattern: `entity = db.query(Model).filter(Model.id == id).first()` then `if not entity: raise HTTPException(404, "Not found")`. This appears in `domains.py`, `users.py`, `data_elements.py`, and elsewhere.

**Change:** Introduce a small helper or FastAPI dependency, e.g. `get_domain_or_404(domain_id: int, db: Session) -> Domain`, and use it in routes that need a single entity by id. Keep it simple: one helper per model (or a generic `get_or_404(db, Model, id, name="Domain")` if you want minimal helpers).

**Impact:** Medium (less duplication, consistent 404 messages). **Effort:** Low–medium. **Risk:** Low. Avoid building a heavy “repository layer”; a few functions are enough.

---

### 3. **Move route registration out of `main.py`** — Do when touching routers

**Problem:** `main.py` defines two routes inline (`/api/domain-tree`, `/api/data-elements/sor`) and imports router-specific logic (`get_domains_tree_list`, `list_data_element_sor_by_domain`). That mixes app wiring with route implementation.

**Change:** Either:
- Register these routes on the existing `domains` and `data_elements` routers with distinct paths (e.g. `/domains/tree`, `/data-elements/sor`), and mount routers under `/api` in `main.py`, or
- Add a thin `app/api/routes.py` that defines only these two routes and injects the same handlers. Then `main.py` only includes routers and this small routes module.

**Impact:** Medium (clearer separation, `main.py` stays “include routers + startup + health”). **Effort:** Low. **Risk:** Low. Ensure path ordering doesn’t break (e.g. `/domain-tree` before `/domains/{id}`).

---

### 4. **Move CORS origins to config** — Optional, low effort

**Problem:** `allow_origins` is hardcoded in `main.py`. For different environments you have to edit code.

**Change:** In `app/config.py`, add something like `cors_origins: list[str]` (e.g. from env or a comma-separated variable). Use it in `CORSMiddleware` in `main.py`.

**Impact:** Low (cleaner config, easier env-specific setup). **Effort:** Low. **Risk:** Low.

---

### 5. **Avoid for now: full “service layer” or repository pattern**

**Reason:** The codebase is small and CRUD is straightforward. Adding a full service/repository layer would add indirection and files without clear payoff. Prefer small, targeted helpers (e.g. `domain_ids_for_scope`, `get_or_404`) instead.

---

## Frontend Refactors (ranked)

### 1. **Split API layer: DTOs vs API methods** — Do first

**Problem:** `api.service.ts` holds all DTOs (interfaces) and all HTTP methods in one large file (~290 lines). It’s the single point of change for every entity and every endpoint, which makes navigation and code review harder.

**Change:**  
- **Option A (minimal):** Move all DTOs into one or more files under e.g. `core/models/` or `core/dto/` (e.g. `domain.ts`, `user.ts`, `data-element.ts`, … or a single `api-dto.ts` if you prefer fewer files). Keep `ApiService` in `api.service.ts` but have it import types from those files.  
- **Option B (by resource):** Split by resource: `core/api/domains.api.ts` (DTOs + methods for domains), `core/api/users.api.ts`, etc., and a thin `ApiService` that re-exports or composes them. Use Option B only if you want clearer boundaries per resource; otherwise Option A is enough.

**Impact:** High (easier to find and change types and endpoints). **Effort:** Medium (move + fix imports). **Risk:** Low if you only move code and update imports; no behavior change.

---

### 2. **Reduce NgRx effect boilerplate with a small helper** — Do early

**Problem:** `app.effects.ts` has many “load → setLoading → api call → setData/setLoading(false) → catchError” effects that are almost identical. Repeating this for every entity makes the file long and any change to the pattern (e.g. error handling) must be repeated.

**Change:** Introduce a small helper (or one generic effect factory) that:
- Takes the action type, API call observable, loading key, and set-action creator.
- Handles `setLoading(true/false)`, mapping response to the set action, and catchError (e.g. set empty list and optionally set error).  
Then each entity effect becomes a short call to this helper. Keep the helper in the same file or a nearby `effect-helpers.ts`; avoid a heavy abstraction.

**Impact:** High (shorter, consistent effects; one place to adjust loading/error behavior). **Effort:** Medium. **Risk:** Low–medium (ensure dispatch order and error handling stay correct).

---

### 3. **Shared date-formatting (pipe or util)** — Do when touching modals

**Problem:** `DataConcernDetailModalComponent` (and possibly others) define a local `formatDate()` for the same “ISO string → localized string” behavior. Reuse will be needed as more modals show dates.

**Change:** Add a small `FormatDatePipe` or a shared util (e.g. `core/utils/date.ts` with `formatDateTime(value: string | undefined): string`) and use it in detail modals. Prefer a pipe if you use it in templates only; util if you need it in TS as well.

**Impact:** Low–medium (consistency, one place to change format). **Effort:** Low. **Risk:** Low.

---

### 4. **Keep a single global store, avoid feature-state fragmentation** — Do not do (for now)

**Problem:** All state lives in one `app` slice and one reducer. It’s tempting to split by “feature” (e.g. admin vs domain-scoped).

**Recommendation:** Keep the single store. The app is still manageable; splitting state would add complexity (cross-slice selectors, more actions) without clear gain. Revisit only if the store or reducer file becomes very large (e.g. 500+ lines) or teams need to own distinct areas.

---

### 5. **Optional: Lazy-loaded feature modules** — Only if app grows

**Problem:** `app.module.ts` declares many components and imports in one place.

**Recommendation:** Leave as-is for now. Introducing lazy-loaded feature modules (e.g. “Admin”, “Data elements”, “Bulk”) is a larger refactor. Do it only when bundle size or navigation structure clearly benefit (e.g. admin-only routes loaded on demand). For current size, a single module is acceptable.

---

## Summary Table

| Priority | Backend | Frontend |
|----------|---------|----------|
| **1 (do first)** | Extract `domain_ids_for_scope` to shared module | Split API: DTOs (and optionally API methods) out of `api.service.ts` |
| **2 (do early)** | `get_or_404` helper/dependency | Generic load/set/error effect helper |
| **3 (when touching)** | Move `/domain-tree` and `/data-elements/sor` into routers or small routes module | Shared date-formatting (pipe or util) |
| **4 (optional)** | CORS origins in config | — |
| **Skip for now** | Full service/repository layer | Feature-sliced store; lazy feature modules |

---

## Order of implementation

1. Backend: **#1 domain_ids_for_scope** → **#2 get_or_404** → **#3 route registration** (then #4 CORS if desired).  
2. Frontend: **#1 split API (DTOs + optional API split)** → **#2 effect helper** → **#3 date formatting** when you next change a detail modal.

This keeps each step small, testable, and reversible without overcomplicating the codebase.
