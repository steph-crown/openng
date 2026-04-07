import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (client) {
    return client;
  }
  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }
  client = new Redis(url, { maxRetriesPerRequest: 2 });
  return client;
}

export async function pingRedis(): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    return false;
  }
  try {
    const reply = await redis.ping();
    return reply === "PONG";
  } catch {
    return false;
  }
}
