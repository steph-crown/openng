import type { Context } from "hono";
import type { AppVariables } from "../types/context";

export function recordRequestError(
  c: Context<{ Variables: AppVariables }>,
  err: unknown,
): void {
  c.get("event").addError(err);
}
