# Data Manager Portal — Design Guidance

This document defines how we use **pages**, **KPIs**, **tables**, **rows**, **side panel**, **cards**, and **full-context area modals** in a consistent way across the application.

---

## 1. Pages

**Purpose:** A page is a top-level route that occupies the main content area (inside the layout’s `<main>`). Each page corresponds to one primary object type or function (e.g. Critical Data Elements, Endpoints, Metrics, Data Concerns).

**Usage:**

- **One primary focus per page.** The page title (e.g. “Critical Data Elements”, “Endpoints”) and short description establish context. Do not mix multiple unrelated object types as equal peers on the same page.
- **Domain scope:** Most entity pages are scoped by the **selected domain** (sidebar). When no domain is selected, show a clear message (e.g. “Select a domain in the sidebar to load data”) and optional global/unspecified content where it makes sense.
- **Structure:** Use a consistent order when applicable:
  1. **Header:** Page title (h2), optional short description, optional controls (e.g. time-period switch, scope tabs).
  2. **Optional KPIs / concept metrics** (see §2).
  3. **Primary content:** Usually a **table** (see §3) or a **grid of cards** (e.g. Home key metrics, attention items).
- **Layout:** Pages live inside the outlet wrapper with `flex-1 flex flex-col min-h-0 overflow-hidden`. The primary content area should flex and scroll as needed; avoid fixed heights that break on small viewports.

**Do:** Use a single, clear page title and description.  
**Don’t:** Pack multiple unrelated list views or dashboards into one page without a clear hierarchy.

---

## 2. KPIs (Key Performance Indicators) / Concept Metrics

**Purpose:** Summarize counts or key numbers for the current context (e.g. domain) so users can quickly assess volume and trends without opening detail.

**Usage:**

- **Placement:** On **Home**, KPIs appear as a grid of metric cards (e.g. Data Elements, Applications, EUCs, Endpoints, DQ Rules, DQ Exceptions, Data Concerns). On **entity list pages** (e.g. Data Elements, Endpoints), use the **concept-metrics** component in a horizontal strip above the table.
- **Visual:** Each KPI is a **card** (see §6): label (small, muted), primary value (accent, prominent). Optionally: trend/sparkline, change indicator (e.g. “+5%”). Use `card-aurora` and consistent padding (e.g. `p-4` or `p-5`).
- **Grid:** Use responsive grid (e.g. `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4` or `lg:grid-cols-5`) so KPIs reflow on smaller screens.
- **Data:** KPIs are typically sourced from the **metrics API** (counts per domain or global). Keep labels short and consistent with backend metric keys (e.g. “Data Elements”, “DQ Exceptions”).

**Do:** Show a small set of the most important counts; keep labels and values scannable.  
**Don’t:** Overload a page with many KPI cards; prefer linking to a dedicated Metrics page for deeper analysis.

---

## 3. Tables

**Purpose:** Display a list of **objects** (entities) as rows. Tables are the primary way to browse and select domain-scoped entities (Data Elements, Applications, EUCs, Endpoints, DQ Rules, DQ Exceptions, Data Concerns).

**Usage:**

- **Component:** Use **AG Grid** (`ag-grid-angular`) with `ag-theme-quartz` and `ag-grid-full-height` so the table fills the main content area and scrolls internally.
- **Row model:** One **row** = one object instance. Row click selects the object and opens the **side panel** (see §5) for that object; do not use row click for primary actions (e.g. delete) without confirmation.
- **Columns:** Include: identifier/name, key metadata (e.g. domain, type, status), and **count columns** or **action cells** (e.g. # Concerns, # Endpoints, View lineage, Open CDEs) that open the side panel with the right context or open a modal.
- **Behavior:** `suppressRowClickSelection` is typically `true`; selection state is implied by “which row’s detail is shown in the side panel.” Use `getRowId` for stable row identity.
- **Empty state:** When there are no rows, show a short message (e.g. “No data elements. Select a domain or upload bulk data.”) instead of an empty grid.

**Do:** Keep column definitions in the page component; use cell renderers or buttons for custom actions (lineage, open CDEs, open concerns).  
**Don’t:** Use the table as a form; use the side panel or modals for detail and edit flows.

---

## 4. Rows (within tables and detail views)

**Purpose:** In **tables**, a row is one entity. In **detail views** (side panel, modal), “rows” refer to **label–value pairs** (e.g. Name, Description, Domain ID) that describe a single object.

**Usage:**

- **Table rows:** Bound to `rowData`; each row has a stable `id` for AG Grid. Clicking a row opens the side panel for that object; no inline editing in the grid.
- **Detail rows (label–value):** In the side panel and in modals, use a `<dl>` with repeated pairs: `<dt>` for label (fixed width, muted), `<dd>` for value. Use a consistent structure (e.g. `DetailRow[]` with `label` and `value`) so the same pattern works across detail panel and modals. Use `—` or “—” for null/empty values.

**Do:** Reuse the same row structure (label/value) in side panel and full-context modals for consistency.  
**Don’t:** Mix different layouts for the same kind of detail (e.g. one place as list, another as paragraphs).

---

## 5. Side Panel

**Purpose:** Show **detail and related content** for the object selected in the table without leaving the page. The side panel keeps list context visible while the user inspects one item.

**Usage:**

- **Trigger:** Opening is triggered by **row click** in the main table. Closing is via an explicit close control (e.g. “✕”) or by clearing selection (if we add that behavior).
- **Layout:** The panel is a **sliding panel** (e.g. `detail-panel` with `detail-panel--open`) that sits beside the main content. The main content area may shrink (e.g. `main-content--panel-open`) when the panel is open.
- **Content:**  
  - **Header:** Panel title (e.g. object name).  
  - **Body:**  
    - **Detail rows:** Label–value pairs for the selected object.  
    - **Related sections:** Grouped lists of **related objects** (e.g. Consumed CDEs, Data Concerns, DQ Rules, Endpoints, SORs). Each related item is presented as a **card** (see §6) that can be clicked to open a **full-context modal** (see §7).
- **Behavior:** The side panel does not host complex forms or multi-step flows; it’s for **read-only detail + navigation** to related objects. Editing or deep workflows open in a modal or a separate route.

**Do:** Use one side panel per list page; bind its visibility and content to the “selected row” state.  
**Don’t:** Stack multiple side panels or use the side panel for full create/edit flows.

---

## 6. Cards

**Purpose:** Present a compact summary of an **object** (or a metric) that can be scanned quickly and optionally opened for more detail.

**Usage:**

- **KPI / metric cards:** Used for KPIs and concept metrics: one card per metric (label + value + optional trend). Style: `card-aurora` with padding; no click required for the primary metric view.
- **Attention / action cards:** On Home, “Items needing attention” are cards with title, count, short description, and a “View →” action that navigates to the relevant page. Use border accent (e.g. `border-l-4 border-amber-500` or `border-accent`) for severity.
- **Related-object cards (e.g. concern cards):** In the **side panel**, related entities (e.g. a Data Concern, an Endpoint, a DQ Rule, a CDE) are shown as **clickable cards** (e.g. `concern-card`). Each card shows: title/name, optional metadata (status, id), optional description, and optional refs (e.g. “App 5”, “Endpoint 12”). Click opens the **full-context modal** for that object.
- **Non-clickable cards:** When the related item is not navigable (e.g. SOR with application name and physical data attribute), use a card style (e.g. `sor-card`) without button behavior.

**Do:** Use a single card style for “related object in side panel” (e.g. `concern-card`) so the same interaction (click → modal) is consistent.  
**Don’t:** Use cards for primary table rows; tables are for list view, cards for related items and metrics.

---

## 7. Full-Context Area Modals

**Purpose:** Show **one object in full context** when the user needs to focus on it without losing the underlying page. Used when drilling down from a **card** in the side panel (e.g. open a Data Concern, Endpoint, DQ Rule, or Data Element).

**Usage:**

- **Trigger:** Opened from a **card** in the side panel (e.g. “Data Concern”, “Endpoint”, “DQ Rule”, “Data Element”). Can also be opened from other entry points (e.g. Data Concerns page) when the primary action is “view this object in detail.”
- **Layout:** **Centered modal** over a dimmed overlay (`fixed inset-0 z-50`, overlay `bg-black/60`). Modal container: limited max width (e.g. `max-w-lg` or `max-w-2xl`), max height (e.g. `max-h-[80vh]`), scrollable body. Header: title (e.g. “Data Concern: &lt;title&gt;”) and close button. Body: **detail rows** (label–value) for that object.
- **Behavior:** Click overlay or close button closes the modal. No nested modals; closing returns to the side panel or list.
- **Naming:** We use “full-context area modal” to mean a modal that presents the **whole object** (all key attributes) in one place, as opposed to a small confirmation or single-field dialog.

**Do:** Reuse the same detail row structure (label/value) as in the side panel. Use one modal component per object type (e.g. Data Concern detail modal, Endpoint detail modal) for consistency.  
**Don’t:** Use full-context modals for tiny confirmations or for create/edit flows that need more space; use appropriate dialogs or routes instead.

---

## Summary

| Element              | Use for                                                                 |
|----------------------|-------------------------------------------------------------------------|
| **Page**             | One primary object type or function; domain-scoped; header + optional KPIs + main content. |
| **KPIs / concept metrics** | Counts and key numbers in cards; above table or on Home.                |
| **Table**            | List of objects; one row = one object; row click opens side panel.      |
| **Rows**             | In table: one entity. In detail: label–value pairs.                     |
| **Side panel**       | Detail + related objects for the selected table row; cards open modals.  |
| **Cards**            | Metric summary, attention item, or related object (clickable → modal).  |
| **Full-context modal** | Full detail of one object opened from a card (or list); overlay, scrollable. |

This keeps navigation predictable: **list (table) → select row → side panel → click card → modal**, with KPIs and cards used for at-a-glance and drill-down.
