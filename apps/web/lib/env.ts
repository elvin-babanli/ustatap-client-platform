/**
 * Environment variables with safe access pattern
 * Keys must be validated at build/runtime in production
 */

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

export const env = {
  get: getEnv,
  getOptional: getOptionalEnv,
} as const;
