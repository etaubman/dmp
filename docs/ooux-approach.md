# Data Manager Portal — OOUX Approach

This document specifies our **Object-Oriented UX (OOUX)** approach for the Data Manager Portal, following the methodology in [OOUX: A Foundation for Interaction Design](https://alistapart.com/article/ooux-a-foundation-for-interaction-design/) (A List Apart, Sophia V. Prater). We design **objects before actions**, then use a **CTA Inventory** to bridge from system design to interaction design.

---

## 1. Why OOUX for DMP

- **Shared mental model:** Users (data stewards, governance teams) think in terms of *things*: domains, data elements, applications, endpoints, concerns, rules. Designing around these objects first keeps the UI aligned with how they work.
- **Consistent patterns:** Once objects and their relationships are fixed, we can apply the same interaction patterns (list → select → side panel → card → modal) across object types, as described in [design-guidance.md](design-guidance.md).
- **Scope and estimates:** A CTA Inventory gives a clear list of “doors” into interaction flows, so we can prioritize and estimate interaction design work instead of discovering it late.

---

## 2. Core Principle: Objects Before Actions

We do **not** start by storyboarding user flows (e.g. “onboard a user” or “post a recipe”). We start by defining:

1. **Who** is the user (persona / role).
2. **What objects** the problem domain is made of—the things users see as part of the solution.
3. **How objects relate** to one another.
4. **What content and metadata** each object has (core content vs metadata; nested/related objects).
5. **Then** we design actions (CTAs) on those objects.

So the order is: **objects and their composition → relationships → CTAs and interaction flows**.

---

## 3. Object Map for DMP

Below is our object map: the main **objects** in the system, their **elements** (core content, metadata, related/nested objects), and how they **relate**. This is the “object-oriented framework” we use before detailing interactions.

### 3.1 Domain

| Element type   | Elements |
|----------------|----------|
| Core content   | Name, Description |
| Metadata       | Parent ID, Level (L0/L1/L2/L3), Created at, Updated at |
| Nested/related | Children (sub-domains), Entities in domain (Data Elements, Applications, etc.) |

**Relationships:** Parent → Children (tree). Domain **contains** Data Elements, Applications, EUCs, Endpoints, DQ Rules, Data Concerns (via `domain_id`).

---

### 3.2 Data Element (CDE)

| Element type   | Elements |
|----------------|----------|
| Core content   | Name, Description |
| Metadata       | Domain ID, Element type, Created at, Updated at |
| Nested/related | Systems of record (SORs – Applications), Data Quality Rules, Data Concerns, Consuming Endpoints, Lineage |

**Relationships:** Belongs to **Domain**. Has many **Data Quality Rules**, **Data Concerns**; linked to **Applications** (SOR); consumed by **Endpoints**.

---

### 3.3 Application

| Element type   | Elements |
|----------------|----------|
| Core content   | Name, Description |
| Metadata       | Domain ID, Created at, Updated at |
| Nested/related | Endpoints, Data Concerns, SOR links (to Data Elements) |

**Relationships:** Belongs to **Domain**. Has **Endpoints**; may be **SOR** for Data Elements; can have **Data Concerns**.

---

### 3.4 EUC (End User Computing)

| Element type   | Elements |
|----------------|----------|
| Core content   | Name, Description |
| Metadata       | Domain ID, EUC type, Created at, Updated at |
| Nested/related | Data Concerns |

**Relationships:** Belongs to **Domain**. Has **Data Concerns**.

---

### 3.5 Endpoint

| Element type   | Elements |
|----------------|----------|
| Core content   | Name, Description |
| Metadata       | Domain ID, Application ID, Created at, Updated at |
| Nested/related | Consumed CDEs (Data Elements), Data Quality Rules, Data Concerns |

**Relationships:** Optional **Domain**; optional **Application**. Consumes **Data Elements**; has **DQ Rules** and **Data Concerns**.

---

### 3.6 Data Quality Rule

| Element type   | Elements |
|----------------|----------|
| Core content   | Name, Description |
| Metadata       | Domain ID, Rule type, Data Element ID, Endpoint ID, Created at, Updated at |
| Nested/related | Data Quality Exceptions |

**Relationships:** Optional **Domain**; optional **Data Element**; optional **Endpoint**. Has **DQ Exceptions**.

---

### 3.7 Data Quality Exception

| Element type   | Elements |
|----------------|----------|
| Core content   | Description |
| Metadata       | Rule ID, Data Element ID, Status, Identified at, Created at |
| Nested/related | (Parent rule) |

**Relationships:** Belongs to **Data Quality Rule** (and optionally to a Data Element).

---

### 3.8 Data Concern

| Element type   | Elements |
|----------------|----------|
| Core content   | Title, Description |
| Metadata       | Domain ID, Status, Application ID, EUC ID, Endpoint ID, Data Element ID, Created at, Updated at |
| Nested/related | (Referenced Application, EUC, Endpoint, Data Element) |

**Relationships:** Belongs to **Domain**; optionally linked to **Application**, **EUC**, **Endpoint**, **Data Element**.

---

### 3.9 User

| Element type   | Elements |
|----------------|----------|
| Core content   | (Name, email – as used in admin) |
| Metadata       | Role, Created at, Updated at |
| Nested/related | (Admin context) |

**Relationships:** Used in admin/user management; not domain-scoped in the same way as governance objects.

---

### 3.10 Metrics (concept)

Metrics are **aggregates** (counts, KPIs), not entities users create or edit. We treat them as a **concept** tied to Domain (or global): they answer “how many of each object type?” and support dashboards and KPIs. No CTA inventory for “Metrics” as an object; CTAs are on the objects that metrics describe.

---

## 4. CTA Inventory

**Calls to action (CTAs)** are the main entry points to interaction flows. We list possible CTAs **per object** so we know where interaction design will be needed and can prioritize.

### 4.1 Purpose of the CTA Inventory

- **Bridge** from object-based system design to interaction design.
- **Brainstorm** actions in a structured way (object by object).
- **Validate** with users: “Are these the right doors?” before designing what happens when the user clicks.
- **Estimate** scope: each CTA may imply forms, validation, error handling, and microcopy.

### 4.2 Low-fidelity CTA pass (workshop)

Do this collaboratively (e.g. with product, design, engineering):

- For **each object** on the object map, ask: “What might a user want to **do** to this object?”
- Capture CTAs as a short list per object (e.g. on sticky notes or a doc). Examples for **Data Element**: View, Edit, View lineage, View/Add data concerns, View/Add DQ rules, View SORs, Export. For **Data Concern**: View, Edit, Change status, Link to different Application/EUC/Endpoint/Data Element.
- Allow the conversation to **update the object map**: e.g. “Users want to suggest substitute ingredients” might add a nested object “Suggested substitutes” to Ingredient (from the article). In DMP, “Users want to bulk-upload CDEs” reinforces that Data Element has a Create/Bulk create CTA and might surface Bulk as a shared action.

Keep the list broad at first; refine in the high-fidelity pass.

### 4.3 High-fidelity CTA Inventory (matrix)

Use a spreadsheet or table to capture, for each object-derived CTA:

| Column | Purpose |
|--------|---------|
| **Object** | Domain, Data Element, Application, etc. |
| **CTA** | Verb + object (e.g. “View Data Concern”, “Edit Data Element”) |
| **Why** | User or business goal; what this CTA ladders up to |
| **Who** | Persona, role, or permission (e.g. steward, admin) |
| **Where** | Where the CTA lives: table row, side panel card, page header, bulk page |
| **Complexity** | Low / medium / high (for estimation) |
| **Priority** | Critical for launch / later phase / to validate |
| **Questions** | Open decisions or research needed |

Example rows (illustrative):

| Object        | CTA              | Why                    | Who     | Where                    | Complexity | Priority |
|---------------|------------------|------------------------|---------|---------------------------|------------|----------|
| Data Element  | View detail      | Inspect one CDE        | Steward | Row click → side panel    | Low        | Launch   |
| Data Element  | View lineage     | Understand lineage      | Steward | Row action / side panel   | Medium     | Launch   |
| Data Element  | Open Data Concern| Drill to concern        | Steward | Side panel card click    | Low        | Launch   |
| Data Concern  | View full detail | See all fields         | Steward | Card click → modal        | Low        | Launch   |
| Data Element  | Edit             | Correct CDE metadata   | Steward | Side panel / modal       | Medium     | Later    |
| Domain        | Select           | Scope lists and metrics| User    | Sidebar selector         | Low        | Launch   |

Maintain this matrix in `docs/` or a linked artifact and update it when adding or changing features.

### 4.4 CTAs and our UI patterns

Our [design guidance](design-guidance.md) already reflects an object-first, CTA-driven structure:

- **Table row click** → “View this object” → **Side panel** (detail + related objects).
- **Card in side panel** → “View this related object in full” → **Full-context modal**.
- **Page-level actions** (e.g. Bulk upload, Export) → **Bulk page** or other flows.

So the CTA Inventory should explicitly map each CTA to one of: **row click**, **side panel card click**, **header/button**, **sidebar**, or **dedicated page**.

---

## 5. Validation Before Interaction Design

- **Object + CTA validation:** Before building complex flows (e.g. “Edit Data Element”), validate with users that:
  - The **objects** and **relationships** match their mental model (e.g. Domain → Data Elements → Endpoints).
  - The **CTAs** we list are the right “doors” (e.g. “View lineage” on Data Element, “View full concern” from a card).
- **Prototype:** A clickable prototype that lets users move from object to object (e.g. list → side panel → card → modal) with **no** real interaction behind the CTAs is enough to test “Do we have the right objects and the right buttons?”
- **Then** design the actual interactions (forms, validation, errors, success states) for each CTA we commit to.

---

## 6. Summary

| Step | What we do |
|------|------------|
| 1. Objects first | Define Domain, Data Element, Application, EUC, Endpoint, DQ Rule, DQ Exception, Data Concern, User (and Metrics as concept). |
| 2. Object map | For each object: core content, metadata, nested/related objects; relationships between objects. |
| 3. CTA Inventory (low-fi) | Workshop: “What might the user do to this object?” per object; update object map if new elements emerge. |
| 4. CTA Inventory (high-fi) | Matrix: Object, CTA, Why, Who, Where, Complexity, Priority, Questions. |
| 5. Map to UI | Align CTAs with pages, table row click, side panel, cards, full-context modals (see design-guidance.md). |
| 6. Validate | Test object framework + CTAs with users before heavy interaction design. |
| 7. Interaction design | Design the flows triggered by each CTA (forms, errors, transitions). |

This keeps DMP’s functionality rooted in a clear, object-oriented system and makes the transition from “what we have” to “what users do” explicit and manageable.

**Reference:** [OOUX: A Foundation for Interaction Design](https://alistapart.com/article/ooux-a-foundation-for-interaction-design/) — Sophia V. Prater, A List Apart (2016).
