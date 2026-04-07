import { and, isNotNull, lt, or, sql } from "drizzle-orm";
import { magicLinkTokens, sessions } from "@openng/db";
import type { DbExecutor } from "./db";

export async function deleteStaleMagicLinkTokens(client: DbExecutor) {
  await client.delete(magicLinkTokens).where(
    or(
      lt(magicLinkTokens.expiresAt, new Date()),
      and(
        isNotNull(magicLinkTokens.usedAt),
        lt(magicLinkTokens.createdAt, sql`NOW() - INTERVAL '24 hours'`),
      ),
    ),
  );
}

export async function deleteExpiredSessions(client: DbExecutor) {
  await client.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
