import { invalidateApiKeyLookup } from "../../infrastructure/api-key-cache";
import { generateApiKey, hashToken } from "../../utils/crypto";
import { db } from "../../db/client";
import * as apiKeysRepo from "../repositories/api-keys.repository";

export async function createApiKeyForUser(userId: bigint) {
  const count = await apiKeysRepo.countActiveKeysForUser(db, userId);
  if (count > 0) {
    return { ok: false as const, code: "CONFLICT" as const };
  }
  const rawKey = generateApiKey();
  const keyHash = hashToken(rawKey);
  const keyPrefix = rawKey.slice(0, 12);
  const row = await apiKeysRepo.insertApiKey(db, {
    userId,
    keyHash,
    keyPrefix,
    tier: "free",
  });
  if (!row) {
    throw new Error("api key insert failed");
  }
  return { ok: true as const, rawKey, keyPrefix, row };
}

export async function listApiKeysForUser(userId: bigint) {
  return apiKeysRepo.listApiKeysForUser(db, userId);
}

export async function revokeApiKeyForUser(userId: bigint, keyId: bigint) {
  const row = await apiKeysRepo.revokeApiKey(db, keyId, userId);
  if (!row) {
    return { ok: false as const };
  }
  await invalidateApiKeyLookup(row.keyHash);
  return { ok: true as const };
}

export async function updateApiKeyNameForUser(
  userId: bigint,
  keyId: bigint,
  name: string | undefined,
) {
  const existing = await apiKeysRepo.findApiKeyByIdForUser(db, keyId, userId);
  if (!existing) {
    return { ok: false as const };
  }
  if (name === undefined) {
    return { ok: true as const, row: existing };
  }
  const row = await apiKeysRepo.updateApiKeyName(db, keyId, userId, name);
  if (!row) {
    return { ok: false as const };
  }
  return { ok: true as const, row };
}
