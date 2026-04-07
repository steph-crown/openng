import { getRedis } from "./redis";

export async function invalidateApiKeyLookup(keyHash: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }
  try {
    await redis.del(`apikey:${keyHash}`);
  } catch {
    return;
  }
}
