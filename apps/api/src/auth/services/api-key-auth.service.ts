import type { SessionUser } from "../../types/context";
import * as apiKeysRepo from "../../account/repositories/api-keys.repository";
import { db } from "../../db/client";
import { getRedis } from "../../infrastructure/redis";
import * as usersRepo from "../repositories/users.repository";
import { hashToken } from "../../utils/crypto";

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
  const redis = getRedis();
  if (!redis) {
    return;
  }
  try {
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
  const redis = getRedis();
  if (!redis) {
    return;
  }
  try {
    await redis.setex(`apikey:${keyHash}`, CACHE_TTL_SEC, JSON.stringify(payload));
  } catch {
    return;
  }
}

export async function resolveApiKeyFromRaw(raw: string): Promise<ResolvedApiKey | null> {
  const keyHash = hashToken(raw);
  const cacheKey = `apikey:${keyHash}`;

  let cachedRaw: string | null = null;
  const redis = getRedis();
  if (redis) {
    try {
      cachedRaw = await redis.get(cacheKey);
    } catch {
      cachedRaw = null;
    }
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
