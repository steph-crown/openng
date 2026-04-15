import { buildApiUrl } from "../../../lib/api-base-url";

export type AccountKey = {
  id: string;
  key_prefix: string;
  name: string | null;
  tier: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export async function fetchAccountKeys() {
  const response = await fetch(buildApiUrl("/account/keys"), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to load API keys");
  }

  const json = (await response.json()) as ApiEnvelope<{ keys: AccountKey[] }>;
  return json.data.keys;
}
