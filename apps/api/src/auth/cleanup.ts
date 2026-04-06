import { db } from "./repositories/db.js";
import * as authCleanupRepo from "./repositories/auth-cleanup.repository.js";
import { logger } from "../core/logger.js";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export function startAuthCleanupJob(): void {
  const run = async () => {
    try {
      await authCleanupRepo.deleteStaleMagicLinkTokens(db);
      await authCleanupRepo.deleteExpiredSessions(db);
      logger.info("auth cleanup completed");
    } catch (err) {
      logger.error({ err }, "auth cleanup failed");
    }
  };
  void run();
  setInterval(run, CLEANUP_INTERVAL_MS);
}
