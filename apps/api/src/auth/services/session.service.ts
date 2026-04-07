import { db } from "../repositories/db";
import * as sessionsRepo from "../repositories/sessions.repository";
import * as usersRepo from "../repositories/users.repository";
import { hashToken } from "../../utils/crypto";
import { SESSION_TTL_MS } from "../../utils/constants";
import type { SessionUser } from "../../core/context-types";

export async function loadSessionUserFromCookieRaw(raw: string): Promise<SessionUser | null> {
  const tokenHash = hashToken(raw);
  const sessionRow = await sessionsRepo.findSessionByTokenHash(db, tokenHash);
  if (!sessionRow || sessionRow.expiresAt.getTime() <= Date.now()) {
    return null;
  }
  const userRow = await usersRepo.findUserById(db, sessionRow.userId);
  if (!userRow || !userRow.isActive) {
    return null;
  }
  const now = new Date();
  const newExpires = new Date(now.getTime() + SESSION_TTL_MS);
  await sessionsRepo.updateSessionSlidingExpiry(db, sessionRow.id, now, newExpires);
  return {
    id: userRow.id,
    email: userRow.email,
    emailVerifiedAt: userRow.emailVerifiedAt,
    createdAt: userRow.createdAt,
  };
}
