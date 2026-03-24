import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, CommissionStatus, PayoutStatus, PaymentStatus, Prisma } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { NotificationsService } from "../notifications/notifications.service";
import type { PaginatedResponse } from "../../common/dto";
import { canPaymentTransition } from "./utils/payment-status.util";
import { canPayoutTransition } from "./utils/payout-status.util";
import { calculateCommissionAmount } from "./utils/commission.util";
import { PAYMENT_ACTIVE_STATUSES } from "./constants/payment-status.constants";
import type {
  InitiateBookingPaymentDto,
  UpdatePaymentStatusDto,
  PaymentsQueryDto,
  AdminPaymentsQueryDto,
  CreatePayoutDto,
  PayoutsQueryDto,
  AdminPayoutsQueryDto,
  UpdatePayoutStatusDto,
} from "./dto";

const PAYMENT_SELECT = {
  id: true,
  bookingId: true,
  amount: true,
  currency: true,
  status: true,
  method: true,
  provider: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const PAYOUT_SELECT = {
  id: true,
  amount: true,
  currency: true,
  status: true,
  processedAt: true,
  reference: true,
  createdAt: true,
  updatedAt: true,
} as const;

const PAYMENT_INITIATABLE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
];

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditLogs: AuditLogsService,
    private readonly notifications: NotificationsService,
  ) {}

  async initiateBookingPayment(
    customerUserId: string,
    bookingId: string,
    dto: InitiateBookingPaymentDto,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerUserId },
      include: {
        masterProfile: { select: { userId: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (!PAYMENT_INITIATABLE_BOOKING_STATUSES.includes(booking.status)) {
      throw new BadRequestException(
        `Payment can only be initiated for CONFIRMED, IN_PROGRESS or COMPLETED bookings`,
      );
    }

    if (dto.idempotencyKey) {
      const existing = await this.prisma.payment.findFirst({
        where: {
          idempotencyKey: dto.idempotencyKey,
          bookingId,
          payerUserId: customerUserId,
        },
      });
      if (existing) {
        return this.formatPaymentSummary(existing);
      }
    }

    const activePayment = await this.prisma.payment.findFirst({
      where: {
        bookingId,
        status: { in: PAYMENT_ACTIVE_STATUSES },
      },
    });
    if (activePayment) {
      throw new BadRequestException(
        "An active payment already exists for this booking",
      );
    }

    const amount = booking.finalPrice ?? booking.estimatedPrice;
    const provider = this.config.get<string>("payments.internalProviderLabel") ?? "INTERNAL_PLACEHOLDER";

    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        payerUserId: customerUserId,
        payeeUserId: booking.masterProfile.userId,
        amount,
        currency: booking.currency,
        method: dto.method,
        provider,
        status: PaymentStatus.PENDING,
        idempotencyKey: dto.idempotencyKey ?? null,
      },
      select: { ...PAYMENT_SELECT, bookingId: true },
    });

    return this.formatPaymentSummary(payment);
  }

  async findCustomerPayments(
    customerUserId: string,
    query: PaymentsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.PaymentWhereInput = { payerUserId: customerUserId };
    if (query.status) where.status = query.status;
    if (query.bookingId) where.bookingId = query.bookingId;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          ...PAYMENT_SELECT,
          booking: {
            select: {
              id: true,
              status: true,
              service: { select: { nameEn: true } },
              masterProfile: { select: { displayName: true } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: items.map((p) => this.formatPaymentSummary(p)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async findCustomerPaymentById(
    customerUserId: string,
    paymentId: string,
  ) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        payerUserId: customerUserId,
      },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            service: { select: { nameEn: true } },
            masterProfile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        commission: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return this.formatPaymentDetail(payment);
  }

  async findMasterPayouts(
    masterUserId: string,
    query: PayoutsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!master) {
      throw new ForbiddenException("Master profile not found");
    }

    const where: Prisma.PayoutWhereInput = { masterProfileId: master.id };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: PAYOUT_SELECT,
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getMasterPayoutSummary(masterUserId: string) {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!master) {
      throw new ForbiddenException("Master profile not found");
    }

    const payouts = await this.prisma.payout.findMany({
      where: { masterProfileId: master.id },
      select: { amount: true, currency: true, status: true },
    });

    const totalPayouts = payouts.length;
    let completedPayoutsAmount = 0;
    let pendingPayoutsAmount = 0;
    let processingPayoutsAmount = 0;

    for (const p of payouts) {
      const amt = Number(p.amount);
      if (p.status === PayoutStatus.COMPLETED) completedPayoutsAmount += amt;
      else if (p.status === PayoutStatus.PENDING) pendingPayoutsAmount += amt;
      else if (p.status === PayoutStatus.PROCESSING) processingPayoutsAmount += amt;
    }

    return {
      totalPayouts,
      completedPayoutsAmount,
      pendingPayoutsAmount,
      processingPayoutsAmount,
    };
  }

  async findAdminPayments(
    query: AdminPaymentsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.bookingId) where.bookingId = query.bookingId;
    if (query.payerUserId) where.payerUserId = query.payerUserId;
    if (query.provider) where.provider = query.provider;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          ...PAYMENT_SELECT,
          payerUserId: true,
          payeeUserId: true,
          providerReference: true,
          failureReason: true,
          booking: {
            select: {
              id: true,
              status: true,
              masterProfileId: true,
              masterProfile: { select: { displayName: true } },
            },
          },
          commission: {
            select: {
              id: true,
              amount: true,
              rate: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async findAdminPaymentById(paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            customerUserId: true,
            masterProfileId: true,
            service: { select: { nameEn: true } },
            customer: {
              select: {
                customerProfile: { select: { firstName: true, lastName: true } },
                email: true,
                phone: true,
              },
            },
            masterProfile: {
              select: { displayName: true, userId: true },
            },
          },
        },
        commission: true,
      },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return payment;
  }

  async updateAdminPaymentStatus(
    adminUserId: string,
    paymentId: string,
    dto: UpdatePaymentStatusDto,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: { select: { customerUserId: true, masterProfile: { select: { userId: true } } } },
      },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (!canPaymentTransition(payment.status, dto.status)) {
      throw new BadRequestException(
        `Invalid payment status transition from ${payment.status} to ${dto.status}`,
      );
    }

    if (dto.status === PaymentStatus.FAILED && !dto.failureReason?.trim()) {
      throw new BadRequestException("Failure reason is required when marking as FAILED");
    }

    const commissionRate = this.config.get<number>("payments.defaultCommissionRate") ?? 0.05;

    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: dto.status,
          failureReason: dto.status === PaymentStatus.FAILED ? dto.failureReason : null,
          paidAt: dto.status === PaymentStatus.COMPLETED ? new Date() : null,
        },
      });

      if (dto.status === PaymentStatus.COMPLETED) {
        const commissionAmount = calculateCommissionAmount(payment.amount, commissionRate);
        await tx.commission.upsert({
          where: { paymentId },
          create: {
            paymentId,
            rate: commissionRate,
            amount: commissionAmount,
            currency: payment.currency,
            status: CommissionStatus.COLLECTED,
          },
          update: {
            amount: commissionAmount,
            rate: commissionRate,
            status: CommissionStatus.COLLECTED,
          },
        });
      }

      return p;
    });

    await this.auditLogs.log({
      actorUserId: adminUserId,
      entityType: "Payment",
      entityId: paymentId,
      action: "STATUS_UPDATE",
      metadata: {
        previousStatus: payment.status,
        nextStatus: dto.status,
      } as Record<string, unknown>,
    });

    if (dto.status === PaymentStatus.COMPLETED) {
      this.notifications.createForUser(
        payment.booking.customerUserId,
        "PAYMENT_RECEIVED",
        "Payment completed",
        "Your payment has been completed successfully.",
      );
    } else if (
      dto.status === PaymentStatus.FAILED ||
      dto.status === PaymentStatus.CANCELLED
    ) {
      this.notifications.createForUser(
        payment.booking.customerUserId,
        "SYSTEM",
        "Payment update",
        `Your payment status has been updated to ${dto.status}.`,
      );
    }

    return this.findAdminPaymentById(paymentId);
  }

  async findAdminPayouts(
    query: AdminPayoutsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.PayoutWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.masterProfileId) where.masterProfileId = query.masterProfileId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          ...PAYOUT_SELECT,
          notes: true,
          masterProfile: {
            select: {
              id: true,
              displayName: true,
              user: { select: { email: true, phone: true } },
            },
          },
        },
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async createAdminPayout(
    adminUserId: string,
    dto: CreatePayoutDto,
  ) {
    const master = await this.prisma.masterProfile.findUnique({
      where: { id: dto.masterProfileId },
    });

    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    const payout = await this.prisma.payout.create({
      data: {
        masterProfileId: dto.masterProfileId,
        amount: dto.amount,
        currency: dto.currency,
        reference: dto.reference ?? null,
        notes: dto.notes ?? null,
        status: PayoutStatus.PENDING,
      },
    });

    await this.auditLogs.log({
      actorUserId: adminUserId,
      entityType: "Payout",
      entityId: payout.id,
      action: "CREATE",
      metadata: {
        masterProfileId: dto.masterProfileId,
        amount: dto.amount,
        currency: dto.currency,
      } as Record<string, unknown>,
    });

    this.notifications.createForUser(
      master.userId,
      "SYSTEM",
      "Payout created",
      `A payout of ${dto.amount} ${dto.currency} has been created for you.`,
    );

    return this.prisma.payout.findUnique({
      where: { id: payout.id },
      include: {
        masterProfile: {
          select: { displayName: true },
        },
      },
    });
  }

  async updateAdminPayoutStatus(
    adminUserId: string,
    payoutId: string,
    dto: UpdatePayoutStatusDto,
  ) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: payoutId },
      include: { masterProfile: { select: { userId: true } } },
    });

    if (!payout) {
      throw new NotFoundException("Payout not found");
    }

    if (!canPayoutTransition(payout.status, dto.status)) {
      throw new BadRequestException(
        `Invalid payout status transition from ${payout.status} to ${dto.status}`,
      );
    }

    const updated = await this.prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: dto.status,
        processedAt:
          dto.status === PayoutStatus.COMPLETED ||
          dto.status === PayoutStatus.FAILED
            ? new Date()
            : undefined,
      },
    });

    await this.auditLogs.log({
      actorUserId: adminUserId,
      entityType: "Payout",
      entityId: payoutId,
      action: "STATUS_UPDATE",
      metadata: {
        previousStatus: payout.status,
        nextStatus: dto.status,
      } as Record<string, unknown>,
    });

    if (dto.status === PayoutStatus.COMPLETED) {
      this.notifications.createForUser(
        payout.masterProfile.userId,
        "SYSTEM",
        "Payout completed",
        `Your payout of ${payout.amount} ${payout.currency} has been completed.`,
      );
    }

    return updated;
  }

  private formatPaymentSummary(payment: unknown) {
    const p = payment as Record<string, unknown>;
    const result: Record<string, unknown> = {
      id: p.id,
      bookingId: p.bookingId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      method: p.method,
      provider: p.provider,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
    if (p.booking && typeof p.booking === "object") {
      result.booking = p.booking;
    }
    return result;
  }

  private formatPaymentDetail(payment: unknown) {
    const p = payment as Record<string, unknown>;
    return {
      ...this.formatPaymentSummary(p),
      commission: p.commission,
    };
  }
}
