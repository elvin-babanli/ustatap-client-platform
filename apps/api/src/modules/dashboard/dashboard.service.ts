import { Injectable } from "@nestjs/common";
import { BookingStatus, DisputeStatus, PaymentStatus, PayoutStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerDashboard(customerUserId: string) {
    const [
      recentBookings,
      bookingsByStatus,
      totalBookings,
      totalCompleted,
      totalCancelled,
      unreadNotifications,
      recentReviewsCount,
      totalPaymentsCompletedAmount,
    ] = await Promise.all([
      this.prisma.booking.findMany({
        where: { customerUserId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          scheduledDate: true,
          estimatedPrice: true,
          currency: true,
          masterProfile: { select: { displayName: true } },
          service: { select: { nameEn: true } },
        },
      }),
      this.prisma.booking.groupBy({
        by: ["status"],
        where: { customerUserId },
        _count: { id: true },
      }),
      this.prisma.booking.count({ where: { customerUserId } }),
      this.prisma.booking.count({
        where: { customerUserId, status: BookingStatus.COMPLETED },
      }),
      this.prisma.booking.count({
        where: { customerUserId, status: BookingStatus.CANCELLED },
      }),
      this.prisma.notification.count({
        where: { userId: customerUserId, isRead: false },
      }),
      (async () => {
        const cp = await this.prisma.customerProfile.findFirst({
          where: { userId: customerUserId },
          select: { id: true },
        });
        if (!cp) return 0;
        return this.prisma.review.count({
          where: { customerId: cp.id },
        });
      })(),
      (async () => {
        const completed = await this.prisma.payment.findMany({
          where: {
            payerUserId: customerUserId,
            status: PaymentStatus.COMPLETED,
          },
          select: { amount: true },
        });
        return completed.reduce((sum, p) => sum + Number(p.amount), 0);
      })(),
    ]);

    const byStatus = Object.fromEntries(
      bookingsByStatus.map((b) => [b.status, b._count.id]),
    );

    return {
      recentBookings,
      bookingsByStatus: {
        [BookingStatus.PENDING]: byStatus[BookingStatus.PENDING] ?? 0,
        [BookingStatus.CONFIRMED]: byStatus[BookingStatus.CONFIRMED] ?? 0,
        [BookingStatus.IN_PROGRESS]: byStatus[BookingStatus.IN_PROGRESS] ?? 0,
        [BookingStatus.COMPLETED]: byStatus[BookingStatus.COMPLETED] ?? 0,
        [BookingStatus.CANCELLED]: byStatus[BookingStatus.CANCELLED] ?? 0,
        [BookingStatus.DISPUTED]: byStatus[BookingStatus.DISPUTED] ?? 0,
      },
      totalBookings,
      totalCompletedBookings: totalCompleted,
      totalCancelledBookings: totalCancelled,
      unreadNotifications,
      recentReviewsCount,
      totalPaymentsCompletedAmount,
    };
  }

  async getMasterDashboard(masterUserId: string) {
    const masterProfile = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
      select: { id: true, averageRating: true, totalReviews: true },
    });

    if (!masterProfile) {
      return {
        pendingBookings: 0,
        confirmedBookings: 0,
        inProgressBookings: 0,
        completedBookings: 0,
      totalBookings: 0,
      averageRating: 0,
      totalReviews: 0,
      unreadNotifications: 0,
      activeServicesCount: 0,
      totalCompletedPayoutsAmount: 0,
      pendingPayoutsAmount: 0,
    };
  }

    const [
      bookingsByStatus,
      totalBookings,
      unreadNotifications,
      activeServicesCount,
      totalCompletedPayoutsAmount,
      pendingPayoutsAmount,
    ] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ["status"],
        where: { masterProfileId: masterProfile.id },
        _count: { id: true },
      }),
      this.prisma.booking.count({ where: { masterProfileId: masterProfile.id } }),
      this.prisma.notification.count({
        where: { userId: masterUserId, isRead: false },
      }),
      this.prisma.masterService.count({
        where: {
          masterProfileId: masterProfile.id,
          isActive: true,
        },
      }),
      (async () => {
        const completed = await this.prisma.payout.findMany({
          where: {
            masterProfileId: masterProfile.id,
            status: PayoutStatus.COMPLETED,
          },
          select: { amount: true },
        });
        return completed.reduce((sum, p) => sum + Number(p.amount), 0);
      })(),
      (async () => {
        const pending = await this.prisma.payout.findMany({
          where: {
            masterProfileId: masterProfile.id,
            status: PayoutStatus.PENDING,
          },
          select: { amount: true },
        });
        return pending.reduce((sum, p) => sum + Number(p.amount), 0);
      })(),
    ]);

    const byStatus = Object.fromEntries(
      bookingsByStatus.map((b) => [b.status, b._count.id]),
    );

    return {
      pendingBookings: byStatus[BookingStatus.PENDING] ?? 0,
      confirmedBookings: byStatus[BookingStatus.CONFIRMED] ?? 0,
      inProgressBookings: byStatus[BookingStatus.IN_PROGRESS] ?? 0,
      completedBookings: byStatus[BookingStatus.COMPLETED] ?? 0,
      totalBookings,
      averageRating: Number(masterProfile.averageRating),
      totalReviews: masterProfile.totalReviews,
      unreadNotifications,
      activeServicesCount,
      totalCompletedPayoutsAmount,
      pendingPayoutsAmount,
    };
  }

  async getAdminDashboard() {
    const [
      totalUsers,
      totalCustomers,
      totalMasters,
      pendingMasterVerifications,
      totalBookings,
      bookingsByStatus,
      totalReviews,
      openDisputes,
      activeCategories,
      activeServices,
      totalPayments,
      completedPayments,
      failedPayments,
      totalPayouts,
      pendingPayouts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: "CUSTOMER" } }),
      this.prisma.user.count({ where: { role: "MASTER" } }),
      this.prisma.masterProfile.count({
        where: { verificationStatus: "PENDING" },
      }),
      this.prisma.booking.count(),
      this.prisma.booking.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      this.prisma.review.count(),
      this.prisma.dispute.count({
        where: {
          status: {
            in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW],
          },
        },
      }),
      this.prisma.serviceCategory.count({
        where: { isActive: true },
      }),
      this.prisma.service.count({
        where: { isActive: true },
      }),
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
      this.prisma.payout.count(),
      this.prisma.payout.count({ where: { status: PayoutStatus.PENDING } }),
    ]);

    const byStatus = Object.fromEntries(
      bookingsByStatus.map((b) => [b.status, b._count.id]),
    );

    return {
      totalUsers,
      totalCustomers,
      totalMasters,
      pendingMasterVerifications,
      totalBookings,
      bookingsByStatus: {
        [BookingStatus.PENDING]: byStatus[BookingStatus.PENDING] ?? 0,
        [BookingStatus.CONFIRMED]: byStatus[BookingStatus.CONFIRMED] ?? 0,
        [BookingStatus.IN_PROGRESS]: byStatus[BookingStatus.IN_PROGRESS] ?? 0,
        [BookingStatus.COMPLETED]: byStatus[BookingStatus.COMPLETED] ?? 0,
        [BookingStatus.CANCELLED]: byStatus[BookingStatus.CANCELLED] ?? 0,
        [BookingStatus.DISPUTED]: byStatus[BookingStatus.DISPUTED] ?? 0,
      },
      totalReviews,
      unreadOrOpenDisputes: openDisputes,
      activeCategories,
      activeServices,
      totalPayments,
      completedPayments,
      failedPayments,
      totalPayouts,
      pendingPayouts,
    };
  }
}
