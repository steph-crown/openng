# Postal Codes Scrapers

This folder contains the postal-codes scraper pipeline from source extraction to seed corroboration.

## Pipeline modules

- `acquire-showpostcodes.ts`
  - Step: `acquisition`
  - Pulls community data from `showpostcodes.com.ng` and normalizes rows.
  - Produces in-memory `PostalCodeRecord[]`.

- `acquire-cli.ts`
  - Step: `acquisition`
  - CLI wrapper for `acquire-showpostcodes.ts`.
  - Writes canonical output to `data/seeds/postal-codes/seed-rows.json`.

- `scrape-community.ts`
  - Step: `acquisition`
  - Generic parser for community HTML table snapshots.
  - Used by deterministic snapshot-based build mode.

- `scrape-nipost.ts`
  - Step: `acquisition`
  - Generic parser for NIPOST HTML snapshots.
  - Used by deterministic snapshot-based build mode.

- `merge.ts`
  - Step: `transformation`
  - Reconciles NIPOST + community rows into canonical records.

- `build-seed.ts`
  - Step: `transformation`
  - Builds canonical seed rows from prepared snapshot inputs.

- `cli.ts`
  - Step: `transformation`
  - CLI for snapshot-based deterministic build.

- `corroborate-nipost.ts`
  - Step: `verification`
  - Merges authoritative NIPOST rows into existing seed, upgrades confidence, and sets verification flags.

- `corroborate-cli.ts`
  - Step: `verification`
  - CLI wrapper for NIPOST corroboration.

- `normalize.ts`
  - Shared normalization helpers for slugs and area keys.

- `types.ts`
  - Shared contracts for scraper interoperability.

## Run commands

### Live community acquisition

```bash
pnpm --filter @openng/scrapers postal-codes:acquire -- --out data/seeds/postal-codes/seed-rows.json
```

### Snapshot-based deterministic seed build

```bash
pnpm --filter @openng/scrapers postal-codes:build-seed -- \
  --nipost-input <nipost-snapshots.json> \
  --community-input <community-snapshots.json> \
  --states-input data/seeds/states/states.json \
  --lgas-input data/seeds/lgas/lgas.json \
  --out data/seeds/postal-codes/seed-rows.json
```

### NIPOST corroboration pass

```bash
pnpm --filter @openng/scrapers postal-codes:corroborate-nipost -- \
  --seed data/seeds/postal-codes/seed-rows.json \
  --nipost data/seeds/postal-codes/nipost-rows.json
```

## Required inputs and outputs

- Inputs:
  - `data/seeds/states/states.json`
  - `data/seeds/lgas/lgas.json`
  - optional `data/seeds/postal-codes/nipost-rows.json`
- Output:
  - `data/seeds/postal-codes/seed-rows.json`
