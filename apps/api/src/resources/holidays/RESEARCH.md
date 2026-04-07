# Resource: Public Holidays

## Summary

Nigerian federal public holidays as declared annually by the Ministry of Interior
under the Public Holidays Act Cap P40 LFN 2004.

## Primary Source

Ministry of Interior — official FG declarations
URL: https://interior.gov.ng/category/public-holiday/
Format: Individual press releases per holiday declaration
Update frequency: As holidays are declared (roughly 6–8 times per year)

## Secondary / Cross-check Sources

- timeanddate.com/holidays/nigeria/{year} — good aggregator, useful for future year
  tentative Islamic dates
- officeholidays.com/countries/nigeria/{year} — another cross-check
- nigeriacalendar.com — clean structured list per year

## Legislation

Public Holidays Act Cap P40 LFN 2004
Full text: https://github.com/mykeels/nigerian-laws/blob/master/2004/
public-holidays-act-cap-p40-lfn-2004.md

Fixed statutory holidays defined in the Schedule to the Act:

1. New Year's Day (January 1)
2. Good Friday (variable — declared annually)
3. Easter Monday (variable — declared annually)
4. Workers' Day (May 1)
5. Democracy Day (June 12 — moved from May 29 by President Buhari in 2019)
6. Independence Day (October 1)
7. Christmas Day (December 25)
8. Boxing Day (December 26)
9. Eid el-Fitr — days declared annually by Minister of Interior
10. Eid el-Kabir — days declared annually by Minister of Interior
11. Id el-Maulud — day declared annually by Minister of Interior

## Key Nuances

1. No substitute holiday — the Act does not provide a substitute weekday when a
   holiday falls on Saturday or Sunday. Workers' Day 2026 falls on Saturday;
   Monday May 4 is NOT a public holiday unless FG specifically declares it.

2. Islamic holidays are tentative until the Sultan of Sokoto makes the moon
   sighting declaration. The Ministry of Interior then confirms the exact date.
   The declaration typically comes 1–3 days before the holiday.

3. The FG can declare additional special holidays at any time (e.g. national
   mourning days, special commemorations). These should be captured with
   schedule_kind = declared_special and an appropriate category.

4. State governors can declare state-specific holidays. This resource covers
   federal holidays only. State holidays are a future resource.

## Data Available

Historical declarations going back to at least 2019 on interior.gov.ng.
Cross-referencing with timeanddate.com allows reconstruction back to ~2000.
Target seed range: 2019–2027 (confirmed) + tentative 2028+ for fixed holidays.

## Fields to Capture

- name: human-readable holiday name
- date: actual observed public holiday date (calendar date for that year)
- day_of_week: derived label for convenience (e.g. "Monday")
- year: integer, for easy filtering (must match `date`)
- category: national | religious | observance — thematic classification (API filter)
- schedule_kind: fixed | moveable_christian | moveable_islamic | declared_special — how the date is determined (fixed calendar; Western Easter cycle; moon-sighted Islamic; ad-hoc FG declaration such as mourning)
- is_confirmed: boolean — false when date is provisional (typical for Islamic until Interior confirms; optional false for forward-year Christian if you ever publish before cross-check)
- observance_note: free text, optional (e.g. no substitute holiday when on weekend)
- source_url: canonical citation — ministry press release when available; for fixed statutory rows a stable Act/schedule permalink is acceptable when no per-year release exists
- source_date: date of the declaration or of Act publication used, whichever applies

## Automation Feasibility

- Fixed holidays: fully calculable, no scraping needed beyond first seed
- Easter dates: calculable algorithmically (Gauss/Gregorian algorithm)
- Islamic dates: NOT calculable — depend on moon sighting. Cannot automate.
  Strategy: seed confirmed historical dates + use timeanddate.com as early
  indicator for upcoming year, then update from interior.gov.ng when confirmed.

## Update Cadence

This resource needs human review approximately 8–10 times per year as each
holiday is declared. A GitHub Actions cron is NOT appropriate for this resource
because Islamic dates cannot be predicted with certainty. Instead: monitor
interior.gov.ng and update the seed file manually when each declaration drops.
