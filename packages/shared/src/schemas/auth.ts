import { z } from "zod";

export const magicLinkRequestSchema = z.object({
  email: z.string().email().max(255),
});

export const registerSchema = magicLinkRequestSchema;
export const loginSchema = magicLinkRequestSchema;

export const verifyTokenSchema = z.object({
  token: z.string().length(64),
});

export const updateKeySchema = z.object({
  name: z.string().max(100).optional(),
});
