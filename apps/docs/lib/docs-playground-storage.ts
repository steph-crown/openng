const STORAGE_KEY = "openng.docs.playground.v1";
const INACTIVITY_MS = 24 * 60 * 60 * 1000;

type Stored = {
  key: string;
  lastActive: number;
};

function parse(raw: string): Stored | null {
  try {
    const v = JSON.parse(raw) as unknown;
    if (
      typeof v === "object" &&
      v !== null &&
      "key" in v &&
      "lastActive" in v &&
      typeof (v as Stored).key === "string" &&
      typeof (v as Stored).lastActive === "number"
    ) {
      return v as Stored;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadPlaygroundKey(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const data = parse(raw);
  if (!data) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  if (Date.now() - data.lastActive > INACTIVITY_MS) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return data.key;
}

export function savePlaygroundKey(key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (!trimmed) {
    clearPlaygroundKey();
    return;
  }
  const payload: Stored = { key: trimmed, lastActive: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearPlaygroundKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function touchPlaygroundActivity(): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const data = parse(raw);
  if (!data) return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...data, lastActive: Date.now() }),
  );
}
