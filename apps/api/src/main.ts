import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { GlobalHttpExceptionFilter } from "./common/filters";
import { requestIdMiddleware } from "./common/middleware/request-id.middleware";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { validateConfig } from "./config/config.validation";

async function bootstrap() {
  // Fail-fast config validation before app starts
  validateConfig(process.env as unknown as Record<string, unknown>);

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();

  // Request ID - must be first to ensure it's set for all downstream handlers
  app.use(requestIdMiddleware);

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false, // Allow API to be embedded if needed
    }),
  );

  // CORS - env-driven
  const corsOrigins = configService.get<string[]>("corsOrigins") ?? [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true, // true = reflect request origin in dev
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "Idempotency-Key"],
  });

  app.setGlobalPrefix(configService.get<string>("apiPrefix") ?? "api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = configService.get<number>("port") ?? 3001;
  await app.listen(port);
}

bootstrap();
