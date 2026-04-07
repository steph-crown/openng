import { and, eq, isNull } from "drizzle-orm";
import { magicLinkTokens } from "@openng/db";
import type { DbExecutor } from "../../db/client";

export async function invalidateUnusedForUser(client: DbExecutor, userId: bigint) {
  await client
    .update(magicLinkTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(magicLinkTokens.userId, userId), isNull(magicLinkTokens.usedAt)));
}

export async function insertMagicLinkToken(
  client: DbExecutor,
  values: { userId: bigint; tokenHash: string; expiresAt: Date },
) {
  await client.insert(magicLinkTokens).values({
    userId: values.userId,
    tokenHash: values.tokenHash,
    expiresAt: values.expiresAt,
  });
}

export async function findActiveUnusedByHash(client: DbExecutor, tokenHash: string) {
  const [row] = await client
    .select()
    .from(magicLinkTokens)
    .where(and(eq(magicLinkTokens.tokenHash, tokenHash), isNull(magicLinkTokens.usedAt)))
    .limit(1);
  return row;
}

export async function markMagicLinkUsed(client: DbExecutor, id: bigint) {
  await client.update(magicLinkTokens).set({ usedAt: new Date() }).where(eq(magicLinkTokens.id, id));
}
