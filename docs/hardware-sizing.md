# Hardware Sizing — 200 Concurrent Users, Enterprise Scale

Estimate for **200 concurrent users**, **enterprise-scale data** (e.g. Citigroup-like), **&lt;200 ms** API response time, **internally hosted**, **containerized**. Database scales vertically; API scales horizontally; frontend from CDN.

**Load assumption:** 200 concurrent users → peak API load on the order of **~40 requests/second** (not 400+). At 40 RPS, 25 ms/request is ample; &lt;200 ms is easily achievable with modest hardware. Sizing below targets this load; storage remains sized for enterprise data volume.

**Batch / non-standard workloads:** Batch jobs, bulk processing, report generation, and other non-interactive work run on **separate worker hardware**, scaled as needed. They are **out of scope** for the sizing and cost totals below; add worker capacity and cost based on your own job mix and schedule.

---

## Redis cache tier

| Resource | Recommendation | Rationale |
|----------|----------------|-----------|
| **CPU** | **1–2 vCPU** | Single Redis process; 40 RPS cache traffic is trivial. |
| **RAM** | **2–4 GB** | Domain tree + hot list responses; small working set at this load. |
| **Storage** | **Minimal (persistence optional)** | 10–20 GB if RDB/AOF; otherwise ephemeral. |
| **Replicas** | **1 node** | Replica optional for HA; not needed for capacity. |

**Usage patterns (suggested):**

- **Domain tree** — Cache full L0→L1→L2→L3 tree (invalidate on domain create/update/delete).
- **List responses** — Cache keyed by `(entity_type, domain_id, scope)` with TTL (e.g. 60–300 s); invalidate on create/update/delete for that domain/entity.
- **Sessions / JWT blocklist** (optional) — Store session or revoked tokens if you move off stateless JWT-only.

**Config:** Set `REDIS_URL` (or host/port/password) in backend config; use connection pooling (e.g. `redis.asyncio` or `redis-py` with connection pool) so each API process uses a small pool to Redis.

---

## Summary table (all tiers, including Redis)

| Tier | Role | vCPU (total) | RAM (total) | Storage | Notes |
|------|------|--------------|-------------|---------|--------|
| **Database** | PostgreSQL | 4–8 | 16–32 GB | 500 GB–1 TB NVMe | Single instance; 40 QPS is light; RAM/storage for enterprise data. |
| **API** | FastAPI (×1–2) | 2–4 | 4–8 GB | — | 1–2 replicas; 40 RPS is trivial per process. |
| **Redis** | Cache | 1–2 | 2–4 GB | 0–20 GB | Domain tree, list cache, optional session. |
| **Object store** | MinIO | 2–4 | 4–8 GB | 500 GB–2 TB | Bulk upload/export; compute light. |
| **Pooler** | PgBouncer | 1 | 2 GB | — | Transaction pooling. |
| **LB** | Internal LB | 1 | 2 GB | — | In front of API. |
| **Workers** | Batch / non-standard | — | — | — | Separate hardware; scale as needed; not in totals. |
| **Total (ballpark)** | | **11–20** | **29–56 GB** | **1–3 TB** | Excludes CDN, workers. |

---

## Effect of Redis on other tiers

- **Database:** Fewer repeated reads for domain tree and hot lists → lower QPS and better chance of staying under 200 ms.
- **API:** Same or slightly more CPU per request when cache hit (serialize + network); less DB wait on cache hit, so net latency improvement for cached endpoints.

For full context (DB, API, MinIO, PgBouncer, LB, and &lt;200 ms checklist), see the original sizing discussion or expand this doc with those sections.

---

## COB/DR environment (25% performance capability)

DR is sized at **25% of production performance** — enough for COB (close-of-business) reporting, testing, and failover during an outage, not full user load.

| Tier | Production (100%) | COB/DR (25%) | Notes |
|------|-------------------|--------------|--------|
| **Database** | 4–8 vCPU, 16–32 GB RAM, 500 GB–1 TB | **2–4 vCPU, 8–16 GB RAM, 500 GB–1 TB** | Standby/smaller instance; storage holds full copy. |
| **API** | 2–4 vCPU, 4–8 GB (1–2 replicas) | **1–2 vCPU, 2–4 GB (1 replica)** | 25% compute/RAM. |
| **Redis** | 1–2 vCPU, 2–4 GB | **1 vCPU, 1–2 GB** | Single node; cold or warm from sync. |
| **Object store** | 2–4 vCPU, 4–8 GB, 500 GB–2 TB | **1–2 vCPU, 2–4 GB, 500 GB–2 TB** | Same data copy; minimal compute. |
| **Pooler** | 1 vCPU, 2 GB | **1 vCPU, 1 GB** | |
| **LB** | 1 vCPU, 2 GB | **1 vCPU, 1 GB** | |
| **Total** | **11–20 vCPU, 29–56 GB, 1–3 TB** | **4–10 vCPU, 14–28 GB, 1–3 TB** | DR storage ≈ prod (data replica). |

---

## Cost estimate (production + COB/DR)

**Assumptions:** Internally hosted; containerized workloads mapped to equivalent VM/instance sizes; list prices as reference (no reserved/commit discounts). COB/DR at 25% compute/RAM; storage for DR ~same as prod (replicated data). USD, monthly.

### Reference unit rates (list-price equivalent)

| Resource | Rate (monthly) | Notes |
|----------|----------------|--------|
| Compute (vCPU) | $50–70 / vCPU | General-purpose (e.g. D-series / m6i equivalent). |
| Memory (RAM) | $4–6 / GB | Included in VM sizing; shown for transparency. |
| Block storage (NVMe/SSD) | $0.10–0.15 / GB | DB and VM disks. |
| Object storage | $0.02–0.04 / GB | MinIO/S3-style (bulk/export). |

### Production (100%) — midpoint (~40 RPS)

| Tier | vCPU | RAM (GB) | Storage (GB) | Compute (approx.) | Storage (approx.) |
|------|------|----------|--------------|-------------------|-------------------|
| Database | 6 | 24 | 750 | $300–420 | $75–110 |
| API | 3 | 6 | — | $150–210 | — |
| Redis | 1 | 4 | 10 | $50–70 | $1–2 |
| MinIO | 3 | 6 | 1,000 | $150–210 | $20–40 (object) |
| PgBouncer | 1 | 2 | — | $50–70 | — |
| LB | 1 | 2 | — | $50–70 | — |
| **Production total** | **15** | **44** | **1,760** | **~$750–1,050** | **~$96–152** |

**Production total (monthly): ~$850–1,200** (compute + block + object storage).

### COB/DR (25% capability)

| Tier | vCPU | RAM (GB) | Storage (GB) | Compute (approx.) | Storage (approx.) |
|------|------|----------|--------------|-------------------|-------------------|
| Database | 3 | 12 | 750 | $150–210 | $75–110 |
| API | 1 | 2 | — | $50–70 | — |
| Redis | 1 | 1 | 10 | $50–70 | $1–2 |
| MinIO | 1 | 2 | 1,000 | $50–70 | $20–40 (object) |
| PgBouncer | 1 | 1 | — | $50–70 | — |
| LB | 1 | 1 | — | $50–70 | — |
| **COB/DR total** | **7** | **19** | **1,760** | **~$350–560** | **~$96–152** |

**COB/DR total (monthly): ~$450–710** (compute + storage; storage similar to prod for data copy).

### Combined monthly cost (reference)

| Environment | Compute | Storage | **Total/month** |
|-------------|---------|---------|------------------|
| Production | $750–1,050 | $96–152 | **~$850–1,200** |
| COB/DR (25%) | $350–560 | $96–152 | **~$450–710** |
| **Combined** | **~$1,100–1,610** | **~$192–304** | **~$1,300–1,910** |

**Annual run rate (production + COB/DR): ~$15.6k–23k** at list-price equivalent.

### Internal hosting notes

- **Chargeback / internal rates:** If your org uses a blended $/vCPU or $/GB rate, apply it to the vCPU and RAM totals above; storage often has a separate rate. Typical internal blended (including power, cooling, depreciation, labor) is often **$40–80 per vCPU per month** equivalent → same ballpark or 10–20% lower than list-price reference.
- **Reserved / committed:** 1- or 3-year commitments usually reduce compute by **30–50%**; apply to production and optionally DR if committed long term.
- **Exclusions:** Licensing (OS, PostgreSQL if commercial, Redis if commercial), networking, backup/archive, monitoring, and CDN are not included; add per your standards.
