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
- `openng.dev/docs` — documentation (Fumadocs, Next.js)
- A staging database pipeline (PostgreSQL + stored procedures)
- Scraper jobs (TypeScript, GitHub Actions cron)

---

## Monorepo Structure

```
openng/
├── apps/
│   ├── api/                    ← Hono API server → api.openng.dev
│   │   ├── src/
│   │   │   ├── core/           ← factory, middleware, shared handlers
│   │   │   ├── resources/      ← one folder per data domain
│   │   │   │   ├── fuel/
│   │   │   │   ├── food-prices/
│   │   │   │   ├── holidays/
│   │   │   │   └── ...
│   │   │   ├── auth/           ← API key management
│   │   │   ├── admin/          ← internal-only routes
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
│   └── docs/                   ← Fumadocs → openng.dev/docs
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
│   │   │   ├── staging/
│   │   │   ├── prod/
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
| Observability   | SigNoz                 | Self-hosted via Docker on VPS                      |
| Rate limiting   | Redis + sliding window | In-process with the Hono API                       |
| Object storage  | Cloudflare R2          | Raw scraper source archive only                    |

---

## Infrastructure

**Production:** Hetzner VPS (CAX21 — 3 ARM vCPU, 4GB RAM)
**CDN/DNS/WAF:** Cloudflare (free tier)

**Service → port mapping on VPS:**

```
api.openng.dev  → Hono API         → localhost:3000
openng.dev      → Next.js web      → localhost:3001
openng.dev/docs → Fumadocs         → localhost:3002
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

---

## Database Architecture

**Four PostgreSQL schemas:**

| Schema      | Purpose                                      | Who writes                       |
| ----------- | -------------------------------------------- | -------------------------------- |
| `public`    | Production resource tables                   | Migration stored procedures only |
| `staging`   | Staging tables with audit columns            | Import scripts and scrapers      |
| `ref`       | Reference/lookup tables (states, LGAs, etc.) | Initial seed only                |
| `analytics` | Usage events, API key activity               | API async batch writer           |

**The API reads exclusively from `public` and `ref`. It never writes to `public` directly.** All writes to `public` go through migration stored procedures.

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

- Keys are prefixed `ngd_live_` followed by nanoid(32)
- Keys are SHA-256 hashed before storage — plaintext never persists
- Keys are passed via `Authorization: Bearer ngd_live_xxx...` header
- Redis caches key lookups with 5-minute TTL to avoid per-request DB hits
- Anonymous requests (no key) are allowed but rate-limited by IP

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
| API key prefix      | `ngd_live_`                  | `ngd_live_xxxxxx`                    |
| Internal packages   | `@openng/{name}`             | `@openng/db`                         |

---

## Environment Variables

All environment variables are documented in `.env.example` at the root. Never hardcode secrets. Never commit `.env` files.

Key variables:

```
DATABASE_URL         # PostgreSQL connection string
REDIS_URL            # Redis connection string
R2_ACCOUNT_ID        # Cloudflare R2
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
RESEND_API_KEY       # Transactional email
ADMIN_SECRET         # For /internal/* routes
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

---

## Adding a New Resource — Checklist

When asked to add a new resource, follow this order:

- [ ] Create `apps/api/src/resources/{name}/config.ts` with `ResourceConfig`
- [ ] Create `apps/api/src/resources/{name}/index.ts` calling `createResourceRouter`
- [ ] Register in `apps/api/src/index.ts` with `app.route('/v1/{name}', {name}Router)`
- [ ] Create `packages/db/src/prod/{name}.ts` with Drizzle schema
- [ ] Create `packages/db/src/staging/{name}.ts` with staging schema (includes audit columns)
- [ ] Create `packages/db/src/procedures/validate_{name}.sql`
- [ ] Create `packages/db/src/procedures/migrate_{name}.sql`
- [ ] Create `data/seeds/{name}/` if static resource
- [ ] Create `packages/scrapers/src/{name}/` if scraped resource
- [ ] Document in `docs/content/resources/{name}.mdx`

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
