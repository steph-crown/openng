import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) {
    return client;
  }
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is not set");
  }
  client = new Redis(url, { maxRetriesPerRequest: 2 });
  return client;
}
