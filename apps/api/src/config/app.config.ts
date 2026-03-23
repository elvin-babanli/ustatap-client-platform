/**
 * CORS_ORIGINS: Comma-separated list of allowed origins.
 * Example: https://app.example.com,https://admin.example.com
 * In development, defaults to allow localhost.
 */
function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (raw?.trim()) {
    return raw.split(",").map((o) => o.trim()).filter(Boolean);
  }
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return ["http://localhost:3000", "http://127.0.0.1:3000"];
}

export const appConfig = () => ({
  port: parseInt(process.env.PORT ?? "3001", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  apiPrefix: process.env.API_PREFIX ?? "api/v1",
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: parseCorsOrigins(),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "change-me-in-production",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "change-me-in-production",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10),
  },
  payments: {
    defaultCommissionRate: parseFloat(
      process.env.APP_DEFAULT_COMMISSION_RATE ?? "0.05",
    ),
    internalProviderLabel: process.env.PAYMENT_PROVIDER_LABEL ?? "INTERNAL_PLACEHOLDER",
  },
});
