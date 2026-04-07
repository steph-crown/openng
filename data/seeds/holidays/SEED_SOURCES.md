# Federal holidays seed (`seed-rows.json`)

## Coverage

- **2019–2026:** All **fixed** statutory rows (New Year, Workers’ Day, Democracy Day, Independence, Christmas, Boxing) with `source_url` pointing at the consolidated Public Holidays Act text in GitHub (see `RESEARCH.md` for context).
- **2019–2026:** **Good Friday** and **Easter Monday** from the **Western (Gregorian) Easter** algorithm (Anonymous Gregorian / Meeus-style computation in `build-seed.mjs`). Cross-check any year against Ministry of Interior notices if you need legal certainty beyond the ecclesiastical calendar.
- **Islamic and ad-hoc:** Only rows backed by **cited** FG or ministry-linked announcements in the generator script (e.g. 2019 Eid el-Fitr, 2020 Eid el-Kabir, 2024 Eid el-Fitr multi-day, 2024 Eid el-Kabir, 2024 Id el-Maulud, 2025 Eid el-Fitr, 2025 Eid el-Kabir, 2025 Id el-Maulud, 2025 national mourning). Each row’s `source_url` / `source_date` should match that citation.

## Gaps (intentional)

- **2021–2023 Islamic** (and several other years) are **not** fully populated in this seed. Add rows from `interior.gov.ng` archives or FMINFO press releases, then re-run `node data/seeds/holidays/build-seed.mjs` after editing `build-seed.mjs` (or switch the pipeline to read this JSON until Excel exists).
- **2026** Islamic dates: not declared yet — add when Interior publishes.

## Regenerate

```bash
node data/seeds/holidays/build-seed.mjs > data/seeds/holidays/seed-rows.json
```

## Uniqueness

Rows are unique on **`(name, date)`** so multi-day Eid windows do not collide.
