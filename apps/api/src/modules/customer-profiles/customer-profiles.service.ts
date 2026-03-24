import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "@prisma/client";
import type { UpdateCustomerProfileDto } from "./dto";

@Injectable()
export class CustomerProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isPhoneVerified: true,
            isEmailVerified: true,
            createdAt: true,
          },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException("Customer profile not found");
    }
    return profile;
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: UserRole.CUSTOMER },
      include: { customerProfile: true },
    });
    if (!user?.customerProfile) {
      throw new NotFoundException("Customer profile not found");
    }
    const { customerProfile } = user;
    return {
      id: customerProfile.id,
      userId: user.id,
      firstName: customerProfile.firstName,
      lastName: customerProfile.lastName,
      avatarUrl: customerProfile.avatarUrl,
      preferredLanguage: customerProfile.preferredLanguage,
      dateOfBirth: customerProfile.dateOfBirth,
      notes: customerProfile.notes,
      createdAt: customerProfile.createdAt,
      updatedAt: customerProfile.updatedAt,
      email: user.email,
      phone: user.phone,
      status: user.status,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
    };
  }

  async updateMe(userId: string, dto: UpdateCustomerProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: UserRole.CUSTOMER },
      include: { customerProfile: true },
    });
    if (!user?.customerProfile) {
      throw new NotFoundException("Customer profile not found");
    }

    return this.prisma.customerProfile.update({
      where: { id: user.customerProfile.id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.preferredLanguage !== undefined && {
          preferredLanguage: dto.preferredLanguage,
        }),
        ...(dto.dateOfBirth !== undefined && {
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }
}
