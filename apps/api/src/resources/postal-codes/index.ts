import { db } from "@openng/db";
import { combinedAuth } from "../../middleware/auth-context";
import { createResourceRouter } from "../../resource-factory/factory";
import { postalCodesConfig } from "./config";

export const postalCodesRouter = createResourceRouter(postalCodesConfig, db, {
  authMiddleware: combinedAuth,
});
