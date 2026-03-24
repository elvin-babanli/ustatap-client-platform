import { ConflictException, Injectable } from "@nestjs/common";
import { UserRole, UserStatus, VerificationStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import type { RegisterDto } from "../auth/dto";
import { RegisterRole } from "../auth/dto/register.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmailOrPhone(email?: string, phone?: string) {
    if (email) {
      return this.findByEmail(email);
    }
    if (phone) {
      return this.findByPhone(phone);
    }
    return null;
  }

  async createWithCustomerProfile(dto: RegisterDto) {
    const saltRounds = this.config.get<number>("bcrypt.saltRounds") ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const normalizedPhone = this.normalizePhone(dto.phone);
    const normalizedEmail = dto.email ? dto.email.trim().toLowerCase() : null;

    await this.validateUniqueEmailPhone(normalizedEmail, normalizedPhone);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfile: {
          create: {
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });

    return user;
  }

  async createWithMasterProfile(dto: RegisterDto) {
    const saltRounds = this.config.get<number>("bcrypt.saltRounds") ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const normalizedPhone = this.normalizePhone(dto.phone);
    const normalizedEmail = dto.email ? dto.email.trim().toLowerCase() : null;

    await this.validateUniqueEmailPhone(normalizedEmail, normalizedPhone);

    const displayName = `${dto.firstName.trim()} ${dto.lastName.trim()}`.trim() || "Master";

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        role: UserRole.MASTER,
        status: UserStatus.PENDING_VERIFICATION,
        masterProfile: {
          create: {
            displayName,
            bio: dto.bio?.trim() || null,
            experienceYears: dto.experienceYears ?? null,
            verificationStatus: VerificationStatus.PENDING,
          },
        },
      },
      include: {
        masterProfile: true,
      },
    });

    if (dto.categoryId && dto.startingPrice != null && dto.startingPrice > 0) {
      const service = await this.prisma.service.findFirst({
        where: { categoryId: dto.categoryId, isActive: true },
      });
      if (service && user.masterProfile) {
        await this.prisma.masterService.create({
          data: {
            masterProfileId: user.masterProfile.id,
            serviceId: service.id,
            basePrice: dto.startingPrice,
            currency: "AZN",
          },
        });
      }
    }

    return user;
  }

  async validatePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  private async validateUniqueEmailPhone(
    email: string | null,
    phone: string,
  ): Promise<void> {
    if (email) {
      const existing = await this.findByEmail(email);
      if (existing) {
        throw new ConflictException("Email already registered");
      }
    }
    const existingPhone = await this.findByPhone(phone);
    if (existingPhone) {
      throw new ConflictException("Phone number already registered");
    }
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\s+/g, "").trim();
  }
}
