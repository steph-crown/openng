import { db } from "@openng/db";
import { combinedAuth } from "../../middleware/auth-context";
import { createResourceRouter } from "../../resource-factory/factory";
import { holidaysConfig } from "./config";

export const holidaysRouter = createResourceRouter(holidaysConfig, db, {
  authMiddleware: combinedAuth,
});
