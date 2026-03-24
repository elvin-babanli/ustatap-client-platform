import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { PaginatedResponse, PaginationMeta } from "../../common/dto";
import type { CreateServiceDto, UpdateServiceDto } from "./dto";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: { categorySlug?: string; search?: string },
    pagination: { page: number; limit: number },
  ): Promise<PaginatedResponse<unknown>> {
    const { page, limit } = pagination;
    const where: Prisma.ServiceWhereInput = { isActive: true };

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug, isActive: true };
    }

    if (query.search?.trim()) {
      const search = query.search.trim().toLowerCase();
      where.OR = [
        { nameAz: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
        { nameRu: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nameAz: true,
          nameEn: true,
          nameRu: true,
          slug: true,
          descriptionAz: true,
          descriptionEn: true,
          descriptionRu: true,
          isActive: true,
          categoryId: true,
          category: {
            select: { id: true, nameAz: true, nameEn: true, nameRu: true, slug: true },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return { items, meta };
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, isActive: true },
      include: {
        category: {
          select: {
            id: true,
            nameAz: true,
            nameEn: true,
            nameRu: true,
            slug: true,
            sortOrder: true,
          },
        },
      },
    });
    if (!service) {
      throw new NotFoundException("Service not found");
    }
    return service;
  }

  async create(dto: CreateServiceDto) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: dto.categoryId, isActive: true },
    });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const existing = await this.prisma.service.findUnique({
      where: {
        categoryId_slug: {
          categoryId: dto.categoryId,
          slug: dto.slug.toLowerCase(),
        },
      },
    });
    if (existing) {
      throw new ConflictException("Service slug already exists in this category");
    }

    return this.prisma.service.create({
      data: {
        categoryId: dto.categoryId,
        nameAz: dto.nameAz,
        nameEn: dto.nameEn,
        nameRu: dto.nameRu,
        slug: dto.slug.toLowerCase(),
        descriptionAz: dto.descriptionAz,
        descriptionEn: dto.descriptionEn,
        descriptionRu: dto.descriptionRu,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.findByIdOrThrow(id);

    if (dto.categoryId && dto.categoryId !== service.categoryId) {
      const category = await this.prisma.serviceCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException("Category not found");
      }
    }

    if (dto.slug) {
      const categoryId = dto.categoryId ?? service.categoryId;
      const existing = await this.prisma.service.findFirst({
        where: {
          categoryId,
          slug: dto.slug.toLowerCase(),
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException("Service slug already exists in this category");
      }
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.nameAz && { nameAz: dto.nameAz }),
        ...(dto.nameEn && { nameEn: dto.nameEn }),
        ...(dto.nameRu && { nameRu: dto.nameRu }),
        ...(dto.slug && { slug: dto.slug.toLowerCase() }),
        ...(dto.descriptionAz !== undefined && { descriptionAz: dto.descriptionAz }),
        ...(dto.descriptionEn !== undefined && { descriptionEn: dto.descriptionEn }),
        ...(dto.descriptionRu !== undefined && { descriptionRu: dto.descriptionRu }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    await this.findByIdOrThrow(id);
    return this.prisma.service.update({
      where: { id },
      data: { isActive },
    });
  }

  private async findByIdOrThrow(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      throw new NotFoundException("Service not found");
    }
    return service;
  }
}
