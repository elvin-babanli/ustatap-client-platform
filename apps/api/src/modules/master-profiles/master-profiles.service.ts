import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, UserRole, VerificationStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import type { PaginatedResponse, PaginationMeta } from "../../common/dto";
import type {
  MastersQueryDto,
  UpdateMasterProfileDto,
  MasterServiceItemDto,
  CreateVerificationDocumentDto,
} from "./dto";

const DOCUMENT_SELECT = {
  id: true,
  documentType: true,
  fileUrl: true,
  originalFileName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class MasterProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async findPublicListing(
    query: MastersQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const { page, limit } = query;
    const sortBy = query.sortBy ?? "recommended";
    const sortOrder = query.sortOrder ?? "desc";

    const where: Prisma.MasterProfileWhereInput = {
      verificationStatus:
        query.verifiedOnly === false ? undefined : VerificationStatus.APPROVED,
      isAvailable: query.isAvailable ?? true,
    };

    if (query.city) {
      where.serviceAreas = {
        some: {
          city: { equals: query.city, mode: "insensitive" },
        },
      };
    }

    if (query.minRating != null && query.minRating > 0) {
      where.averageRating = { gte: query.minRating };
    }

    const masterServiceFilter: Prisma.MasterServiceWhereInput = {
      isActive: true,
      service: {
        isActive: true,
        ...(query.serviceSlug && { slug: query.serviceSlug }),
        ...(query.categorySlug && {
          category: {
            slug: query.categorySlug,
            isActive: true,
          },
        }),
      },
    };

    if (query.priceMin != null || query.priceMax != null) {
      masterServiceFilter.basePrice = {};
      if (query.priceMin != null) {
        (masterServiceFilter.basePrice as Prisma.DecimalFilter).gte = query.priceMin;
      }
      if (query.priceMax != null) {
        (masterServiceFilter.basePrice as Prisma.DecimalFilter).lte = query.priceMax;
      }
    }

    const hasServiceFilter =
      query.serviceSlug ||
      query.categorySlug ||
      query.priceMin != null ||
      query.priceMax != null;
    if (hasServiceFilter) {
      where.masterServices = {
        some: masterServiceFilter,
      };
    }

    const resolvedSortBy =
      sortBy === "recommended" || sortBy === "nearest" || sortBy === "fastestArrival" || sortBy === "ratingDesc"
        ? "averageRating"
        : sortBy === "priceAsc"
          ? "averageRating"
          : sortBy;
    const resolvedOrder =
      sortBy === "priceAsc" ? "asc" : sortBy === "ratingDesc" ? "desc" : sortOrder;

    const orderBy: Prisma.MasterProfileOrderByWithRelationInput = {
      [resolvedSortBy]: resolvedOrder,
    };

    const [items, total] = await Promise.all([
      this.prisma.masterProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          displayName: true,
          bio: true,
          experienceYears: true,
          avatarUrl: true,
          averageRating: true,
          totalReviews: true,
          completedJobsCount: true,
          isAvailable: true,
          verificationStatus: true,
          createdAt: true,
          masterServices: {
            where: { isActive: true },
            select: {
              id: true,
              basePrice: true,
              currency: true,
              service: {
                select: {
                  id: true,
                  nameAz: true,
                  nameEn: true,
                  nameRu: true,
                  slug: true,
                  category: {
                    select: { id: true, nameEn: true, slug: true },
                  },
                },
              },
            },
          },
          serviceAreas: {
            select: { city: true, district: true, latitude: true, longitude: true },
          },
        },
      }),
      this.prisma.masterProfile.count({ where }),
    ]);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return { items, meta };
  }

  async findPublicById(id: string) {
    const master = await this.prisma.masterProfile.findFirst({
      where: {
        id,
        verificationStatus: VerificationStatus.APPROVED,
      },
      select: {
        id: true,
        displayName: true,
        bio: true,
        experienceYears: true,
        avatarUrl: true,
        averageRating: true,
        totalReviews: true,
        completedJobsCount: true,
        isAvailable: true,
        verificationStatus: true,
        createdAt: true,
        masterServices: {
          where: { isActive: true },
          select: {
            id: true,
            basePrice: true,
            currency: true,
            service: {
              select: {
                id: true,
                nameAz: true,
                nameEn: true,
                nameRu: true,
                slug: true,
                descriptionAz: true,
                descriptionEn: true,
                descriptionRu: true,
                category: {
                  select: { id: true, nameAz: true, nameEn: true, nameRu: true, slug: true },
                },
              },
            },
          },
        },
        serviceAreas: {
          select: { city: true, district: true, latitude: true, longitude: true },
        },
      },
    });
    if (!master) {
      throw new NotFoundException("Master not found");
    }
    return master;
  }

  async getMe(userId: string) {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId, user: { role: UserRole.MASTER } },
      include: {
        masterServices: {
          where: { isActive: true },
          include: {
            service: {
              select: {
                id: true,
                nameAz: true,
                nameEn: true,
                nameRu: true,
                slug: true,
                category: { select: { id: true, nameEn: true, slug: true } },
              },
            },
          },
        },
        serviceAreas: true,
      },
    });
    if (!master) {
      throw new NotFoundException("Master profile not found");
    }
    return master;
  }

  async updateMe(userId: string, dto: UpdateMasterProfileDto) {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId, user: { role: UserRole.MASTER } },
    });
    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    return this.prisma.masterProfile.update({
      where: { id: master.id },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.experienceYears !== undefined && {
          experienceYears: dto.experienceYears,
        }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
      },
    });
  }

  async updateMyServices(userId: string, items: MasterServiceItemDto[]) {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId, user: { role: UserRole.MASTER } },
    });
    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    const serviceIds = items.map((i) => i.serviceId);
    if (new Set(serviceIds).size !== serviceIds.length) {
      throw new BadRequestException("Duplicate service IDs not allowed");
    }

    const services = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        isActive: true,
      },
    });
    if (services.length !== serviceIds.length) {
      throw new BadRequestException("One or more services not found or inactive");
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.masterService.upsert({
          where: {
            masterProfileId_serviceId: {
              masterProfileId: master.id,
              serviceId: item.serviceId,
            },
          },
          create: {
            masterProfileId: master.id,
            serviceId: item.serviceId,
            basePrice: item.basePrice,
            currency: item.currency,
            isActive: item.isActive ?? true,
          },
          update: {
            basePrice: item.basePrice,
            currency: item.currency,
            isActive: item.isActive ?? true,
          },
        });
      }

      const currentServiceIds = await tx.masterService.findMany({
        where: { masterProfileId: master.id },
        select: { serviceId: true },
      });
      const toRemove = currentServiceIds
        .filter((c) => !serviceIds.includes(c.serviceId))
        .map((c) => c.serviceId);
      if (toRemove.length > 0) {
        await tx.masterService.updateMany({
          where: {
            masterProfileId: master.id,
            serviceId: { in: toRemove },
          },
          data: { isActive: false },
        });
      }
    });

    return this.prisma.masterService.findMany({
      where: { masterProfileId: master.id, isActive: true },
      include: {
        service: {
          select: {
            id: true,
            nameAz: true,
            nameEn: true,
            nameRu: true,
            slug: true,
            category: { select: { id: true, nameEn: true, slug: true } },
          },
        },
      },
    });
  }

  async getVerificationSummary(masterUserId: string) {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
      select: {
        id: true,
        verificationStatus: true,
        rejectionReason: true,
        reviewedAt: true,
        verificationDocuments: {
          select: DOCUMENT_SELECT,
        },
      },
    });
    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    const docs = master.verificationDocuments;
    const submittedDocumentsCount = docs.length;
    const pendingDocumentsCount = docs.filter((d) => d.status === VerificationStatus.PENDING).length;
    const approvedDocumentsCount = docs.filter((d) => d.status === VerificationStatus.APPROVED).length;
    const rejectedDocumentsCount = docs.filter((d) => d.status === VerificationStatus.REJECTED).length;

    const latestRejectionReason =
      master.verificationStatus === VerificationStatus.REJECTED
        ? master.rejectionReason
        : null;

    return {
      verificationStatus: master.verificationStatus,
      submittedDocumentsCount,
      pendingDocumentsCount,
      approvedDocumentsCount,
      rejectedDocumentsCount,
      latestRejectionReason,
      documents: docs.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        fileUrl: d.fileUrl,
        originalFileName: d.originalFileName,
        status: d.status,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    };
  }

  async createVerificationDocument(
    masterUserId: string,
    dto: CreateVerificationDocumentDto,
  ) {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    const doc = await this.prisma.masterVerificationDocument.create({
      data: {
        masterProfileId: master.id,
        documentType: dto.documentType,
        fileUrl: dto.fileUrl.trim(),
        originalFileName: dto.originalFileName?.trim() ?? null,
        status: VerificationStatus.PENDING,
      },
      select: DOCUMENT_SELECT,
    });

    await this.auditLogs.log({
      actorUserId: masterUserId,
      entityType: "MasterVerificationDocument",
      entityId: doc.id,
      action: "CREATE",
      metadata: { documentType: dto.documentType },
    });

    return doc;
  }

  async findVerificationDocuments(masterUserId: string) {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    return this.prisma.masterVerificationDocument.findMany({
      where: { masterProfileId: master.id },
      select: DOCUMENT_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  async findVerificationDocumentById(
    masterUserId: string,
    documentId: string,
  ) {
    const master = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!master) {
      throw new NotFoundException("Master profile not found");
    }

    const doc = await this.prisma.masterVerificationDocument.findFirst({
      where: {
        id: documentId,
        masterProfileId: master.id,
      },
      select: DOCUMENT_SELECT,
    });

    if (!doc) {
      throw new NotFoundException("Document not found");
    }

    return doc;
  }
}
