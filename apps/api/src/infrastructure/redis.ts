import Redis from "ioredis";

let client: Redis | null = null;

let shutdownRegistered = false;

function registerShutdownHandlers(instance: Redis) {
  if (shutdownRegistered) {
    return;
  }
  shutdownRegistered = true;
  const close = () => {
    void instance.quit().catch(() => {
      void instance.disconnect();
    });
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
}

export function getRedis(): Redis | null {
  if (client) {
    return client;
  }
  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }
  client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      return Math.min(times * 200, 3000);
    },
  });
  registerShutdownHandlers(client);
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (!client) {
    return;
  }
  try {
    await client.quit();
  } catch {
    client.disconnect();
  }
  client = null;
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
