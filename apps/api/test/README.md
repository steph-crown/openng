# API tests

Integration tests use a **dedicated Postgres database** (default name `openng_test`) and **Redis DB 15**. The test harness only runs migrations and seeds when the **database name** in `DATABASE_URL_TEST` is on the allowlist (default `openng_test`; override with comma-separated `ALLOWED_TEST_DATABASE_NAMES`). That avoids accidentally pointing tests at a dev or production database regardless of what those databases are called.

## One-time setup

1. Start Docker services: `docker compose up -d postgres redis`
2. Create the test database if it does not exist yet (fresh Postgres volumes run `docker/postgres/init/01-create-test-db.sh` automatically; existing volumes need this once):

   ```bash
   docker compose exec postgres psql -U openng -d openng_dev -c "CREATE DATABASE openng_test;"
   ```

3. Copy env: `cp apps/api/.env.test.example apps/api/.env.test` and adjust if your ports differ.

## Commands

From repo root:

```bash
pnpm test
```

Or only the API:

```bash
pnpm --filter api test
```

Global setup runs `drizzle-kit migrate` against `DATABASE_URL_TEST`, seeds two fixed holidays, and `FLUSHDB` on the test Redis logical database.
