# Postal Codes Operations

## Scheduled refresh

- Run quarterly seed refresh for postal codes.
- Trigger an unscheduled refresh when NIPOST changes output shape or verified corrections are received.

## Seed rebuild workflow

1. Collect NIPOST response payloads into JSON input for each state/LGA.
2. Collect community response payloads into JSON input pages.
3. Run:

```bash
pnpm --filter @openng/scrapers postal-codes:build-seed -- \
  --nipost-input <path-to-nipost-json> \
  --community-input <path-to-community-json> \
  --states-input data/seeds/states/states.json \
  --lgas-input data/seeds/lgas/lgas.json \
  --out data/seeds/postal-codes/seed-rows.json
```

4. Import to staging:

```bash
pnpm import-json -- --resource postal-codes --file data/seeds/postal-codes/seed-rows.json
```

5. Validate the returned batch:

```bash
pnpm validate-staging -- --resource postal-codes --batch <batch-id>
```

6. Migrate when valid:

```bash
pnpm migrate-to-prod -- --resource postal-codes --batch <batch-id>
```

## NIPOST corroboration workflow

When you have captured NIPOST rows (for example from browser-network extraction or future API endpoint discovery), save them to `data/seeds/postal-codes/nipost-rows.json` and run:

```bash
pnpm --filter @openng/scrapers postal-codes:corroborate-nipost -- \
  --seed data/seeds/postal-codes/seed-rows.json \
  --nipost data/seeds/postal-codes/nipost-rows.json
```

This step:

- upgrades matched rows to `confidence=authoritative`
- sets `is_verified=true` for matched tuples
- adds authoritative NIPOST-only rows not currently in the seed

## Correction handling

- Keep community corrections in review queue until a corroborating source is available.
- Preserve fallback rows with `confidence=fallback` and `is_verified=false`.
- Re-run import, validation, and migration after accepted corrections.

## Future v2 evolution

- Add street-level granularity only in a versioned schema change.
- Keep v1 stable for state/LGA/area consumers.
