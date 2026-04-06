import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { API_KEY_PREFIX } from "./constants.js";

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateApiKey(): string {
  return `${API_KEY_PREFIX}${nanoid(32)}`;
}

export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  const len = Math.min(bufA.length, bufB.length);
  if (len !== bufA.length || len !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
