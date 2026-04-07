const ACT_REF =
  "https://github.com/mykeels/nigerian-laws/blob/master/2004/public-holidays-act-cap-p40-lfn-2004.md";
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function dow(y, m, d) {
  return days[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
function easterSunday(y) {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { y, month, day };
}
function iso(y, month, day) {
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function addDays(y, month, day, delta) {
  const t = Date.UTC(y, month - 1, day) + delta * 86400000;
  const d = new Date(t);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}
const rows = [];
const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
for (const y of years) {
  const fixed = [
    ["New Year's Day", 1, 1, "national"],
    ["Workers' Day", 5, 1, "national"],
    ["Democracy Day", 6, 12, "national"],
    ["Independence Day", 10, 1, "national"],
    ["Christmas Day", 12, 25, "religious"],
    ["Boxing Day", 12, 26, "national"],
  ];
  for (const [name, m, d, cat] of fixed) {
    rows.push({
      name,
      date: iso(y, m, d),
      day_of_week: dow(y, m, d),
      category: cat,
      schedule_kind: "fixed",
      year: y,
      is_confirmed: true,
      observance_note: null,
      source_url: ACT_REF,
      source_date: "2004-01-01",
    });
  }
  const es = easterSunday(y);
  const gf = addDays(es.y, es.month, es.day, -2);
  const em = addDays(es.y, es.month, es.day, 1);
  rows.push({
    name: "Good Friday",
    date: iso(gf.y, gf.m, gf.day),
    day_of_week: dow(gf.y, gf.m, gf.day),
    category: "religious",
    schedule_kind: "moveable_christian",
    year: y,
    is_confirmed: true,
    observance_note:
      "Date from Western (Gregorian) Easter computation; verify against annual Ministry of Interior notices if published.",
    source_url: ACT_REF,
    source_date: "2004-01-01",
  });
  rows.push({
    name: "Easter Monday",
    date: iso(em.y, em.m, em.day),
    day_of_week: dow(em.y, em.m, em.day),
    category: "religious",
    schedule_kind: "moveable_christian",
    year: y,
    is_confirmed: true,
    observance_note:
      "Date from Western (Gregorian) Easter computation; verify against annual Ministry of Interior notices if published.",
    source_url: ACT_REF,
    source_date: "2004-01-01",
  });
}
const islamic = [
  {
    name: "Eid el-Fitr",
    date: "2019-06-04",
    day_of_week: "Tuesday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2019,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://www.bbc.com/pidgin/tori-48495004",
    source_date: "2019-06-01",
  },
  {
    name: "Eid el-Fitr",
    date: "2019-06-05",
    day_of_week: "Wednesday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2019,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://www.bbc.com/pidgin/tori-48495004",
    source_date: "2019-06-01",
  },
  {
    name: "Eid el-Kabir",
    date: "2020-07-30",
    day_of_week: "Thursday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2020,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://fmino.gov.ng/federal-government-declares-30-and-31-july-2020-public-holidays-to-mark-eid-el-kabir-celebration/",
    source_date: "2020-07-28",
  },
  {
    name: "Eid el-Kabir",
    date: "2020-07-31",
    day_of_week: "Friday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2020,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://fmino.gov.ng/federal-government-declares-30-and-31-july-2020-public-holidays-to-mark-eid-el-kabir-celebration/",
    source_date: "2020-07-28",
  },
  {
    name: "Eid el-Fitr",
    date: "2024-04-09",
    day_of_week: "Tuesday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2024,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://fmino.gov.ng/fg-declares-9th-10th-april-2024-public-holidays-to-mark-eid-el-fitr/",
    source_date: "2024-04-08",
  },
  {
    name: "Eid el-Fitr",
    date: "2024-04-10",
    day_of_week: "Wednesday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2024,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://fmino.gov.ng/fg-declares-9th-10th-april-2024-public-holidays-to-mark-eid-el-fitr/",
    source_date: "2024-04-08",
  },
  {
    name: "Eid el-Fitr",
    date: "2024-04-11",
    day_of_week: "Thursday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2024,
    is_confirmed: true,
    observance_note:
      "Additional day declared after initial announcement (moon sighting).",
    source_url:
      "https://fmino.gov.ng/fg-declares-thursday-11th-april-additional-holiday-to-mark-eid-el-fitr/",
    source_date: "2024-04-10",
  },
  {
    name: "Eid el-Kabir",
    date: "2024-06-17",
    day_of_week: "Monday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2024,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://www.saharareporters.com/2024/06/14/eid-el-kabir-nigerian-government-declares-monday-tuesday-public-holidays",
    source_date: "2024-06-14",
  },
  {
    name: "Eid el-Kabir",
    date: "2024-06-18",
    day_of_week: "Tuesday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2024,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://www.saharareporters.com/2024/06/14/eid-el-kabir-nigerian-government-declares-monday-tuesday-public-holidays",
    source_date: "2024-06-14",
  },
  {
    name: "Id el-Maulud",
    date: "2024-09-16",
    day_of_week: "Monday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2024,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://fmino.gov.ng/fg-declares-monday-16th-september-2024-public-holiday-to-mark-the-celebration-of-eid-ul-mawlid/",
    source_date: "2024-09-13",
  },
  {
    name: "Eid el-Fitr",
    date: "2025-03-31",
    day_of_week: "Monday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2025,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://interior.gov.ng/fg-declares-31st-march-1st-april-2025-public-holidays-to-mark-eid-el-fitr/",
    source_date: "2025-03-28",
  },
  {
    name: "Eid el-Fitr",
    date: "2025-04-01",
    day_of_week: "Tuesday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2025,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://interior.gov.ng/fg-declares-31st-march-1st-april-2025-public-holidays-to-mark-eid-el-fitr/",
    source_date: "2025-03-28",
  },
  {
    name: "Eid el-Kabir",
    date: "2025-06-06",
    day_of_week: "Friday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2025,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://interior.gov.ng/fg-declares-6th-9th-june-2025-public-holidays-to-mark-eid-ul-adha-celebration/",
    source_date: "2025-06-01",
  },
  {
    name: "Eid el-Kabir",
    date: "2025-06-09",
    day_of_week: "Monday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2025,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://interior.gov.ng/fg-declares-6th-9th-june-2025-public-holidays-to-mark-eid-ul-adha-celebration/",
    source_date: "2025-06-01",
  },
  {
    name: "Id el-Maulud",
    date: "2025-09-05",
    day_of_week: "Friday",
    category: "religious",
    schedule_kind: "moveable_islamic",
    year: 2025,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://interior.gov.ng/fg-declares-friday-september-5-2025-public-holiday-to-mark-eid-ul-mawlid/",
    source_date: "2025-09-01",
  },
  {
    name: "National day of mourning (former President Buhari)",
    date: "2025-07-15",
    day_of_week: "Tuesday",
    category: "national",
    schedule_kind: "declared_special",
    year: 2025,
    is_confirmed: true,
    observance_note: null,
    source_url:
      "https://interior.gov.ng/fg-declares-tuesday-15-july-2025-public-holiday-in-honour-of-late-former-president-muhammadu-buhari/",
    source_date: "2025-07-01",
  },
];
rows.push(...islamic);
rows.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
process.stdout.write(JSON.stringify(rows, null, 2));
