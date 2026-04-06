import { getRedis } from "../../core/redis.js";
import type { SessionUser } from "../../core/context-types.js";
import * as apiKeysRepo from "../../account/repositories/api-keys.repository.js";
import { db } from "../repositories/db.js";
import * as usersRepo from "../repositories/users.repository.js";
import { hashToken } from "../../utils/crypto.js";

const CACHE_TTL_SEC = 300;
const LAST_USED_DEBOUNCE_SEC = 60;

export type ResolvedApiKey = {
  user: SessionUser;
  tier: string;
  apiKeyId: bigint;
};

type CachedPayload = {
  userId: string;
  tier: string;
  apiKeyId: string;
};

function sessionUserFromRow(row: {
  id: bigint;
  email: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
}): SessionUser {
  return {
    id: row.id,
    email: row.email,
    emailVerifiedAt: row.emailVerifiedAt,
    createdAt: row.createdAt,
  };
}

function parseCached(raw: string): CachedPayload | null {
  try {
    const v = JSON.parse(raw) as unknown;
    if (
      typeof v === "object" &&
      v !== null &&
      "userId" in v &&
      "tier" in v &&
      "apiKeyId" in v &&
      typeof (v as CachedPayload).userId === "string" &&
      typeof (v as CachedPayload).tier === "string" &&
      typeof (v as CachedPayload).apiKeyId === "string"
    ) {
      return v as CachedPayload;
    }
  } catch {
    return null;
  }
  return null;
}

async function maybeTouchLastUsed(apiKeyId: bigint, keyHash: string): Promise<void> {
  try {
    const redis = getRedis();
    const k = `apikey:lu:${keyHash}`;
    const r = await redis.set(k, "1", "EX", LAST_USED_DEBOUNCE_SEC, "NX");
    if (r === "OK") {
      await apiKeysRepo.touchLastUsedAt(db, apiKeyId, new Date());
    }
  } catch {
    return;
  }
}

async function setCache(keyHash: string, payload: CachedPayload): Promise<void> {
  try {
    await getRedis().setex(`apikey:${keyHash}`, CACHE_TTL_SEC, JSON.stringify(payload));
  } catch {
    return;
  }
}

export async function resolveApiKeyFromRaw(raw: string): Promise<ResolvedApiKey | null> {
  const keyHash = hashToken(raw);
  const cacheKey = `apikey:${keyHash}`;

  let cachedRaw: string | null = null;
  try {
    cachedRaw = await getRedis().get(cacheKey);
  } catch {
    cachedRaw = null;
  }

  if (cachedRaw) {
    const parsed = parseCached(cachedRaw);
    if (parsed) {
      const userId = BigInt(parsed.userId);
      const apiKeyId = BigInt(parsed.apiKeyId);
      const userRow = await usersRepo.findUserById(db, userId);
      if (!userRow || !userRow.isActive) {
        return null;
      }
      await maybeTouchLastUsed(apiKeyId, keyHash);
      return {
        user: sessionUserFromRow(userRow),
        tier: parsed.tier,
        apiKeyId,
      };
    }
  }

  const keyRow = await apiKeysRepo.findActiveByKeyHash(db, keyHash);
  if (!keyRow) {
    return null;
  }

  const userRow = await usersRepo.findUserById(db, keyRow.userId);
  if (!userRow || !userRow.isActive) {
    return null;
  }

  await setCache(keyHash, {
    userId: String(keyRow.userId),
    tier: keyRow.tier,
    apiKeyId: String(keyRow.id),
  });

  await maybeTouchLastUsed(keyRow.id, keyHash);

  return {
    user: sessionUserFromRow(userRow),
    tier: keyRow.tier,
    apiKeyId: keyRow.id,
  };
}
