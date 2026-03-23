/**
 * Config validation - fail-fast on missing or invalid env.
 * Runs at app bootstrap before any module loads.
 */

import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
  ValidateIf,
  validateSync,
} from "class-validator";

enum NodeEnv {
  development = "development",
  production = "production",
  test = "test",
}

class EnvValidation {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @ValidateIf((o: EnvValidation) => o.NODE_ENV === "production")
  @MinLength(32, {
    message: "JWT_ACCESS_SECRET must be at least 32 characters in production",
  })
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @ValidateIf((o: EnvValidation) => o.NODE_ENV === "production")
  @MinLength(32, {
    message: "JWT_REFRESH_SECRET must be at least 32 characters in production",
  })
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsNumber()
  @Min(10)
  @Max(14)
  BCRYPT_SALT_ROUNDS!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  APP_DEFAULT_COMMISSION_RATE!: number;

  @IsString()
  PAYMENT_PROVIDER_LABEL!: string;

  @ValidateIf((o: EnvValidation) => o.NODE_ENV === "production")
  @IsString({ message: "CORS_ORIGINS is required in production" })
  CORS_ORIGINS?: string;

  @IsOptional()
  @IsString()
  API_PREFIX?: string;
}

export function validateConfig(env: Record<string, unknown>): EnvValidation {
  const isProd = env.NODE_ENV === "production";

  const config = plainToInstance(EnvValidation, {
    NODE_ENV: env.NODE_ENV ?? "development",
    PORT: parseInt(String(env.PORT ?? 3001), 10),
    DATABASE_URL: env.DATABASE_URL,
    JWT_ACCESS_SECRET:
      env.JWT_ACCESS_SECRET ?? (isProd ? undefined : "change-me-in-production"),
    JWT_REFRESH_SECRET:
      env.JWT_REFRESH_SECRET ?? (isProd ? undefined : "change-me-in-production"),
    JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    BCRYPT_SALT_ROUNDS: parseInt(String(env.BCRYPT_SALT_ROUNDS ?? 12), 10),
    APP_DEFAULT_COMMISSION_RATE: parseFloat(
      String(env.APP_DEFAULT_COMMISSION_RATE ?? 0.05),
    ),
    PAYMENT_PROVIDER_LABEL: env.PAYMENT_PROVIDER_LABEL ?? "INTERNAL_PLACEHOLDER",
    CORS_ORIGINS: env.CORS_ORIGINS,
    API_PREFIX: env.API_PREFIX ?? "api/v1",
  });

  const errors = validateSync(config, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const messages = errors.map((e) => {
      const constraints = e.constraints ? Object.values(e.constraints) : [];
      return `${e.property}: ${constraints.join(", ")}`;
    });
    throw new Error(`Config validation failed:\n${messages.join("\n")}`);
  }

  return config;
}
