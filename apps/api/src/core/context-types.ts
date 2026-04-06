import type { WideEvent } from "./wide-event.js";

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
};
