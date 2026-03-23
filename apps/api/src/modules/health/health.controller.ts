import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";

const API_VERSION = "0.1.0";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  check() {
    return {
      success: true,
      service: "ustatap-api",
      version: API_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("readiness")
  async readiness() {
    const nodeEnv = this.config.get<string>("nodeEnv") ?? "development";
    const databaseUrl = this.config.get<string>("databaseUrl");
    const databaseConfigured = Boolean(databaseUrl?.trim());

    let databaseConnected = false;
    if (databaseConfigured) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        databaseConnected = true;
      } catch {
        databaseConnected = false;
      }
    }

    return {
      success: true,
      service: "ustatap-api",
      version: API_VERSION,
      environment: nodeEnv,
      databaseConfigured,
      databaseConnected,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
