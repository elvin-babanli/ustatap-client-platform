/**
 * Structured logging utility.
 * Logs are JSON-serializable for production log aggregation.
 * Never log passwords, tokens, or raw credentials.
 */

import { Logger } from "@nestjs/common";

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  userId?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = [
  "password",
  "refreshToken",
  "accessToken",
  "authorization",
  "token",
  "secret",
  "credential",
] as const;

function redact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lower.includes(s))) {
      out[k] = "[REDACTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = redact(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function createStructuredLogger(name: string) {
  const logger = new Logger(name);

  function log(level: LogLevel, message: string, context?: LogContext) {
    const safeContext = context ? redact(context as Record<string, unknown>) : undefined;
    const payload = {
      msg: message,
      ...safeContext,
      timestamp: new Date().toISOString(),
    };
    const str = JSON.stringify(payload);
    switch (level) {
      case "error":
        logger.error(str);
        break;
      case "warn":
        logger.warn(str);
        break;
      case "debug":
        logger.debug?.(str);
        break;
      default:
        logger.log(str);
    }
  }

  return {
    info: (message: string, context?: LogContext) => log("info", message, context),
    warn: (message: string, context?: LogContext) => log("warn", message, context),
    error: (message: string, context?: LogContext) => log("error", message, context),
    debug: (message: string, context?: LogContext) => log("debug", message, context),
  };
}
