/**
 * @fileoverview Simple logger plugin for Elysia
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

/**
 * Simple logger with structured output
 */
export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        ...context,
        timestamp: new Date().toISOString(),
      })
    );
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(
      JSON.stringify({
        level: "warn",
        message,
        ...context,
        timestamp: new Date().toISOString(),
      })
    );
  },

  error: (message: string, context?: LogContext) => {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        ...context,
        timestamp: new Date().toISOString(),
      })
    );
  },

  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        JSON.stringify({
          level: "debug",
          message,
          ...context,
          timestamp: new Date().toISOString(),
        })
      );
    }
  },
};

export type Logger = typeof logger;
