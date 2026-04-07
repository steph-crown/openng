import { and, count, desc, eq, isNull } from "drizzle-orm";
import { apiKeys } from "@openng/db";
import type { DbExecutor } from "./db";

export async function countActiveKeysForUser(client: DbExecutor, userId: bigint): Promise<number> {
  const [row] = await client
    .select({ n: count() })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)));
  return Number(row?.n ?? 0);
}

export async function insertApiKey(
  client: DbExecutor,
  input: {
    userId: bigint;
    keyHash: string;
    keyPrefix: string;
    tier: string;
  },
) {
  const [row] = await client
    .insert(apiKeys)
    .values({
      userId: input.userId,
      keyHash: input.keyHash,
      keyPrefix: input.keyPrefix,
      tier: input.tier,
    })
    .returning();
  return row;
}

export async function listApiKeysForUser(client: DbExecutor, userId: bigint) {
  return client
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt));
}

export async function findApiKeyByIdForUser(client: DbExecutor, id: bigint, userId: bigint) {
  const [row] = await client
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
    .limit(1);
  return row;
}

export async function findActiveByKeyHash(client: DbExecutor, keyHash: string) {
  const [row] = await client
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
    .limit(1);
  return row;
}

export async function revokeApiKey(client: DbExecutor, id: bigint, userId: bigint) {
  const [row] = await client
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
    .returning();
  return row;
}

export async function updateApiKeyName(
  client: DbExecutor,
  id: bigint,
  userId: bigint,
  name: string | null,
) {
  const [row] = await client
    .update(apiKeys)
    .set({ name })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
    .returning();
  return row;
}

export async function touchLastUsedAt(client: DbExecutor, id: bigint, at: Date) {
  await client.update(apiKeys).set({ lastUsedAt: at }).where(eq(apiKeys.id, id));
}
