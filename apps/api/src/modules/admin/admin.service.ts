import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, UserStatus, VerificationStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import type { PaginatedResponse } from "../../common/dto";
import type {
  MasterVerificationsQueryDto,
  UpdateMasterVerificationStatusDto,
  UsersQueryDto,
  UpdateUserStatusDto,
} from "./dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async findMasterVerifications(
    query: MasterVerificationsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.MasterProfileWhereInput = {};

    if (query.verificationStatus) {
      where.verificationStatus = query.verificationStatus;
    }
    if (query.masterProfileId) {
      where.id = query.masterProfileId;
    }
    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { displayName: { contains: s, mode: "insensitive" } },
        {
          user: {
            OR: [
              { email: { contains: s, mode: "insensitive" } },
              { phone: { contains: s } },
            ],
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.masterProfile.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          displayName: true,
          verificationStatus: true,
          reviewedAt: true,
          rejectionReason: true,
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: { verificationDocuments: true },
          },
        },
      }),
      this.prisma.masterProfile.count({ where }),
    ]);

    return {
      items: items.map((m) => ({
        id: m.id,
        displayName: m.displayName,
        verificationStatus: m.verificationStatus,
        reviewedAt: m.reviewedAt,
        rejectionReason: m.rejectionReason,
        documentsCount: m._count.verificationDocuments,
        user: m.user,
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async findMasterVerificationById(masterProfileId: string) {
    const master = await this.prisma.masterProfile.findUnique({
      where: { id: masterProfileId },
      select: {
        id: true,
        displayName: true,
        bio: true,
        verificationStatus: true,
        rejectionReason: true,
        reviewedAt: true,
        reviewedBy: {
          select: { id: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        verificationDocuments: {
          select: {
            id: true,
            documentType: true,
            fileUrl: true,
            originalFileName: true,
            status: true,
            rejectionReason: true,
            reviewedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    return {
      id: master.id,
      displayName: master.displayName,
      bio: master.bio,
      verificationStatus: master.verificationStatus,
      rejectionReason: master.rejectionReason,
      reviewedAt: master.reviewedAt,
      reviewerId: master.reviewedBy?.id,
      user: master.user,
      documents: master.verificationDocuments,
    };
  }

  async updateMasterVerificationStatus(
    adminUserId: string,
    masterProfileId: string,
    dto: UpdateMasterVerificationStatusDto,
  ) {
    const master = await this.prisma.masterProfile.findUnique({
      where: { id: masterProfileId },
    });

    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    if (dto.status === VerificationStatus.REJECTED && !dto.rejectionReason?.trim()) {
      throw new BadRequestException("Rejection reason is required when rejecting");
    }

    const previousStatus = master.verificationStatus;

    const updated = await this.prisma.masterProfile.update({
      where: { id: masterProfileId },
      data: {
        verificationStatus: dto.status,
        rejectionReason:
          dto.status === VerificationStatus.REJECTED
            ? dto.rejectionReason?.trim() ?? null
            : null,
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
      },
    });

    await this.auditLogs.log({
      actorUserId: adminUserId,
      entityType: "MasterProfile",
      entityId: masterProfileId,
      action: "VERIFICATION_STATUS_UPDATE",
      metadata: {
        previousStatus,
        nextStatus: dto.status,
        rejectionReason: dto.rejectionReason ? "[REDACTED]" : undefined,
      },
    });

    return this.findMasterVerificationById(masterProfileId);
  }

  async findUsers(query: UsersQueryDto): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.UserWhereInput = {};

    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { email: { contains: s, mode: "insensitive" } },
        { phone: { contains: s } },
        {
          customerProfile: {
            OR: [
              { firstName: { contains: s, mode: "insensitive" } },
              { lastName: { contains: s, mode: "insensitive" } },
            ],
          },
        },
        {
          masterProfile: {
            displayName: { contains: s, mode: "insensitive" },
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          customerProfile: {
            select: { firstName: true, lastName: true },
          },
          masterProfile: {
            select: { displayName: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
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

  async updateUserStatus(
    adminUserId: string,
    targetUserId: string,
    dto: UpdateUserStatusDto,
  ) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target) {
      throw new NotFoundException("User not found");
    }

    if (targetUserId === adminUserId && dto.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException("Cannot suspend yourself");
    }

    const previousStatus = target.status;

    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { status: dto.status },
    });

    await this.auditLogs.log({
      actorUserId: adminUserId,
      entityType: "User",
      entityId: targetUserId,
      action: "STATUS_UPDATE",
      metadata: {
        previousStatus,
        nextStatus: dto.status,
      },
    });

    return { id: targetUserId, status: dto.status };
  }

  async findDisputes() {
    return this.prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        openedBy: {
          select: {
            id: true,
            email: true,
            phone: true,
            customerProfile: { select: { firstName: true, lastName: true } },
            masterProfile: { select: { displayName: true } },
          },
        },
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

  async findDisputeById(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
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
    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }
    return dispute;
  }
}
