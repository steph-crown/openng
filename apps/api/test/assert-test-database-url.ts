function databaseNameFromUrl(urlString: string): string {
  let u: URL;
  try {
    u = new URL(urlString);
  } catch {
    throw new Error("Invalid DATABASE_URL");
  }
  const trimmed = u.pathname.replace(/^\/+|\/+$/g, "");
  if (!trimmed) {
    throw new Error("DATABASE_URL must include a database name in the path");
  }
  const segments = trimmed.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) {
    throw new Error("DATABASE_URL must include a database name in the path");
  }
  return decodeURIComponent(last);
}

export function assertAllowedTestDatabaseName(databaseUrl: string): void {
  const name = databaseNameFromUrl(databaseUrl);
  const allowed = (process.env.ALLOWED_TEST_DATABASE_NAMES ?? "openng_test")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowed.includes(name)) {
    throw new Error(
      `Refusing to run tests or seeds: database name "${name}" is not allowed. Expected one of: ${allowed.join(", ")}. Set ALLOWED_TEST_DATABASE_NAMES (comma-separated) or point DATABASE_URL at a dedicated test database.`,
    );
  }
}
