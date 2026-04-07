import type { WideEvent } from "../observability/wide-event";

export type SessionUser = {
  id: bigint;
  email: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

export type AppVariables = {
  event: WideEvent;
  requestId: string;
  user?: SessionUser;
  tier?: string;
  apiKeyId?: bigint;
};
