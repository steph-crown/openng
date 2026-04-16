# Postal Codes Seed Contract

This directory stores the canonical static seed artifacts for the `postal-codes` resource.

## Files

- `seed-rows.json`: machine-readable rows for `pnpm import-json -- --resource postal-codes`
- `data.xlsx`: optional human-editable workbook generated from the same logical row contract

## Row fields

- `state`
- `state_slug`
- `lga`
- `lga_slug`
- `area_name`
- `post_office_name`
- `postal_code`
- `region_digit`
- `is_verified`
- `confidence`
- `source_kind`
- `source_url`
- `source_date`
- `notes`

## Confidence values

- `authoritative`: NIPOST-backed
- `high`: corroborated community row
- `fallback`: community-only row pending stronger corroboration

## Refresh cadence

- Planned scheduled refresh: quarterly
- Forced refresh: when NIPOST source behavior changes or verified corrections are submitted
