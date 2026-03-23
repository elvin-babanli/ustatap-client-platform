import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { PaymentsService } from "./payments.service";
import {
  InitiateBookingPaymentDto,
  UpdatePaymentStatusDto,
  CreatePayoutDto,
  UpdatePayoutStatusDto,
} from "./dto";
import {
  PaymentsQueryDto,
  PayoutsQueryDto,
  AdminPaymentsQueryDto,
  AdminPayoutsQueryDto,
} from "./dto";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("bookings/:bookingId/initiate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  initiateBookingPayment(
    @CurrentUser() userId: string,
    @Param("bookingId") bookingId: string,
    @Body() dto: InitiateBookingPaymentDto,
    @Headers("idempotency-key") idempotencyKeyHeader?: string,
  ) {
    const key = dto.idempotencyKey ?? (idempotencyKeyHeader?.trim() || undefined);
    return this.payments.initiateBookingPayment(userId, bookingId, {
      ...dto,
      idempotencyKey: key,
    });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMyPayments(
    @CurrentUser() userId: string,
    @Query() query: PaymentsQueryDto,
  ) {
    return this.payments.findCustomerPayments(userId, query);
  }

  @Get("me/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMyPaymentById(
    @CurrentUser() userId: string,
    @Param("id") id: string,
  ) {
    return this.payments.findCustomerPaymentById(userId, id);
  }

  @Get("master/payouts/me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  findMyPayouts(
    @CurrentUser() userId: string,
    @Query() query: PayoutsQueryDto,
  ) {
    return this.payments.findMasterPayouts(userId, query);
  }

  @Get("master/payouts/me/summary")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  getMyPayoutSummary(@CurrentUser() userId: string) {
    return this.payments.getMasterPayoutSummary(userId);
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAdminPayments(@Query() query: AdminPaymentsQueryDto) {
    return this.payments.findAdminPayments(query);
  }

  @Get("admin/payouts")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAdminPayouts(@Query() query: AdminPayoutsQueryDto) {
    return this.payments.findAdminPayouts(query);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post("admin/payouts")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createAdminPayout(
    @CurrentUser() userId: string,
    @Body() dto: CreatePayoutDto,
  ) {
    return this.payments.createAdminPayout(userId, dto);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Patch("admin/payouts/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAdminPayoutStatus(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: UpdatePayoutStatusDto,
  ) {
    return this.payments.updateAdminPayoutStatus(userId, id, dto);
  }

  @Get("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAdminPaymentById(@Param("id") id: string) {
    return this.payments.findAdminPaymentById(id);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Patch("admin/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAdminPaymentStatus(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.payments.updateAdminPaymentStatus(userId, id, dto);
  }
}
