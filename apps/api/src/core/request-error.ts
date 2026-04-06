import type { Context } from "hono";
import type { AppVariables } from "./context-types.js";

export function recordRequestError(
  c: Context<{ Variables: AppVariables }>,
  err: unknown,
): void {
  c.get("event").addError(err);
}
