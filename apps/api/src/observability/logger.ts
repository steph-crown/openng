import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.secret",
      "*.sessionToken",
      "*.magicLinkToken",
      "*.keyHash",
      "*.tokenHash",
      "*.sessionTokenHash",
    ],
    remove: false,
  },

  formatters: {
    level(label: string) {
      return { level: label };
    },
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss.l",
      },
    },
  }),
});

export type Logger = typeof logger;
