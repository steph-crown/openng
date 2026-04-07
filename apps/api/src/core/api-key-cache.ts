import { getRedis } from "./redis";

export async function invalidateApiKeyLookup(keyHash: string): Promise<void> {
  try {
    await getRedis().del(`apikey:${keyHash}`);
  } catch {
    return;
  }
}
