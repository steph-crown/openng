import { eq } from "drizzle-orm";
import { sessions } from "@openng/db";
import type { DbExecutor } from "./db";

export async function findSessionByTokenHash(client: DbExecutor, tokenHash: string) {
  const [row] = await client
    .select()
    .from(sessions)
    .where(eq(sessions.sessionTokenHash, tokenHash))
    .limit(1);
  return row;
}

export async function deleteSessionByTokenHash(client: DbExecutor, tokenHash: string) {
  await client.delete(sessions).where(eq(sessions.sessionTokenHash, tokenHash));
}

export async function updateSessionSlidingExpiry(
  client: DbExecutor,
  sessionId: bigint,
  lastActiveAt: Date,
  expiresAt: Date,
) {
  await client
    .update(sessions)
    .set({ lastActiveAt, expiresAt })
    .where(eq(sessions.id, sessionId));
}

export async function insertSession(
  client: DbExecutor,
  values: { userId: bigint; sessionTokenHash: string; expiresAt: Date },
) {
  await client.insert(sessions).values({
    userId: values.userId,
    sessionTokenHash: values.sessionTokenHash,
    expiresAt: values.expiresAt,
  });
}
