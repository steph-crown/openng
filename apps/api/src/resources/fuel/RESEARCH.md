# Fuel Resource Research

## Resource goal

Provide factual, up-to-date Nigerian fuel price data with predictable monthly updates, versioned history, and geography that aligns with OpenNG reference tables.

## Scope for v1

v1 covers three NBS monthly fuel watch collections:

- Premium Motor Spirit (PMS / petrol)
- Automotive Gas Oil (AGO / diesel)
- National Household Kerosene (NHK)

v1 output level is state + month for all 36 states and FCT.

NBS methodology states collection across 774 LGAs, but public monthly tables and bulletins are published at state-level aggregates. Do not fabricate LGA-level outputs when source files do not provide them.

## Authoritative source and why

Primary source: National Bureau of Statistics (NBS) microdata catalog downloads.

Authoritative catalog pages:

- PMS: `https://microdata.nigerianstat.gov.ng/index.php/catalog/157`
- AGO: `https://microdata.nigerianstat.gov.ng/index.php/catalog/158`
- NHK: `https://microdata.nigerianstat.gov.ng/index.php/catalog/159`

Reason this is source of truth:

- Official federal statistics publication channel
- Explicit monthly publication cadence
- Consistent state-level reporting for all states and FCT
- Download artifacts include machine-readable tables (`.xlsx`) and narrative bulletins (`.pdf` or zipped bundles)

## Freshness and update cadence

Observed cadence: monthly releases, sometimes packaged as zip bundles.

Freshness strategy:

1. Poll the three catalog pages on schedule.
2. Detect newest downloadable artifact per collection.
3. Download and archive source artifact (zip/xlsx/pdf) before parsing.
4. Parse table workbook to normalized rows.
5. Import to `staging.fuel_prices`.
6. Validate with batch rules.
7. Migrate valid rows to `public.fuel_prices`.

Recommended run schedule:

- Monthly cron with retry window (for publication delays).
- Manual backfill command for missed months.

## Raw data acquisition details

Expected file patterns from NBS:

- Direct workbook links (`.xlsx`) for many months.
- Zip bundles (`.zip`) in some recent months containing report files and/or tables.
- PDF narrative report in parallel (used for human audit, not primary parser input).

Acquisition requirements:

- Prefer parsing workbook table files as primary machine source.
- If latest release is zip-only, extract and locate workbook inside zip.
- Archive original source in object storage for reproducibility.

## Canonical row model for fuel

Recommended normalized row per product per state per month:

- `product` (`pms` | `ago` | `nhk`)
- `state_name` (raw source label)
- `state_slug` (normalized)
- `state_id` (resolved via `ref.states`)
- `period` (`YYYY-MM`)
- `price_per_litre` (numeric, nullable for unavailable)
- `price_per_gallon` (numeric, nullable; relevant mainly for NHK tables when present)
- `source_url`
- `source_date` (report publication or retrieval date)

If a month includes multiple metrics in source table, keep one canonical row shape and nullable fields rather than creating ad-hoc table variants.

## Geography and reference-table integration

Use OpenNG reference tables as canonical geography keys:

- `state_id` must reference `ref.states.id`
- Keep `state_name` from source for auditability
- Keep `state_slug` for API filtering ergonomics

Important constraint:

- Do not add `lga_id` in v1 unless source table truly includes LGA-level rows.
- If future source starts publishing LGA-level values, use `ref.lgas` mapping with strict state/LGA consistency checks.

## Database design recommendation

`public.fuel_prices` should include:

- `id`
- `product`
- `state_id`
- `state_slug`
- `state_name`
- `period`
- `price_per_litre`
- `price_per_gallon`
- `source_url`
- `source_date`
- standard columns: `created_at`, `updated_at`, `is_active`

`staging.fuel_prices` should mirror domain columns and include standard staging audit fields:

- `is_valid`
- `validation_note`
- `flagged`
- `flagged_reason`
- `migrated_at`
- `import_batch_id`

Suggested uniqueness:

- `(product, state_id, period)`

Suggested indexes:

- `state_id`
- `period`
- `(product, period)`
- `(product, state_id, period)` unique

## Validation rules (staging)

Per batch, enforce:

1. `product` in allowed enum (`pms`, `ago`, `nhk`).
2. `period` matches `YYYY-MM`.
3. `state_slug` maps to exactly one `ref.states` row.
4. `state_name` is present and non-empty.
5. Price columns are positive numbers when provided.
6. No duplicate `(product, state_slug, period)` in the same batch.
7. Optional anomaly flags:
   - month-over-month change above configured threshold
   - suspicious zero or extreme outlier values

Rows can be flagged for manual review rather than immediately invalidated when anomaly checks trigger.

## API behavior recommendation (`/v1/fuel`)

Default list should expose:

- `product`
- `state_slug`
- `state_name`
- `period`
- `price_per_litre`
- `price_per_gallon` (nullable)
- `source_url`
- `source_date`

Filters:

- `product` (`in`)
- `state` (`in` via `state_slug`)
- `period` (`exact`)
- `period_from` / `period_to` (`range`)

Sort:

- default `period desc`, optional `state_slug asc`

## Operational quality checks

Before migration each month:

- Confirm 37-state coverage (36 + FCT) per product when expected.
- Confirm no unresolved state mappings.
- Compare national average trend to prior month for sanity.
- Keep source artifact hash and path for traceability.

## Known constraints and risk

- NBS release timing may vary month to month.
- File naming and packaging can change (xlsx vs zip bundle).
- Workbook column headers can drift; parser should be resilient with header mapping aliases.

Mitigation:

- Header alias map and strict parse logs.
- Archive raw source artifacts.
- Fail loud on schema drift and require manual mapping update.

## Conclusion

The next resource should be fuel because it is an authoritative, recurring, high-utility dataset that exercises OpenNG's full scraper-to-staging-to-public pipeline under real monthly operations.

Use NBS microdata downloads as source of truth, keep v1 state-level, and anchor all geography to `ref.states` to ensure consistency with the rest of the platform.
