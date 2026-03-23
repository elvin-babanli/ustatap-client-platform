/**
 * Audit metadata sanitization - mask sensitive fields before logging.
 */

const SENSITIVE_KEYS = [
  "password",
  "refreshToken",
  "accessToken",
  "token",
  "secret",
  "authorization",
  "credential",
  "cardNumber",
  "cvv",
  "pin",
] as const;

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((s) => lower.includes(s));
}

/**
 * Returns a copy of metadata with sensitive values masked.
 * Use before passing to AuditLogsService.
 */
export function maskSensitiveMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object") return {};

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    out[k] = isSensitiveKey(k) ? "[REDACTED]" : v;
  }
  return out;
}
