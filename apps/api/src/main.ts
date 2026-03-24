import "./bootstrap-env";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { GlobalHttpExceptionFilter } from "./common/filters";
import { requestIdMiddleware } from "./common/middleware/request-id.middleware";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { validateConfig } from "./config/config.validation";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  validateConfig(process.env as unknown as Record<string, unknown>);

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();

  app.use(requestIdMiddleware);

  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false,
    }),
  );

  const corsOrigins = configService.get<string[]>("corsOrigins") ?? [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
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

  const config = new DocumentBuilder()
    .setTitle("Ustatap API")
    .setDescription("Ustatap client platform API")
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("auth", "Authentication endpoints")
    .addTag("health", "Health and readiness")
    .addTag("categories", "Service categories")
    .addTag("services", "Services")
    .addTag("masters", "Master profiles")
    .addTag("bookings", "Bookings")
    .addTag("payments", "Payments and payouts")
    .addTag("reviews", "Reviews")
    .addTag("admin", "Admin operations")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = configService.get<number>("port") ?? 3001;
  await app.listen(port);
}

bootstrap();
