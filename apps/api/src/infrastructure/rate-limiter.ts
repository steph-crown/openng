import type Redis from "ioredis";

const SLIDING_DUAL_LUA = `
local function sliding_try_incr(curr_key, prev_key, limit, w, now)
  local c = redis.call('INCR', curr_key)
  if c == 1 then redis.call('EXPIRE', curr_key, math.floor(w * 2 + 120)) end
  local p = tonumber(redis.call('GET', prev_key) or 0)
  local ws = math.floor(now / w) * w
  local elapsed = now - ws
  local weight = (w - elapsed) / w
  if weight < 0 then weight = 0 end
  if weight > 1 then weight = 1 end
  local eff = p * weight + c
  if eff > limit then
    redis.call('DECR', curr_key)
    return 0, limit, ws + w
  end
  return 1, math.max(0, math.floor(limit - eff)), ws + w
end

local now = tonumber(ARGV[5])
local ok_m, _, reset_m = sliding_try_incr(KEYS[1], KEYS[2], tonumber(ARGV[1]), tonumber(ARGV[2]), now)
if ok_m == 0 then return {0, 'm', reset_m} end
local ok_d, rem_d, reset_d = sliding_try_incr(KEYS[3], KEYS[4], tonumber(ARGV[3]), tonumber(ARGV[4]), now)
if ok_d == 0 then
  redis.call('DECR', KEYS[1])
  return {0, 'd', reset_d}
end
return {1, rem_d, reset_d}
`;

const SLIDING_SINGLE_LUA = `
local function sliding_try_incr(curr_key, prev_key, limit, w, now)
  local c = redis.call('INCR', curr_key)
  if c == 1 then redis.call('EXPIRE', curr_key, math.floor(w * 2 + 120)) end
  local p = tonumber(redis.call('GET', prev_key) or 0)
  local ws = math.floor(now / w) * w
  local elapsed = now - ws
  local weight = (w - elapsed) / w
  if weight < 0 then weight = 0 end
  if weight > 1 then weight = 1 end
  local eff = p * weight + c
  if eff > limit then
    redis.call('DECR', curr_key)
    return 0, limit, ws + w
  end
  return 1, math.max(0, math.floor(limit - eff)), ws + w
end

local now = tonumber(ARGV[3])
local ok, rem, reset_at = sliding_try_incr(KEYS[1], KEYS[2], tonumber(ARGV[1]), tonumber(ARGV[2]), now)
if ok == 0 then return {0, rem, reset_at} end
return {1, rem, reset_at}
`;

export type TierLimits = {
  perMinute: number;
  perDay: number;
};

export const TIER_LIMITS: Record<string, TierLimits> = {
  anonymous: { perMinute: 10, perDay: 500 },
  free: { perMinute: 60, perDay: 5000 },
  pro: { perMinute: 500, perDay: 200_000 },
};

const MINUTE_SEC = 60;
const DAY_SEC = 86400;

function periodKeys(prefix: string, windowSec: number, nowSec: number): [string, string] {
  const currId = Math.floor(nowSec / windowSec);
  const curr = `${prefix}:${currId}`;
  const prev = `${prefix}:${currId - 1}`;
  return [curr, prev];
}

export type DualWindowResult =
  | { allowed: true; dayRemaining: number; dayResetAt: number }
  | {
      allowed: false;
      dimension: "minute" | "day";
      retryAfterSec: number;
      resetAt: number;
    };

export async function consumeTierLimits(
  redis: Redis,
  keyBase: string,
  limits: TierLimits,
  nowSec: number,
): Promise<DualWindowResult> {
  const minPrefix = `openng:rl:m:${keyBase}`;
  const dayPrefix = `openng:rl:d:${keyBase}`;
  const [mCurr, mPrev] = periodKeys(minPrefix, MINUTE_SEC, nowSec);
  const [dCurr, dPrev] = periodKeys(dayPrefix, DAY_SEC, nowSec);

  const raw = (await redis.eval(
    SLIDING_DUAL_LUA,
    4,
    mCurr,
    mPrev,
    dCurr,
    dPrev,
    limits.perMinute,
    MINUTE_SEC,
    limits.perDay,
    DAY_SEC,
    nowSec,
  )) as unknown;

  if (!Array.isArray(raw) || raw.length < 2) {
    return { allowed: true, dayRemaining: limits.perDay, dayResetAt: nowSec + DAY_SEC };
  }

  const head = raw[0];
  if (head === 1) {
    const dayRemaining = Number(raw[1]);
    const dayResetAt = Number(raw[2]);
    return {
      allowed: true,
      dayRemaining: Number.isFinite(dayRemaining) ? dayRemaining : limits.perDay,
      dayResetAt: Number.isFinite(dayResetAt) ? dayResetAt : nowSec + DAY_SEC,
    };
  }

  const dim = raw[1] === "d" ? "day" : "minute";
  const resetAt = Number(raw[2]);
  const retryAfterSec = Math.max(1, Math.ceil(resetAt - nowSec));
  return {
    allowed: false,
    dimension: dim,
    retryAfterSec,
    resetAt,
  };
}

export type SingleWindowResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; retryAfterSec: number };

export async function consumeSingleWindow(
  redis: Redis,
  keyBase: string,
  windowSec: number,
  limit: number,
  nowSec: number,
): Promise<SingleWindowResult> {
  const prefix = `openng:rl:s:${keyBase}`;
  const [curr, prev] = periodKeys(prefix, windowSec, nowSec);
  const raw = (await redis.eval(
    SLIDING_SINGLE_LUA,
    2,
    curr,
    prev,
    limit,
    windowSec,
    nowSec,
  )) as unknown;

  if (!Array.isArray(raw) || raw.length < 2) {
    return { allowed: true, remaining: limit, resetAt: nowSec + windowSec };
  }

  if (raw[0] === 1) {
    return {
      allowed: true,
      remaining: Number(raw[1]),
      resetAt: Number(raw[2]),
    };
  }

  const resetAt = Number(raw[2]);
  return {
    allowed: false,
    retryAfterSec: Math.max(1, Math.ceil(resetAt - nowSec)),
  };
}
