import { db } from "../../db/client";
import * as magicLinkTokensRepo from "../repositories/magic-link-tokens.repository";
import * as sessionsRepo from "../repositories/sessions.repository";
import * as usersRepo from "../repositories/users.repository";
import { generateToken, hashToken } from "../../utils/crypto";
import { sendMagicLink } from "../email";
import { MAGIC_LINK_TTL_MS, SESSION_TTL_MS } from "../../utils/constants";
import { normalizeEmail } from "../../utils/normalize-email";

export async function requestMagicLink(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  let user = await usersRepo.findUserByEmail(db, normalized);
  if (!user) {
    const created = await usersRepo.createUser(db, normalized);
    if (!created) {
      throw new Error("createUser failed");
    }
    user = created;
  }
  await magicLinkTokensRepo.invalidateUnusedForUser(db, user.id);
  const rawToken = generateToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);
  await magicLinkTokensRepo.insertMagicLinkToken(db, {
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt,
  });
  await sendMagicLink(normalized, rawToken);
}

export type VerifyMagicLinkResult = {
  sessionRaw: string;
  user: {
    id: string;
    email: string;
    email_verified_at: string | null;
  };
};

export async function verifyMagicLink(rawToken: string): Promise<VerifyMagicLinkResult | null> {
  const tokenHash = hashToken(rawToken);
  const tokenRow = await magicLinkTokensRepo.findActiveUnusedByHash(db, tokenHash);
  if (!tokenRow || tokenRow.expiresAt.getTime() <= Date.now()) {
    return null;
  }
  const userRow = await usersRepo.findUserById(db, tokenRow.userId);
  if (!userRow || !userRow.isActive) {
    return null;
  }
  const sessionRaw = generateToken();
  const sessionExpires = new Date(Date.now() + SESSION_TTL_MS);
  await db.transaction(async (tx) => {
    await magicLinkTokensRepo.markMagicLinkUsed(tx, tokenRow.id);
    if (!userRow.emailVerifiedAt) {
      await usersRepo.setEmailVerifiedAtNow(tx, userRow.id);
    }
    await sessionsRepo.insertSession(tx, {
      userId: userRow.id,
      sessionTokenHash: hashToken(sessionRaw),
      expiresAt: sessionExpires,
    });
  });
  const fresh = await usersRepo.findUserById(db, userRow.id);
  const out = fresh ?? userRow;
  return {
    sessionRaw,
    user: {
      id: String(out.id),
      email: out.email,
      email_verified_at: out.emailVerifiedAt?.toISOString() ?? null,
    },
  };
}

export async function logoutBySessionRaw(raw: string | undefined): Promise<void> {
  if (!raw) {
    return;
  }
  await sessionsRepo.deleteSessionByTokenHash(db, hashToken(raw));
}
