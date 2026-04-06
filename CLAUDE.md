# CLAUDE.md — OpenNG Project Intelligence

This file is the authoritative context document for AI coding assistants (Claude, Cursor, etc.) working on the OpenNG codebase. Read this before writing any code.

**Maintenance rule:** Every time a structural decision, naming convention, architectural pattern, or workflow changes, this file must be updated in the same PR or commit that introduces the change. Do not let this file drift from reality.

---

## What This Project Is

**OpenNG** is an open-source REST API platform that makes Nigerian public data accessible to developers. Data that exists in government PDFs, broken portals, and Excel files is collected, cleaned, validated, and served through a clean versioned API.

Primary domain: `openng.dev`
API subdomain: `api.openng.dev`
GitHub: `github.com/stephcrown/openng` (update when org is created)

**The product has five surfaces:**

- `api.openng.dev` — the REST API (Hono, Node.js)
- `openng.dev` — landing page, data explorer, dashboard, contribute form (Next.js)
- `docs.openng.dev` — documentation (Fumadocs, Next.js)
- A staging database pipeline (PostgreSQL + stored procedures)
- Scraper jobs (TypeScript, GitHub Actions cron)

---

## Monorepo Structure

```
openng/
├── apps/
│   ├── api/                    ← Hono API server → api.openng.dev
│   │   ├── src/
│   │   │   ├── core/           ← factory, logger, wide-event, context-types, global *.middleware.ts
│   │   │   ├── utils/          ← cross-domain pure helpers (no DB/HTTP)
│   │   │   ├── auth/           ← routes, services, repositories, domain middleware, cleanup
│   │   │   ├── resources/      ← one folder per data domain
│   │   │   │   ├── fuel/
│   │   │   │   ├── food-prices/
│   │   │   │   ├── holidays/
│   │   │   │   └── ...
│   │   │   ├── admin/          ← internal-only routes (API keys live under /dashboard in Group 6)
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── web/                    ← Next.js → openng.dev
│   │   ├── app/
│   │   │   ├── page.tsx                    ← / (landing page)
│   │   │   ├── explore/
│   │   │   │   ├── page.tsx                ← /explore (resource cards grid)
│   │   │   │   └── [resource]/
│   │   │   │       └── page.tsx            ← /explore/fuel (table + filters)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx                ← /dashboard (overview)
│   │   │   │   ├── keys/
│   │   │   │   │   └── page.tsx            ← /dashboard/keys
│   │   │   │   └── usage/
│   │   │   │       └── page.tsx            ← /dashboard/usage
│   │   │   └── contribute/
│   │   │       └── page.tsx                ← /contribute
│   │   └── package.json
│   │
│   └── docs/                   ← Fumadocs → docs.openng.dev
│       ├── app/
│       │   └── docs/
│       │       ├── page.tsx
│       │       ├── getting-started/
│       │       ├── resources/
│       │       └── api-reference/          ← auto-generated from OpenAPI
│       ├── content/            ← MDX files (written documentation)
│       └── package.json
│
├── packages/
│   ├── db/                     ← Drizzle ORM schema, migrations, helpers
│   │   ├── src/
│   │   │   ├── public/         ← tables in PostgreSQL "public" schema
│   │   │   ├── staging/        ← tables in "staging" schema
│   │   │   ├── ref/            ← tables in "ref" schema (states, LGAs)
│   │   │   ├── analytics/      ← tables in "analytics" schema
│   │   │   └── procedures/     ← SQL stored procedure files
│   │   └── package.json
│   │
│   ├── scrapers/               ← one scraper module per resource
│   │   ├── src/
│   │   │   ├── fuel/
│   │   │   ├── food-prices/
│   │   │   └── shared/         ← PDF parser, HTTP client, R2 uploader
│   │   └── package.json
│   │
│   ├── ui/                     ← shared component library
│   │   ├── src/
│   │   │   ├── components/     ← buttons, tables, filters, cards
│   │   │   └── tokens/         ← design tokens, colors, typography
│   │   └── package.json        ← used by both apps/web and apps/docs
│   │
│   └── shared/                 ← types, response formatters, Zod schemas
│       └── package.json
│
├── data/
│   └── seeds/                  ← versioned seed files (static resources only)
│       ├── holidays/
│       ├── postal-codes/
│       └── ...
│
├── scripts/
│   ├── import-excel.ts         ← CLI: Excel → staging DB
│   ├── validate-staging.ts     ← CLI: run validation procedures
│   ├── migrate-to-prod.ts      ← CLI: run migration procedures
│   └── cleanup-staging.ts      ← CLI: purge migrated staging records
│
├── .github/
│   └── workflows/
│       ├── deploy.yml          ← CD to VPS
│       ├── scraper-fuel.yml    ← monthly fuel price scraper
│       ├── scraper-food.yml    ← monthly food price scraper
│       └── test.yml            ← CI tests
│
├── docker-compose.yml          ← local dev: postgres, redis, signoz
├── pnpm-workspace.yaml
├── CLAUDE.md         ← This file
└── turbo.json
```

**Package naming convention:** All internal packages use the `@openng/` scope.

- `@openng/ui`, `@openng/db`, `@openng/shared`, `@openng/scrapers`

---

## API application layout (`apps/api`)

Hand-written domains (`auth`, `admin`, `dashboard`, …) use the same vertical structure:

| Layer | Role |
| ----- | ---- |
| `routes.ts` | HTTP only: Zod validation, call service method(s), map to JSON / cookies / status. No Drizzle, no transactions. |
| `services/` | Orchestration and business rules; owns `db.transaction(...)` when multiple writes must commit together. Calls repositories and side effects (e.g. email). |
| `repositories/` | Persistence only: named Drizzle operations (`findUserByEmail`, `invalidateUnusedMagicLinksForUser`, …). Accept a `DbExecutor` (`db` or transaction `tx`) so multi-step writes use one transaction. |

**Global vs domain middleware:** App-wide middleware (request logging, future CORS) lives in `apps/api/src/core/` as `*.middleware.ts`. There is no top-level `src/middleware/` folder. Domain-specific middleware (e.g. `sessionAuth`) lives as `auth/middleware.ts` next to that domain.

**Cross-domain utils:** `apps/api/src/utils/` — pure functions used by more than one domain. Domain-only helpers stay inside that domain. Do not put Drizzle or Hono in `utils/`.

**Hono context types:** `apps/api/src/core/context-types.ts` defines `AppVariables` and `SessionUser` for `c.get` / `c.set`.

**ResourceFactory (`/v1/{resource}`):** Per-resource folders remain `config` + factory registration only. Shared list/detail query logic belongs in `core/` (factory + repositories there), not duplicate per-resource repositories. Extend the factory instead of bypassing it.

**Discipline (apply without waiting for a prompt):**

- **Repositories:** Add a repository function when the operation is named, reusable, or mockable—not a one-line pass-through that duplicates intent everywhere. Avoid anemic layers; avoid stuffing unrelated queries into one god file (split by table or aggregate).
- **Transactions:** Any multi-table write that must succeed or fail together runs inside `db.transaction`; pass the same `tx` into repository calls—never commit half a use case across separate top-level `db` calls.
- **Services:** Split oversized services by use case (e.g. `magic-link` vs `session`) when a single file becomes hard to navigate.
- **Routes:** Prefer one clear service entry point per handler; two calls are acceptable when concerns are independent. If two steps are always paired, expose one service method that orchestrates internally.
- **Middleware:** Identification and cheap reads only; call repositories or a small shared session helper—no multi-step business workflows in middleware.
- **YAGNI:** Full three layers are required for real domains; trivial experimental routes need not justify a repository until they grow.

---

## Tech Stack

| Concern         | Tool                   | Notes                                              |
| --------------- | ---------------------- | -------------------------------------------------- |
| Language        | TypeScript             | Strict mode everywhere                             |
| Package manager | pnpm                   | Workspaces, never use npm or yarn                  |
| Monorepo        | Turborepo              | `turbo dev`, `turbo build`, `turbo lint`           |
| API framework   | Hono (Node.js)         | `apps/api` only                                    |
| Frontend        | Next.js App Router     | `apps/web` and `apps/docs`                         |
| Docs framework  | Fumadocs               | `apps/docs` only                                   |
| ORM             | Drizzle ORM            | In `packages/db`                                   |
| Database        | PostgreSQL 16          | 4 schemas: `public`, `staging`, `ref`, `analytics` |
| Validation      | Zod                    | Scraper output validation and API input validation |
| Process manager | PM2                    | Production only, on VPS                            |
| Reverse proxy   | Caddy                  | Production only, on VPS                            |
| Logging         | Pino                   | Structured JSON logger inside the Node.js app      |
| Observability   | SigNoz + OpenTelemetry | SigNoz collects logs/metrics/traces via OTel SDK   |
| Rate limiting   | Redis + sliding window counter | Memory-efficient, near-exact accuracy (~0.003% error) |
| Object storage  | Cloudflare R2          | Raw scraper source archive only                    |

---

## Infrastructure

**Production:** Hetzner VPS (CAX21 — 3 ARM vCPU, 4GB RAM)
**CDN/DNS/WAF:** Cloudflare (free tier)

**Service → port mapping on VPS:**

```
api.openng.dev  → Hono API         → localhost:3000
openng.dev      → Next.js web      → localhost:3001
docs.openng.dev → Fumadocs         → localhost:3002
                  PostgreSQL        → localhost:5432 (internal only)
                  Redis             → localhost:6379 (internal only)
                  SigNoz            → localhost:3301 (internal only)
```

Caddy handles TLS, routing, and proxying. No port is exposed externally except 80 and 443.

**Local development:**

```bash
docker compose up -d   # starts Postgres, Redis, SigNoz
turbo dev              # starts all apps in watch mode
```

The Hono API and Next.js apps run natively (not in Docker) in development. Docker is only for infrastructure dependencies.

**Local dev ports** mirror production: API on 3000, Web on 3001, Docs on 3002. Docker-exposed ports are offset to avoid collisions with host services: Postgres on 5434 (maps to container 5432), Redis on 6380 (maps to container 6379).

---

## API Architecture — The ResourceFactory

**This is the most important pattern in the codebase.** Understand it before touching `apps/api`.

Every data resource (fuel prices, holidays, schools, etc.) is defined by a single config object. The `createResourceRouter` factory reads the config and generates all four routes automatically:

```
GET /v1/{resource}          → list with filters and pagination
GET /v1/{resource}/meta     → resource metadata (MUST be registered before /:id)
GET /v1/{resource}/:id      → single record
GET /v1/{resource}/export   → bulk CSV/JSON (paid tier only)
```

**Adding a new resource requires exactly three things:**

1. Create `apps/api/src/resources/{name}/config.ts` — the ResourceConfig object
2. Create `apps/api/src/resources/{name}/index.ts` — call `createResourceRouter(config, db)`
3. Add one line to `apps/api/src/index.ts` — `app.route('/v1/{name}', {name}Router)`

Nothing else. No controllers, no query builders, no middleware, no error handlers. The factory provides all of it.

**Never bypass the factory** to write a custom route handler for a standard resource. If the factory doesn't support something you need, extend the factory itself.

**Route registration order matters:** Always register `/meta` before `/:id` in the factory to prevent "meta" being treated as an ID value.

**Reference data endpoints** are NOT factory-generated. States and LGAs don't follow the ResourceConfig pattern (no `source_url`, `source_date`, `is_active`). They have dedicated routes under `/v1/ref/`:

```
GET /v1/ref/states             → all 36 states + FCT (optional filter: ?geo_zone=)
GET /v1/ref/states/:slug       → single state by slug (e.g., /v1/ref/states/lagos)
GET /v1/ref/states/:slug/lgas  → LGAs for a state
GET /v1/ref/lgas?state=:slug   → LGAs filtered by state (required filter)
```

---

## Database Architecture

**One database, four PostgreSQL schemas.** All four schemas live in a single `openng` database — in both local dev and production. Schemas are namespaces within the database, not separate databases.

| Schema      | Purpose                                      | Who writes                       |
| ----------- | -------------------------------------------- | -------------------------------- |
| `public`    | Production resource tables the API reads     | Data migration stored procedures only |
| `staging`   | Imported data awaiting validation/migration   | Import scripts and scrapers      |
| `ref`       | Reference/lookup tables (states, LGAs, etc.) | Initial seed only (idempotent). Exposed via `/v1/ref/*` API endpoints. |
| `analytics` | Usage events, API key activity               | API async batch writer           |

The staging schema exists on the production database. The data pipeline runs against the live database: scrapers/imports push data into `staging.*`, stored procedures validate it, then promote valid rows to `public.*`. Staging rows are cleaned up after 90 days.

**The API reads exclusively from `public` and `ref`. It never writes to `public` directly.** All writes to `public` go through data migration stored procedures.

**Two types of migrations exist — do not confuse them:**

1. **Schema migrations (Drizzle-kit)** — structural changes to table definitions (add column, create index, alter type). Generated by `drizzle-kit generate`, applied by `drizzle-kit migrate`. The CD pipeline runs this on every deployment to apply pending structural changes.

2. **Data migrations (stored procedures)** — moving validated rows from `staging.*` to `public.*`. These are the `staging.migrate_{resource}()` SQL functions called by `scripts/migrate-to-prod.ts`. These run per data import cycle, not per deployment.

**Reference data seeding** (states, LGAs) runs once during initial setup via `packages/db/src/seed-ref.ts`. The seed script is idempotent (`ON CONFLICT DO NOTHING`), so re-running is safe. The CD pipeline does NOT re-seed on every deploy.

**Standard prod table columns** (every table has these):

```sql
id          BIGSERIAL PRIMARY KEY
source_url  TEXT NOT NULL
source_date DATE NOT NULL
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
is_active   BOOLEAN NOT NULL DEFAULT TRUE
```

**Standard staging-only columns** (not in prod):

```sql
is_valid        BOOLEAN DEFAULT NULL
validation_note TEXT DEFAULT NULL
flagged         BOOLEAN DEFAULT NULL
flagged_reason  TEXT DEFAULT NULL
migrated_at     TIMESTAMPTZ DEFAULT NULL
import_batch_id UUID NOT NULL
```

**Foreign key naming:** Always `{referenced_table_singular}_id` — e.g. `state_id`, `lga_id`, `commodity_id`

**Table naming:** `snake_case`, plural — e.g. `fuel_prices`, `schools`, `postal_codes`

**Stored procedure naming:**

- `staging.validate_{resource}` — validates a staging batch
- `staging.migrate_{resource}` — migrates valid rows to prod

---

## Data Pipeline Workflow

When adding a new resource, the flow is always:

```
Research → Excel seed file → staging DB → validate → migrate to prod → API
```

**Step by step:**

1. Document the data source in `resources/{name}/RESEARCH.md`
2. Collect data into an Excel file (manual or scraper output)
3. Import to staging: `pnpm tsx scripts/import-excel.ts --resource {name} --file path/to/file.xlsx`
4. Validate: `pnpm tsx scripts/validate-staging.ts --resource {name} --batch {batch_id}`
5. Review failures, fix data
6. Migrate: `pnpm tsx scripts/migrate-to-prod.ts --resource {name} --batch {batch_id}`
7. Cleanup after N cycles: `pnpm tsx scripts/cleanup-staging.ts --resource {name} --older-than 90d`

**Seed files in git:** Only static/manually-collected resources (holidays, postal codes, courts, schools). Scraped resources (fuel prices, food prices) never commit their intermediate Excel to git — it goes to a temp path and is discarded.

---

## API Versioning

**Per-resource versioning, not global.** The URL structure is `api.openng.dev/v{N}/{resource}`.

- A version bump happens **only** for breaking changes to a specific resource
- Adding fields, filters, or new resources is non-breaking — no version bump
- New resources launch at the current stable version
- Deprecated versions get `Deprecation`, `Sunset`, and `Link` response headers
- There is no global "v2 of everything"

---

## Authentication & API Keys

- Keys are prefixed `ong_live_` followed by nanoid(32)
- Keys are SHA-256 hashed before storage — plaintext never persists
- Keys are passed via `Authorization: Bearer ong_live_xxx...` header
- Redis caches key lookups with 5-minute TTL to avoid per-request DB hits
- Anonymous requests (no key) are allowed but rate-limited by IP

**User authentication** uses passwordless magic links:

1. User submits email at `POST /auth/magic-link`
2. Server finds or creates the user, **invalidates any unused** magic link rows for that user, generates a **new** cryptographically random token, hashes it (SHA-256), stores the hash with a 15-minute expiry
3. Server sends the raw token in a link via Resend: `sendMagicLink` builds the URL and calls `sendMail` (all transactional email goes through `sendMail`)
4. User opens the link → `GET /auth/verify?token=xxx` on the API (verify URL uses `API_URL`, falling back to `APP_URL` if unset)
5. Server hashes the incoming token, matches against stored hash, checks expiry and single-use
6. On success: marks email verified if needed, creates a session, sets `openng_session` `HttpOnly` cookie
7. Session cookie is `HttpOnly`, `Secure` (in production), `SameSite=Lax` with 30-day sliding expiry (`last_active_at` / `expires_at` refreshed on authenticated requests)

**Auth-related tables:**

- `users` — `id`, `email` (unique), `email_verified_at`, `created_at`, `updated_at`, `is_active`
- `magic_link_tokens` — `id`, `user_id` (FK), `token_hash` (unique), `expires_at`, `used_at`, `created_at`
- `sessions` — `id`, `user_id` (FK), `session_token_hash` (unique), `expires_at`, `created_at`, `last_active_at`
- `api_keys` — `id`, `user_id` (FK), `key_hash` (unique), `key_prefix`, `name`, `tier`, `created_at`, `last_used_at`, `revoked_at`

**Auth endpoints:**

- `POST /auth/magic-link` — body `{ email }`; find or create user; invalidate unused magic links for that user; issue a **new** token and send email (same success envelope every time)
- `GET /auth/verify` — query `token`; verify magic link, create session, `Set-Cookie`
- `POST /auth/logout` — destroy session cookie and DB session row if present
- `GET /auth/me` — session cookie required; returns current user

**API key endpoints (session-authenticated):**

- `POST /dashboard/keys` — generate new key (one per user for now)
- `GET /dashboard/keys` — list user's keys (masked)
- `DELETE /dashboard/keys/:id` — revoke a key
- `PATCH /dashboard/keys/:id` — update key label

**API key lifecycle:**

- Keys **do not expire** — they remain valid until explicitly revoked
- **One key per user** for now (enforced at creation)
- **Rotation** = revoke the current key (`DELETE`) then generate a new one (`POST`). The old key is invalidated immediately (Redis cache cleared). The new key is shown once.

**Token and session cleanup:**

- Magic link tokens: marked `used_at` on verification (single-use). A periodic cleanup job deletes expired and used tokens older than 24 hours.
- Sessions: expired sessions (`expires_at < NOW()`) are deleted by the same cleanup job. Active sessions use sliding expiry — `expires_at` refreshes on each request.

---

## Response Format

**Every API response follows this envelope:**

```typescript
// Success
{
  success: true,
  data: [...],
  meta: {
    total: number,
    page: number,
    limit: number,
    pages: number,
    resource: string,
    last_updated: string,
    source_url: string,
    freshness: string
  }
}

// Error
{
  success: false,
  error: {
    code: string,       // e.g. "INVALID_FILTER", "NOT_FOUND", "RATE_LIMIT_EXCEEDED"
    message: string,    // human-readable
    docs: string        // link to relevant docs page
  }
}
```

Never return raw data without this envelope. Never throw unhandled errors — all errors must be caught and returned in the error envelope format.

Never return error messages that expose internal implementation details. Always return a user-friendly message and log the technical details internally.

---

## Logging Architecture — Wide Events

**This project uses the "wide event" pattern (also called canonical log lines).** Instead of scattering multiple log statements throughout a request lifecycle, every HTTP request accumulates context into a single `WideEvent` object. When the request finishes, one structured JSON line is emitted containing everything that happened during that request.

**Why wide events:**

- One log line per request makes it trivial to reconstruct what happened — no correlating scattered entries
- Every field (user ID, API key tier, resource, duration, DB query time, cache hit/miss, error details) lives in the same JSON object
- Searching and alerting in SigNoz becomes simple field-based filtering rather than log message parsing
- No risk of forgetting to log something — the accumulator is always available via `c.get("event")`

**How it works:**

```
Request arrives
  → requestLogger middleware creates a WideEvent, stores it in Hono context
  → sets request_id, method, path, user_agent, ip
  → starts a "duration" timer

Route handler and downstream middleware:
  → c.get("event").set("user_id", userId)
  → c.get("event").set("api_key_tier", "free")
  → c.get("event").startTimer("db")  ... query ... c.get("event").stopTimer("db")
  → c.get("event").addError(err)  // if something fails

Request finishes (finally block):
  → stops duration timer, sets status code
  → emits ONE log line with all accumulated fields
  → auto-selects log level: info (2xx/3xx), warn (4xx), error (5xx or caught errors)
```

**Key files:**

- `apps/api/src/core/logger.ts` — Pino instance (redaction, env-aware formatting)
- `apps/api/src/core/wide-event.ts` — `WideEvent` class (accumulator with `set`, `setMany`, `startTimer`, `stopTimer`, `addError`, `emit`)
- `apps/api/src/core/request-logger.middleware.ts` — Hono middleware that creates and emits the wide event
- `apps/api/src/core/response-bytes.ts` — `responseBytes(res)` computes byte length (headers first, else read cloned body) because Fetch `Response` often has no `Content-Length`
- `apps/api/src/core/request-error.ts` — `recordRequestError(c, err)` forwards to `event.addError` for handlers that catch without rethrowing
- `apps/api/src/core/context-types.ts` — `AppVariables`, `SessionUser` for Hono context typing

**Rules for logging in route handlers:**

- Access the event via `c.get("event")` — never create a second logger call for request-scoped data
- Use `event.set(key, value)` to add context fields (user_id, resource, cache_hit, etc.)
- Use `event.startTimer(name)` / `event.stopTimer(name)` for sub-operation timing (db, redis, external API)
- Use `event.addError(err)` for caught errors — never swallow errors silently
- If you `catch` an error and return a 5xx (or otherwise handle without rethrowing), call `recordRequestError(c, err)` so the emitted wide event includes an `errors` array; unhandled throws are still recorded by the request logger’s `catch` around `next()`
- For non-request logs (startup, shutdown, cron jobs), use `logger.info(...)` directly from `core/logger.ts`
- Never use `console.log` — use `logger` or the wide event exclusively

**Pino redaction** ensures sensitive fields are never logged:

- `req.headers.authorization`, `req.headers.cookie`
- `*.password`, `*.token`, `*.secret`, `*.sessionToken`, `*.magicLinkToken`, `*.keyHash`, `*.tokenHash`, `*.sessionTokenHash`

---

## Security

Security is not a separate concern — it is embedded in every layer. Every code change must be evaluated against these rules.

**Input validation:**

- Every external input (query params, headers, request bodies, URL params) must be validated with Zod before use
- Never trust client-provided data — validate type, shape, length, and range
- Reject unexpected fields; never pass raw request bodies to DB queries
- Validate and sanitize all redirect URLs against a strict allowlist

**Secrets and credentials:**

- API keys are SHA-256 hashed before storage — plaintext is shown once at generation and never persisted
- Magic link tokens are SHA-256 hashed before storage — the raw token is sent via email only
- Session tokens are SHA-256 hashed before storage — the raw token lives only in the `HttpOnly` cookie
- All secrets (`SESSION_SECRET`, `MAGIC_LINK_SECRET`, `ADMIN_SECRET`, DB credentials) come from environment variables, never hardcoded
- Never log tokens, keys, passwords, session identifiers, or any secret — use pino redaction paths to enforce this

**Authentication and sessions:**

- Magic link tokens expire in 15 minutes and are single-use (marked `used_at` on verification)
- Session cookies are `HttpOnly`, `Secure`, `SameSite=Lax` — never accessible to JavaScript
- Sessions expire after 30 days with sliding window renewal on activity
- Expired and used tokens/sessions must be cleaned up periodically
- Auth endpoints (`/auth/*`, `/dashboard/*`) must be rate-limited aggressively to prevent brute-force and enumeration

**Error handling:**

- Never expose internal details (stack traces, SQL errors, file paths, server versions) in API responses
- All errors return the standard error envelope with a user-friendly message
- Log the full technical error internally with `logger.error` for debugging
- Use generic messages for auth failures ("Invalid or expired token") — never reveal whether an email exists

**Network and transport:**

- HTTPS is enforced everywhere (`.dev` TLD has HSTS preloaded, Caddy auto-provisions TLS)
- CORS: allow all origins for `GET` on `/v1/*` (public API); restrict `/auth/*` and `/dashboard/*` to `APP_URL` origin only
- Internal services (Postgres, Redis, SigNoz) are bound to `127.0.0.1` — never exposed externally
- Cloudflare proxies all traffic — the VPS IP is never revealed

**Rate limiting as a security layer:**

- Rate limiting is not just a usage control — it prevents brute-force attacks on auth endpoints, API key enumeration, and denial-of-service
- Auth endpoints have stricter limits than data endpoints (e.g., 5 magic link requests per email per hour)
- Anonymous requests are rate-limited by IP; authenticated requests by API key hash

**Dependency security:**

- `pnpm audit` runs in CI on every PR
- Dependabot is enabled for automatic update PRs
- Docker images in `docker-compose.yml` are pinned to specific versions (not `latest` in production)

**SQL injection prevention:**

- All DB queries go through Drizzle ORM's parameterized query builder — never string-concatenate user input into SQL
- Stored procedures (the only raw SQL) live in `packages/db/src/procedures/` and use parameterized inputs

---

## Coding Standards

**The single most important rule: no code comments.**

Comments are never written in this codebase. Code must be self-documenting through clear naming. If a piece of code needs a comment to be understood, the code needs to be rewritten.

**Other non-negotiables:**

- TypeScript strict mode — no `any`, no type assertions unless absolutely unavoidable
- Zod for all runtime validation — never trust external data without validating
- Drizzle ORM for all DB queries — never write raw SQL in application code (stored procedures are the exception, they live in `packages/db/src/procedures/`)
- All async functions must handle errors — no unhandled promise rejections
- All API responses must include `last_updated` and `source_url` fields
- Pagination is required on all list endpoints — never return unbounded result sets

**Import conventions:**

- Use `@openng/` workspace package imports for internal packages, never relative paths across packages
- Within a package, relative imports are fine

---

## Naming Conventions

| Thing               | Convention                   | Example                              |
| ------------------- | ---------------------------- | ------------------------------------ |
| Files               | `kebab-case`                 | `fuel-prices.ts`                     |
| Folders             | `kebab-case`                 | `food-prices/`                       |
| Variables/functions | `camelCase`                  | `fuelConfig`, `createResourceRouter` |
| Types/interfaces    | `PascalCase`                 | `ResourceConfig`, `FilterConfig`     |
| DB tables           | `snake_case` plural          | `fuel_prices`                        |
| DB columns          | `snake_case`                 | `pms_price`, `state_id`              |
| DB indexes          | `idx_{table}_{columns}`      | `idx_fuel_prices_state_period`       |
| Stored procedures   | `{schema}.{verb}_{resource}` | `staging.validate_fuel`              |
| API key prefix      | `ong_live_`                  | `ong_live_xxxxxx`                    |
| Internal packages   | `@openng/{name}`             | `@openng/db`                         |

---

## Environment Variables

API-specific variables are documented in [`apps/api/.env.example`](apps/api/.env.example). The repo root may also have a `.env.example` for cross-cutting or Docker Compose. Never hardcode secrets. Never commit `.env` files.

**API process and `.env`:** The API loads `dotenv` at startup; resolution follows the current working directory. Prefer `apps/api/.env` when the server runs with cwd `apps/api` (e.g. PM2 `cwd` pointing at `apps/api`, or `node dist/index.js` from that folder). Alternatively set variables in the process environment with no file.

**Deploying only `apps/api`:** `@openng/db` and `@openng/shared` are **workspace** packages (not npm registry packages). You must install from the **monorepo root** so pnpm links them, then build with `pnpm --filter api build`. Do not rsync only `apps/api` without the root `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and `packages/*` (or use `pnpm deploy` / `turbo prune` to produce a self-contained deploy bundle).

Key variables:

```
DATABASE_URL         # PostgreSQL connection string (e.g. postgresql://openng:pass@localhost:5434/openng_dev)
REDIS_URL            # Redis connection string (e.g. redis://localhost:6380)
APP_URL              # Public-facing web URL (https://openng.dev in prod, http://localhost:3001 locally)
                     # Used for: CORS origin validation, redirect allowlist; fallback base for magic-link verify URL if API_URL unset
API_URL              # Public API base URL (https://api.openng.dev in prod, http://localhost:3000 locally)
                     # Used for: magic-link verify links in emails (so the API can Set-Cookie on the API host)
RESEND_FROM_EMAIL    # Verified sender in Resend (e.g. auth@mail.openng.dev)
SESSION_SECRET       # Random hex string for session cookie HMAC signing. Generate: openssl rand -hex 32
MAGIC_LINK_SECRET    # Random hex string for magic link token HMAC. Generate: openssl rand -hex 32
R2_ACCOUNT_ID        # Cloudflare R2 account — for raw source file and backup storage
R2_ACCESS_KEY_ID     # Cloudflare R2 access key
R2_SECRET_ACCESS_KEY # Cloudflare R2 secret key
R2_BUCKET_NAME       # Cloudflare R2 bucket name (e.g. openng-sources)
RESEND_API_KEY       # Resend.com API key — sends magic link emails
ADMIN_SECRET         # Bearer token for /internal/* admin routes. Generate: openssl rand -hex 32
LOG_LEVEL            # Pino log level (debug in dev, info in prod). Options: debug, info, warn, error
```

---

## Common Commands

```bash
# Local dev
docker compose up -d          # start infrastructure
turbo dev                     # start all apps
turbo dev --filter=api        # start only the API
turbo dev --filter=web        # start only the web app

# Build
turbo build                   # build all
turbo build --filter=api      # build only API

# Database pipeline
pnpm tsx scripts/import-excel.ts --resource {name} --file {path}
pnpm tsx scripts/validate-staging.ts --resource {name} --batch {id}
pnpm tsx scripts/migrate-to-prod.ts --resource {name} --batch {id}
pnpm tsx scripts/cleanup-staging.ts --resource {name} --older-than 90d

# Lint/type check
turbo lint
turbo typecheck
```

---

## What Not To Do

- **Never write code comments** — ever, under any circumstances
- **Never bypass the ResourceFactory** to write custom resource route handlers
- **Never write to the `public` schema directly** — only migration stored procedures do this
- **Never store API keys in plaintext** — always hash before storage
- **Never return unbounded result sets** — all list endpoints must paginate
- **Never use `any` in TypeScript** without an explicit comment explaining why (and there should be very few)
- **Never commit `.env` files** — use `.env.example` for documentation
- **Never commit scraped Excel files** to git — only manually-curated seed files belong in git
- **Never use npm or yarn** — this is a pnpm workspace, only pnpm
- **Never use `console.log`** in the API — use the structured logger (`logger.info`, `logger.error`, etc.)
- **Never create a new resource without a ResourceConfig** — even one-off endpoints should follow the factory pattern
- **Never log sensitive data** — no tokens, keys, passwords, session IDs, or email addresses in log output
- **Never expose internal errors to clients** — all errors return the standard envelope with a generic user-facing message
- **Never store secrets in plaintext** — all tokens, keys, and passwords are hashed (SHA-256) before persistence
- **Never skip input validation** — every external input must pass through Zod before reaching business logic or the DB
- **Never allow open redirects** — validate all redirect URLs against the `APP_URL` allowlist

---

## Adding a New Resource — Checklist

When asked to add a new resource, follow this order:

- [ ] Create `apps/api/src/resources/{name}/config.ts` with `ResourceConfig`
- [ ] Create `apps/api/src/resources/{name}/index.ts` calling `createResourceRouter`
- [ ] Register in `apps/api/src/index.ts` with `app.route('/v1/{name}', {name}Router)`
- [ ] Create `packages/db/src/public/{name}.ts` with Drizzle schema
- [ ] Create `packages/db/src/staging/{name}.ts` with staging schema (includes audit columns)
- [ ] Create `packages/db/src/procedures/validate_{name}.sql`
- [ ] Create `packages/db/src/procedures/migrate_{name}.sql`
- [ ] Create `data/seeds/{name}/` if static resource
- [ ] Create `packages/scrapers/src/{name}/` if scraped resource
- [ ] Document in `docs/content/resources/{name}.mdx`

---

## Implementation Roadmap

The full step-by-step implementation plan lives in [`ROADMAP.md`](ROADMAP.md). It is organized into 10 groups, each a coherent unit of work with atomic checkboxed steps. When asked to implement a specific group (e.g., "implement Group 3"), read `ROADMAP.md` and execute every step in that group.

---

## Updating This File

**This file must be updated whenever:**

- A new app, package, or major folder is added to the monorepo
- A naming convention changes
- A new architectural pattern is introduced or an existing one changes
- A new environment variable is required
- The deployment target or infrastructure changes
- A new tool is added to the stack or an existing one is replaced
- A significant "never do this" lesson is learned

Update CLAUDE.md in the same commit as the change. If you are an AI assistant and you make a structural change or agree to a new pattern with the developer, include the CLAUDE.md update in your output.
