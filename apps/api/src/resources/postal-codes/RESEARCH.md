# Postal Codes Resource Research

## Goal

Deliver a factually complete and query-friendly `postal-codes` resource for Nigeria in OpenNG.

For v1, "complete" means:

- All 36 states plus FCT are represented.
- Every `ref.lgas` state/LGA pair is checked against primary source data.
- Postal entries are captured at LGA and area/locality level where available.
- Missing primary-source entries are explicitly marked and reviewed.
- Community fallback rows are tracked with lower confidence metadata.

v1 does not target universal street-level coverage. Street-level enrichment is reserved for a potential v2.

## Target Granularity

Primary granularity for v1:

- `state`
- `lga`
- `area_name`
- `postal_code`
- `post_office_name` (when present)

Lookup optimization priority:

1. State-first browsing/filtering
2. State + LGA narrowing
3. Postal code exact lookup
4. Area name search within a state

## Source Strategy

### Primary Authoritative Source

- NIPOST postcode finder: `https://nipost.gov.ng/postcode-finder/`

Reason:

- Official source controlled by Nigerian Postal Service.
- Closest available source of truth for operational postal assignments.

### Secondary Cross-Check Sources

- `https://postcode.com.ng/`
- `https://showpostcodes.com.ng/`

Reason:

- Broad state/LGA/area coverage.
- Useful for reconciliation when NIPOST responses are sparse or intermittent.

### Excluded as Primary

- Global/aggregator datasets (for example GeoNames or paid international compilations) are not primary due to inconsistent Nigeria coverage and opaque refresh cycles.

## Confidence and Verification Model

Each consolidated row carries lineage and confidence:

- `source_kind`: `nipost` or `community`
- `confidence`: `authoritative`, `high`, or `fallback`
- `is_verified`: true when NIPOST and at least one community source agree on the state/LGA/area/postal code tuple

Interpretation:

- `authoritative`: NIPOST-sourced row, optionally corroborated
- `high`: community row corroborated by another source when NIPOST is unavailable
- `fallback`: community-only row pending manual confirmation

## Data Acquisition Approach

1. Enumerate all states/LGAs from `ref.states` and `ref.lgas`.
2. Query NIPOST finder systematically by state and LGA.
3. Parse and normalize area, post office, and postal code rows.
4. Scrape secondary sources for the same state/LGA combinations.
5. Reconcile rows by normalized `(state_slug, lga_slug, area_name, postal_code)`.
6. Mark confidence and verification fields.
7. Generate canonical seed outputs for import pipeline.

## Canonical Seed Contract

Seed output columns:

- `state`
- `state_slug`
- `lga`
- `lga_slug`
- `area_name`
- `post_office_name`
- `postal_code`
- `region_digit`
- `source_url`
- `source_date`
- `source_kind`
- `confidence`
- `is_verified`
- `notes`

The same logical contract is used for `data.xlsx` and optional `seed-rows.json`.

## Validation Requirements

At validation time:

- `postal_code` must be exactly 6 digits.
- `region_digit` must match first digit of `postal_code`.
- `state_slug` must map to `ref.states`.
- `lga_slug` must map to `ref.lgas` under the same state when present.
- Duplicates for `(state, lga, area_name, postal_code)` in the same batch are rejected.
- Missing state coverage is surfaced before migration.
- Conflicting source assignments for the same `(state, lga, area_name)` are flagged.

## Update Cadence

Postal code data is mostly static but not immutable.

Operational cadence:

- Scheduled refresh: quarterly.
- Forced refresh: when NIPOST changes UI/data behavior or community reports indicate drift.
- Community correction flow: accepted corrections are merged into seed and re-imported through staging validation/migration.

## Decision Summary

- Use NIPOST as authoritative primary.
- Use community sources for corroboration and controlled fallback.
- Ship v1 at state/LGA/area granularity with explicit confidence metadata.
- Optimize list query patterns for state-first access.
