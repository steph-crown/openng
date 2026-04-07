import { eq } from "drizzle-orm";
import { users } from "@openng/db";
import type { DbExecutor } from "../../db/client";

export async function findUserByEmail(client: DbExecutor, email: string) {
  const [row] = await client.select().from(users).where(eq(users.email, email)).limit(1);
  return row;
}

export async function findUserById(client: DbExecutor, id: bigint) {
  const [row] = await client.select().from(users).where(eq(users.id, id)).limit(1);
  return row;
}

export async function createUser(client: DbExecutor, email: string) {
  const [created] = await client.insert(users).values({ email }).returning();
  return created;
}

export async function setEmailVerifiedAtNow(client: DbExecutor, userId: bigint) {
  await client
    .update(users)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
}
