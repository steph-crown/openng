import { db } from "@openng/db";

export { db };

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DbExecutor = typeof db | TransactionClient;
