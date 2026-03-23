import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { appConfig } from "./config";
import { HealthModule } from "./modules/health";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ServicesModule } from "./modules/services/services.module";
import { CustomerProfilesModule } from "./modules/customer-profiles/customer-profiles.module";
import { MasterProfilesModule } from "./modules/master-profiles/master-profiles.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { AdminModule } from "./modules/admin/admin.module";
import { PaymentsModule } from "./modules/payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [
          { name: "default", ttl: 60000, limit: 100 }, // 100 req/min per IP
        ],
      }),
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    ServicesModule,
    CustomerProfilesModule,
    MasterProfilesModule,
    BookingsModule,
    ReviewsModule,
    NotificationsModule,
    DashboardModule,
    AuditLogsModule,
    AdminModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
