import postgres from "postgres";

import { assertAllowedTestDatabaseName } from "./assert-test-database-url.js";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required to seed the test database");
}

assertAllowedTestDatabaseName(url);

const sql = postgres(url);

await sql`TRUNCATE public.holidays RESTART IDENTITY CASCADE`;
await sql`TRUNCATE public.postal_codes RESTART IDENTITY CASCADE`;
await sql`TRUNCATE ref.lgas RESTART IDENTITY CASCADE`;
await sql`TRUNCATE ref.states RESTART IDENTITY CASCADE`;

await sql`
  INSERT INTO public.holidays (
    name,
    date,
    day_of_week,
    category,
    schedule_kind,
    year,
    is_confirmed,
    observance_note,
    source_url,
    source_date,
    is_active
  )
  VALUES
    (
      'Test Holiday Alpha',
      '2030-01-15',
      'Tuesday',
      'national',
      'fixed',
      2030,
      true,
      NULL,
      'https://openng.dev/test',
      '2024-01-01',
      true
    ),
    (
      'Test Holiday Beta',
      '2030-06-01',
      'Saturday',
      'religious',
      'moveable_islamic',
      2030,
      true,
      NULL,
      'https://openng.dev/test',
      '2024-01-01',
      true
    )
`;

await sql`
  INSERT INTO ref.states (
    id,
    name,
    capital,
    slug,
    code,
    iso_code,
    geo_zone
  )
  VALUES
    (1, 'Lagos', 'Ikeja', 'lagos', 'LA', 'NG-LA', 'South West'),
    (2, 'Kano', 'Kano', 'kano', 'KN', 'NG-KN', 'North West')
`;

await sql`
  INSERT INTO ref.lgas (
    id,
    name,
    slug,
    headquarters,
    state_id
  )
  VALUES
    (1, 'Ikeja', 'ikeja', 'Ikeja', 1),
    (2, 'Nassarawa', 'nassarawa', 'Kano', 2)
`;

await sql`
  INSERT INTO public.postal_codes (
    state_id,
    state_slug,
    lga_id,
    lga_slug,
    area_name,
    post_office_name,
    postal_code,
    region_digit,
    is_verified,
    confidence,
    source_kind,
    source_url,
    source_date,
    is_active
  )
  VALUES
    (
      1,
      'lagos',
      1,
      'ikeja',
      'Alausa',
      'Ikeja Head Office',
      '100271',
      1,
      true,
      'authoritative',
      'nipost',
      'https://nipost.gov.ng/postcode-finder/',
      '2026-04-16',
      true
    ),
    (
      2,
      'kano',
      2,
      'nassarawa',
      'Sabon Gari',
      'Sabon Gari Office',
      '700213',
      7,
      false,
      'fallback',
      'community',
      'https://showpostcodes.com.ng/',
      '2026-04-16',
      true
    )
`;

await sql.end();
