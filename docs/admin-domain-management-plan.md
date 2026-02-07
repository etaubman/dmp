# Admin Section & Domain Management (L0–L3) — Implementation Plan

This document outlines the changes needed in the frontend and backend to add an **Admin** section with **Domain Management**: add, edit, and remove domains in a hierarchy from L0 (top) through L3 (and beyond, if desired).

---

## Current State Summary

- **Backend**
  - **Domain model** (`app/models/__init__.py`): `id`, `name`, `description`, `parent_id`, `created_at`, `updated_at`. Supports hierarchy via `parent_id`; no `children` relationship defined.
  - **Domain API** (`app/api/domains.py`): Read-only — `GET /api/domains` (list) and `GET /api/domains/{id}` (get by id). No create/update/delete.
  - **Domain schemas** (`app/schemas/domain.py`): `DomainBase`, `DomainCreate`, `DomainUpdate`, `DomainOut` already exist and support `parent_id`.
  - **Seed** (`app/seed.py`): Creates **L0, L1, and L2** from `DOMAIN_HIERARCHY`. Seed structure: L0 Markets (L1 Equities with L2 Cash/Derivatives/Prime, L1 Commodities with L2 Agriculture/Oil & Gas/Metals), L0 Banking (L1 Commercial Banking, L1 Investment Banking). Rich data and regulatory endpoints (e.g. MIFID II, SNC, FR-Y-14) are seeded under the four L1 domains.

- **Frontend**
  - **Routing**: Single layout with children for Home, Data Elements, Applications, EUCs, Endpoints, DQ Rules, DQ Exceptions, Data Concerns, Metrics, Bulk. No admin routes.
  - **Layout**: Sidebar nav and header; no “Admin” entry.
  - **API**: `ApiService.getDomains()` and `getDomain(id)` only; no create/update/delete for domains.
  - **Store**: Loads domains and current domain id; no admin-specific state.

---

## 1. Backend Changes

### 1.1 Domain model (optional but useful)

- **File**: `backend/app/models/__init__.py`
- **Change**: Add a `children` relationship on `Domain` so that tree responses can include nested children without extra queries:
  - `children = relationship("Domain", backref=backref("parent", remote_side=[id]))` or equivalent so that from a domain you can access `domain.children`.
- **Reason**: Simplifies building L0→L1→L2→L3 tree in one query and keeps API responses clear.

### 1.2 Domains API — full CRUD + tree endpoint

- **File**: `backend/app/api/domains.py`
- **Changes**:
  1. **POST `/api/domains`**  
     - Body: `DomainCreate` (name, description, parent_id optional).  
     - Create domain; return `DomainOut`.  
     - Validate: `parent_id` must exist and optionally enforce max depth (e.g. 4 for L0–L3) if you want a hard cap.
  2. **PATCH `/api/domains/{domain_id}`**  
     - Body: `DomainUpdate` (name, description, parent_id optional).  
     - Update domain; return `DomainOut`.  
     - Validate: no circular parent (e.g. new parent must not be self or a descendant); optionally enforce max depth.
  3. **DELETE `/api/domains/{domain_id}`**  
     - Delete domain only if it has no children (or decide: cascade delete children and all related entities, or block and return 409).  
     - Recommend: **block** if domain has children or has related data (data_elements, applications, eucs, endpoints, data_quality_rules, data_concerns); return 409 with a clear message. If no children and no dependents, delete and return 204.
  4. **GET `/api/domains/tree`** (new)  
     - Returns a nested structure (e.g. list of root domains, each with a `children` array recursively) so the frontend can render L0→L1→L2→L3 without building the tree client-side.  
     - Response shape: e.g. `DomainTreeOut` with `id`, `name`, `description`, `parent_id`, `children: List[DomainTreeOut]`, and optionally `level` (0 for L0, 1 for L1, etc.) for convenience.

### 1.3 Domain schemas

- **File**: `backend/app/schemas/domain.py`
- **Changes**:
  - Add **`DomainTreeOut`**: like `DomainOut` but with `children: List["DomainTreeOut"]` (use `model_rebuild()` or forward ref so Pydantic can resolve the recursive type). Optionally add `level: int` for L0/L1/L2/L3.
  - Keep using `DomainCreate` and `DomainUpdate` for POST/PATCH.

### 1.4 Seed (optional for L2/L3)

- **File**: `backend/app/seed.py`
- **Change**: If you want seed data to include L2/L3 examples, extend `DOMAIN_HIERARCHY` to a 3-level structure (e.g. L0 → L1 → L2) or add a separate structure and create L2/L3 domains in `_add_domains` (or a new helper). Not required for the admin feature to work; admin will allow creating L2/L3 manually.

### 1.5 Authorization (future-proofing)

- No auth in scope for this plan. When you add auth later, protect **POST/PATCH/DELETE** (and optionally GET tree) under something like `/api/admin/domains` or keep `/api/domains` and restrict by role (e.g. only “admin” can mutate).

---

## 2. Frontend Changes

### 2.1 Admin section structure

- **New routes** (under a dedicated “Admin” area):
  - **`/admin`** — Admin landing/dashboard (optional; can redirect to first sub-feature).
  - **`/admin/domains`** — Domain Management page (list/tree L0–L3, add/edit/remove).

- **Routing**:
  - **File**: `frontend/src/app/app-routing.module.ts`
  - Add a route group for admin, e.g.:
    - `path: 'admin', component: LayoutComponent` (reuse existing layout) with `children`:
      - `{ path: '', pathMatch: 'full', redirectTo: 'domains' }` or a small AdminHomeComponent.
      - `{ path: 'domains', component: AdminDomainsPageComponent }` (Domain Management).
  - This keeps the same layout and sidebar so “Admin” appears in the nav and sub-routes show in the main outlet.

### 2.2 Layout and navigation

- **File**: `frontend/src/app/layout/layout.component.html`
  - Add an “Admin” nav item (e.g. with icon) that links to `/admin` or `/admin/domains`.
  - Optionally add a submenu under Admin for “Domain Management” (and future items like “User Management”, etc.) or keep a single “Admin” link that goes to `/admin/domains` for now.

### 2.3 API service

- **File**: `frontend/src/app/core/api.service.ts`
  - Add:
    - `getDomainsTree(): Observable<DomainTreeNode[]>` — GET `/api/domains/tree` (use a new interface for tree node with `children`).
    - `createDomain(body: DomainCreate): Observable<Domain>` — POST `/api/domains`.
    - `updateDomain(id: number, body: DomainUpdate): Observable<Domain>` — PATCH `/api/domains/{id}`.
    - `deleteDomain(id: number): Observable<void>` — DELETE `/api/domains/{id}`.
  - Add interfaces (or reuse): `DomainCreate`, `DomainUpdate`, and `DomainTreeNode` (id, name, description, parent_id, children, optional level).

### 2.4 NgRx store (optional but recommended)

- **Files**: `app.state.ts`, `app.actions.ts`, `app.reducer.ts`, `app.effects.ts`, `app.selectors.ts`
  - **State**: Add something like `adminDomainsTree: DomainTreeNode[] | null` and `adminDomainsLoadError: string | null` (or reuse `domains` and add a separate tree load for admin).
  - **Actions**: e.g. `loadDomainsTree`, `domainsTreeLoaded`, `domainsTreeLoadFailed`, `createDomain`, `updateDomain`, `deleteDomain` (with success/failure).
  - **Effects**: On `loadDomainsTree`, call `getDomainsTree()` and dispatch success/fail. On create/update/delete, call API then dispatch success (and optionally reload tree and domains list) or failure.
  - **Selectors**: `selectDomainsTree`, `selectDomainsTreeLoadError`. This keeps the Domain Management page simple and consistent with the rest of the app.

### 2.5 Domain Management page (Admin)

- **New module/component**: e.g. `frontend/src/app/pages/admin-domains-page/` (or under `admin/` folder).
  - **admin-domains-page.component.ts/html/css**
  - **Features**:
    - **Tree view**: Show hierarchy L0 → L1 → L2 → L3 (and beyond). Use the tree endpoint; render with nested lists or a tree UI component (e.g. Angular Material tree, or simple recursive `ng-template`).
    - **Actions per node**: Edit (name, description, parent), Delete (with guard: “only if no children and no dependents” or show backend error).
    - **Add domain**: Button “Add domain” with form (name, description, parent). Parent dropdown or tree-picker: only domains that are at depth &lt; 3 (or &lt; 4) to allow L0–L3. Create via API then refresh tree (and global domains list if needed).
  - **Validation**: Name required; parent optional (null = L0). Show backend validation errors (e.g. 409 for delete, 400 for validation).
  - **UX**: Inline edit vs modal is a product choice; modal is simpler and consistent with existing detail modals.

### 2.6 App module

- **File**: `frontend/src/app/app.module.ts`
  - Declare the new admin page component(s) (e.g. `AdminDomainsPageComponent`).
  - Import any new modules (e.g. `ReactiveFormsModule` for forms, or Material if you introduce it for the tree).

### 2.7 Reuse existing patterns

- **No standalone components**: Per your preference, keep all new components in `AppModule` (no standalone).
  - Use the same layout, nav-link styles, and detail-modal/panel patterns where it makes sense (e.g. “Edit domain” in a modal similar to existing modals).

---

## 3. Implementation Order

1. **Backend**
   - Add `DomainTreeOut` schema and GET `/api/domains/tree`.
   - Add POST/PATCH/DELETE to `domains.py` with validation (parent exists, no cycles, delete only when safe).
   - Optionally add `children` on the Domain model and use it in the tree builder.
2. **Frontend — API and routing**
   - Add tree/create/update/delete in `ApiService` and `DomainTreeNode`/create/update types.
   - Add `/admin` and `/admin/domains` routes and an Admin nav item in the layout.
3. **Frontend — Domain Management page**
   - Implement Admin Domains page: load tree, show hierarchy, add/edit/delete with forms and error handling.
   - Wire NgRx for tree load and mutations (and refresh domains list after mutations so the domain selector stays in sync).

---

## 4. L0–L3 Semantics

- **L0**: Root domains (`parent_id` null).
- **L1**: `parent_id` = L0.
- **L2**: `parent_id` = L1.
- **L3**: `parent_id` = L2.
- The backend does not need to store “level” as a column; level can be computed from the tree (root = 0, child = parent level + 1). Optionally the tree endpoint can return `level` for convenience. Enforce max depth 4 (L0–L3) in API if required by business rules.

---

## 5. Files to Create or Touch (checklist)

| Area        | Action | File(s) |
|------------|--------|---------|
| Backend    | Extend | `app/schemas/domain.py` (DomainTreeOut) |
| Backend    | Extend | `app/api/domains.py` (tree, POST, PATCH, DELETE) |
| Backend    | Optional | `app/models/__init__.py` (children on Domain) |
| Backend    | Optional | `app/seed.py` (L2/L3 example data) |
| Frontend   | Extend | `core/api.service.ts` (tree, create, update, delete) |
| Frontend   | Extend | `app-routing.module.ts` (admin routes) |
| Frontend   | Extend | `layout/layout.component.html` (Admin nav) |
| Frontend   | Extend | `store/*` (actions, effects, reducer, selectors for admin domains) |
| Frontend   | Create | `pages/admin-domains-page/*` (component + template + styles) |
| Frontend   | Extend | `app.module.ts` (declare new component) |

---

## 6. Out of Scope (for later)

- Authentication and role-based access for admin.
- Audit log for domain create/update/delete.
- Bulk import/export of domain hierarchy (you already have bulk for other entities).
- Moving existing entities (e.g. data elements) when a domain’s parent is changed (current design keeps `domain_id` on entities; reparenting a domain does not change those).

This plan gives you a clear path to implement the Admin section and Domain Management (L0–L3) on both frontend and backend with minimal breaking changes and room to add more admin features later.
