import postgres from "postgres";

import { assertAllowedTestDatabaseName } from "./assert-test-database-url.js";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required to seed the test database");
}

assertAllowedTestDatabaseName(url);

const sql = postgres(url);

await sql`TRUNCATE public.holidays RESTART IDENTITY CASCADE`;

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

await sql.end();
