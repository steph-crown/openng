# `apps/api` — binding architecture conventions

This file is **normative** for humans, Cursor, and other LLMs working in this directory. If a change conflicts with these rules, **update this file and CLAUDE.md in the same commit** as the code change.

---

## Architectural decisions (chosen alternative → rationale)

Short **decision records**: what we picked, what we rejected or deferred, and why. When a new cross-cutting choice appears, add a row here in the same PR that introduces it.

| Decision | Chosen | Rejected / alternative | Rationale |
|----------|--------|------------------------|-----------|
| Surrogate primary keys | `BIGSERIAL` for row ids; `BIGINT` for foreign keys | UUID / `uuid` everywhere | Smaller indexes and rows than 16-byte UUIDs; monotonic ids simplify debugging, ad hoc SQL, and log correlation. UUIDs are reserved for cases that need opaque, client- or peer-generated ids without a central allocator (not the default for internal tables). |
| Resource factory and auth | Pass `authMiddleware` via `CreateResourceRouterOptions` at mount time | Factory imports `combinedAuth` (or any concrete middleware) | Avoids tight coupling and circular edges between `resource-factory/` and `middleware/`; the composition layer (`resources/*/index.ts`, `v1/`) owns policy. |
| API discovery registry | In-memory list populated where routers are registered | Shared DB table for “registered resources” | Simpler ops and a single source of truth in code; no migration drift between code and DB. Revisit if multi-node registration must be dynamic. |
| Redis access | `getRedis()` in `infrastructure/redis.ts` | `new Redis()` at call sites | One connection policy, health semantics, and null handling when `REDIS_URL` is unset; avoids connection leaks and inconsistent config. |
| Request observability | One **wide event** per request (`WideEvent` + `requestLogger`) | Many ad hoc log lines per request | One JSON line per request preserves correlation, keeps SigNoz queries field-based, and avoids log reordering noise. |
| Hand-written domains | `router` → `service` → `repositories` with Drizzle only in repositories | Drizzle or raw SQL in route files | Testable boundaries, one place for SQL shape per domain, routes stay thin HTTP + validation. |
| Global error handling | `app.onError(errorHandler)` | `try/catch` in every route | Consistent error envelope and no duplicated handler boilerplate. |
| SQL in application code | Drizzle query builder only | String-built SQL in TS | Parameterization by construction; raw SQL belongs in `packages/db` stored procedures for migrations, not in route handlers. |

---

## Naming: `resource-factory/` vs `resources/`

| Path | Purpose |
|------|---------|
| `src/resource-factory/` | **Only** the shared ResourceFactory: `createResourceRouter`, filters, pagination, registry, `resource-config`, JSON helpers, dynamic select. No domain-specific business logic. **MUST NOT** import `middleware/auth-context` or any auth implementation — callers pass `CreateResourceRouterOptions` (`authMiddleware`) at composition time. |
| `src/resources/{domain}/` | **Hand-written** API domains (e.g. `ref/`). Each domain has **routes → service → repositories**, same as `auth/` and `account/`. |

**MUST NOT** place factory machinery under `resources/`. **MUST NOT** place domain routers under `resource-factory/`.

---

## Top-level domain folders vs `resources/`

Use this decision table; **do not** invent new top-level folders without updating this file.

| Put code here | When |
|---------------|------|
| **`auth/`** | End-user authentication and session lifecycle: magic links, cookies, session verification, API-key **resolution** (validating the Bearer token against the DB/cache). Routes under `/auth/*`. |
| **`account/`** | Authenticated **account** surface: API key CRUD, settings keyed to the logged-in user. Routes under `/account/*`. |
| **`resources/{name}/`** | **Versioned public data APIs** under `/v1/...` that are **not** solely auth/account: reference data, datasets exposed to developers, explorer-friendly JSON. Each folder is a **data domain** with `router` → `service` → `repositories`. Examples: `ref`, future `holidays`. |
| **`resource-factory/`** | Shared machinery for **ResourceConfig**-driven list/meta/detail routes — not a business domain. |
| **`registry/`** | **API discovery only**: JSON list of registered factory resources for `GET /meta` and `GET /v1` — no business rules. |

**MUST NOT** put new auth flows under `resources/`. **MUST NOT** put public dataset routes under `auth/` or `account/` unless the URL space is intentionally `/auth` or `/account` (they are not `/v1` data APIs).

---

## Registry discovery (`GET /meta` and `GET /v1`)

- **MUST** implement the response body in `registry/build-registry-response.ts` (`buildRegistryResponse`).
- **MUST** mount the same behavior via `createRegistryListRouter()` from `registry/list-router.ts` for both `app.route("/meta", …)` and `v1Router.route("/", …)` — **MUST NOT** duplicate diverging handlers in `v1/` for the same JSON.

---

## Auth middleware location

- **MUST** import `sessionAuth`, `apiKeyAuth`, and `combinedAuth` from `middleware/auth-context.ts` only.
- **MUST NOT** reintroduce `auth/middleware.ts`; auth **services** stay under `auth/services/`.

---

## Layering (all hand-written domains)

Applies to `auth/`, `account/`, `resources/*`, and future `admin/`, etc.

| Layer | Responsibility | MUST / MUST NOT |
|-------|----------------|-----------------|
| `routes.ts` / `router.ts` | HTTP: parse params/query, Zod where used, call **one** service method per handler, return `c.json` / status. | **MUST NOT** import `@openng/db` table symbols. **MUST NOT** contain multi-step Drizzle queries or business rules. |
| `services/` | Orchestration, response shaping, `db.transaction` when multiple writes must commit together. | **MUST** call repositories for persistence. **MUST NOT** embed raw SQL strings. |
| `repositories/` | Named Drizzle operations; accept `DbExecutor` (`db` or `tx`). | **MUST** be the only layer that uses Drizzle table imports for that domain’s queries. |

**Exception:** `resource-factory/` generates list/detail/meta from `ResourceConfig`; that is not a violation — do not duplicate that with hand-written repositories for the same resource.

---

## Middleware order (`app.ts`)

Registration order **MUST** be:

1. `app.onError(errorHandler)`
2. `app.use("*", requestLogger)` — **first** among request middleware so every request (including `OPTIONS`) runs inside the wide-event wrapper
3. `app.use("*", corsMiddleware)` — after request logger
4. Route mounts

**MUST NOT** put CORS before `requestLogger` without updating this document and failing review.

---

## Redis

- **MUST** use `getRedis()` from `src/infrastructure/redis.ts` for application Redis access (API key cache, etc.).
- **MUST** use `pingRedis()` from the same module for health checks — **MUST NOT** construct standalone `new Redis(...)` in `health/` or elsewhere except inside `infrastructure/redis.ts`.
- `getRedis()` returns `null` when `REDIS_URL` is unset; callers **MUST** handle `null` (skip cache) without throwing at import time.

---

## Rate limiting

Not implemented yet. **MUST NOT** add ad-hoc per-route throttling scattered in handlers; when implemented, it belongs as dedicated middleware (see ROADMAP) applied after auth context is available where required.

---

## Testing (planned)

Until automated tests land:

- **SHOULD** add integration tests under `apps/api/test/` or `apps/api/src/**/*.test.ts` (tooling TBD) for: health, auth happy paths, ref list endpoints, and **one** factory-backed resource when it exists.
- **MUST** run `pnpm exec tsc --noEmit -p apps/api` before merge for API changes.

A fuller test plan will be added when the first test runner is wired in CI.

---

## Documentation sync

Any change to:

- folder names under `src/`,
- middleware order,
- Redis usage,
- layering rules for `resources/`,
- a **normative architectural decision** (add or revise a row under **Architectural decisions** above),

**MUST** update:

1. This file  
2. [`CLAUDE.md`](../../CLAUDE.md) (root) — API layout and cross-references  
3. [`.cursor/rules/api.mdc`](../../.cursor/rules/api.mdc) — short MUST list for the editor agent  
