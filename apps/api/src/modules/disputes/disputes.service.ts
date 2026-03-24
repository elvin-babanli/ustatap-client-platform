import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, DisputeIssueType, DisputeStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateDisputeDto } from "./dto";

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDisputeDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        customer: true,
        masterProfile: { include: { user: true } },
      },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    const isCustomer = booking.customerUserId === userId;
    const isMaster = booking.masterProfile.userId === userId;
    if (!isCustomer && !isMaster) {
      throw new ForbiddenException("You can only open disputes for your own bookings");
    }
    const existing = await this.prisma.dispute.findUnique({
      where: { bookingId: dto.bookingId },
    });
    if (existing) {
      throw new BadRequestException("A dispute already exists for this booking");
    }

    return this.prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          bookingId: dto.bookingId,
          openedByUserId: userId,
          issueType: dto.issueType as unknown as DisputeIssueType,
          reason: dto.reason,
          attachmentUrls: (dto.attachmentUrls ?? []) as object,
          status: DisputeStatus.OPEN,
        },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
              scheduledDate: true,
              estimatedPrice: true,
              currency: true,
            },
          },
        },
      });
      await tx.booking.update({
        where: { id: dto.bookingId },
        data: { status: BookingStatus.DISPUTED },
      });
      return dispute;
    });
  }

  async findMyDisputes(userId: string) {
    const where = {
      OR: [
        { openedByUserId: userId },
        { booking: { customerUserId: userId } },
        { booking: { masterProfile: { userId } } },
      ],
    };

    return this.prisma.dispute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            estimatedPrice: true,
            currency: true,
            customer: { select: { id: true } },
            masterProfile: { select: { id: true, displayName: true } },
          },
        },
      },
    });
  }

  async findMyDisputeById(userId: string, disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: {
          include: {
            customer: { select: { id: true } },
            masterProfile: { select: { id: true, displayName: true, userId: true } },
          },
        },
      },
    });
    if (!dispute) throw new NotFoundException("Dispute not found");

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException("User not found");

    const isOwner =
      dispute.openedByUserId === userId ||
      dispute.booking.customerUserId === userId ||
      dispute.booking.masterProfile.userId === userId;
    if (!isOwner && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Access denied");
    }

    return dispute;
  }

  async findAdminDisputes() {
    return this.prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            estimatedPrice: true,
            currency: true,
          },
        },
      },
    });
  }

  async findAdminDisputeById(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                phone: true,
                customerProfile: { select: { firstName: true, lastName: true } },
              },
            },
            masterProfile: {
              select: {
                id: true,
                displayName: true,
                user: { select: { email: true, phone: true } },
              },
            },
          },
        },
      },
    });
    if (!dispute) throw new NotFoundException("Dispute not found");
    return dispute;
  }
}
