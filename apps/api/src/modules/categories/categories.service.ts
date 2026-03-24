import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateCategoryDto, UpdateCategoryDto } from "./dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    return this.prisma.serviceCategory.findMany({
      where,
      orderBy: { sortOrder: "asc" },
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
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.serviceCategory.findFirst({
      where: { slug, isActive: true },
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
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { services: { where: { isActive: true } } },
        },
      },
    });
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    const { _count, ...rest } = category;
    return { ...rest, serviceCount: _count.services };
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.serviceCategory.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException("Category slug already exists");
    }
    return this.prisma.serviceCategory.create({
      data: {
        nameAz: dto.nameAz,
        nameEn: dto.nameEn,
        nameRu: dto.nameRu,
        slug: dto.slug.toLowerCase(),
        descriptionAz: dto.descriptionAz,
        descriptionEn: dto.descriptionEn,
        descriptionRu: dto.descriptionRu,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findByIdOrThrow(id);
    if (dto.slug) {
      const existing = await this.prisma.serviceCategory.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException("Category slug already exists");
      }
    }
    return this.prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(dto.nameAz && { nameAz: dto.nameAz }),
        ...(dto.nameEn && { nameEn: dto.nameEn }),
        ...(dto.nameRu && { nameRu: dto.nameRu }),
        ...(dto.slug && { slug: dto.slug.toLowerCase() }),
        ...(dto.descriptionAz !== undefined && { descriptionAz: dto.descriptionAz }),
        ...(dto.descriptionEn !== undefined && { descriptionEn: dto.descriptionEn }),
        ...(dto.descriptionRu !== undefined && { descriptionRu: dto.descriptionRu }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    await this.findByIdOrThrow(id);
    return this.prisma.serviceCategory.update({
      where: { id },
      data: { isActive },
    });
  }

  private async findByIdOrThrow(id: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    return category;
  }
}
