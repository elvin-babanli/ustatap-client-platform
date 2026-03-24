import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserStatus } from "@prisma/client";
import { createHash } from "crypto";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { createStructuredLogger } from "../../common/utils/logger.util";
import { AUTH_ERRORS } from "./constants/auth.constants";
import type { LoginDto, RefreshTokenDto, RegisterDto } from "./dto";
import { RegisterRole } from "./dto/register.dto";
import type { AuthResponse, SafeUser } from "./interfaces";
import { toSafeUser } from "./utils/safe-user.util";

@Injectable()
export class AuthService {
  private readonly logger = createStructuredLogger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const role = dto.role ?? RegisterRole.CUSTOMER;
    if (role !== RegisterRole.CUSTOMER && role !== RegisterRole.MASTER) {
      throw new BadRequestException("Only CUSTOMER or MASTER role is allowed");
    }
    const user =
      role === RegisterRole.MASTER
        ? await this.users.createWithMasterProfile(dto)
        : await this.users.createWithCustomerProfile(dto);
    return this.createAuthResponse(user.id);
  }

  async login(
    dto: LoginDto,
    context?: { ip?: string; userAgent?: string; requestId?: string },
  ): Promise<AuthResponse> {
    this.validateLoginInput(dto);

    const user = await this.users.findByEmailOrPhone(dto.email, dto.phone);
    if (!user) {
      this.logger.warn("Login failed: user not found", {
        requestId: context?.requestId,
        ip: context?.ip,
      });
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    this.validateUserStatus(user.status);

    const validPassword = await this.users.validatePassword(
      dto.password,
      user.passwordHash,
    );
    if (!validPassword) {
      this.logger.warn("Login failed: invalid password", {
        requestId: context?.requestId,
        userId: user.id,
        ip: context?.ip,
      });
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    this.logger.info("Login success", {
      requestId: context?.requestId,
      userId: user.id,
      ip: context?.ip,
    });
    await this.users.updateLastLogin(user.id);

    return this.createAuthResponse(user.id, context);
  }

  async refresh(
    dto: RefreshTokenDto,
    context?: { ip?: string; userAgent?: string; requestId?: string },
  ): Promise<Omit<AuthResponse, "user">> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    if (!payload?.sub) {
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
    }

    const session = await this.prisma.session.findFirst({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
    }

    const refreshTokenHash = this.hashRefreshToken(dto.refreshToken);
    if (session.refreshTokenHash !== refreshTokenHash) {
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
    }

    await this.revokeSession(session.id);

    const tokens = await this.createTokens(payload.sub);
    await this.createSession(payload.sub, tokens.refreshToken, context);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    const payload = await this.verifyRefreshToken(refreshToken).catch(() => null);
    if (!payload?.sub) return;

    const hash = this.hashRefreshToken(refreshToken);
    await this.prisma.session.updateMany({
      where: { userId: payload.sub, refreshTokenHash: hash },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }
    this.validateUserStatus(user.status);
    return toSafeUser(user);
  }

  private validateLoginInput(dto: LoginDto): void {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException("Email or phone is required");
    }
  }

  private validateUserStatus(status: UserStatus): void {
    if (status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(AUTH_ERRORS.USER_SUSPENDED);
    }
    if (status === UserStatus.INACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.USER_INACTIVE);
    }
  }

  private async createAuthResponse(
    userId: string,
    context?: { ip?: string; userAgent?: string; requestId?: string },
  ): Promise<AuthResponse> {
    const [user, tokens] = await Promise.all([
      this.users.findById(userId),
      this.createTokens(userId),
    ]);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    await this.createSession(userId, tokens.refreshToken, context);

    return {
      ...tokens,
      user: toSafeUser(user),
    };
  }

  private async createTokens(userId: string) {
    const accessExpiresIn = this.config.get<string>("jwt.accessExpiresIn") ?? "15m";
    const refreshExpiresIn =
      this.config.get<string>("jwt.refreshExpiresIn") ?? "7d";

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId },
        {
          secret: this.config.get<string>("jwt.accessSecret"),
          expiresIn: accessExpiresIn,
        },
      ),
      this.jwt.signAsync(
        { sub: userId },
        {
          secret: this.config.get<string>("jwt.refreshSecret"),
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    const expiresIn = this.parseExpiresInSeconds(accessExpiresIn);

    return { accessToken, refreshToken, expiresIn };
  }

  private parseExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return value * (multipliers[unit] ?? 60);
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    context?: { ip?: string; userAgent?: string; requestId?: string },
  ) {
    const refreshExpiresIn =
      this.config.get<string>("jwt.refreshExpiresIn") ?? "7d";
    const expiresAt = new Date();
    const match = refreshExpiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === "d") expiresAt.setDate(expiresAt.getDate() + value);
      else if (unit === "h") expiresAt.setHours(expiresAt.getHours() + value);
      else if (unit === "m") expiresAt.setMinutes(expiresAt.getMinutes() + value);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        ipAddress: context?.ip,
        userAgent: context?.userAgent,
        expiresAt,
      },
    });
  }

  private async revokeSession(sessionId: string) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  private hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private async verifyRefreshToken(token: string) {
    return this.jwt.verifyAsync<{ sub: string }>(token, {
      secret: this.config.get<string>("jwt.refreshSecret"),
    });
  }

  // --- Forgot / Reset Password ---

  async forgotPassword(identifier: string): Promise<{ message: string }> {
    const user = await this.users.findByEmailOrPhone(
      identifier.includes("@") ? identifier : undefined,
      identifier.includes("@") ? undefined : identifier,
    );
    if (!user) {
      return { message: "If an account exists, a reset code has been sent." };
    }

    const code = this.generateResetCode();
    const codeHash = createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    });

    if (process.env.NODE_ENV !== "production") {
      this.logger.info("Password reset code (dev only)", {
        userId: user.id,
        code,
      });
    }
    return { message: "If an account exists, a reset code has been sent." };
  }

  async verifyResetCode(
    identifier: string,
    code: string,
  ): Promise<{ valid: boolean }> {
    const user = await this.users.findByEmailOrPhone(
      identifier.includes("@") ? identifier : undefined,
      identifier.includes("@") ? undefined : identifier,
    );
    if (!user) return { valid: false };

    const codeHash = createHash("sha256").update(code).digest("hex");
    const token = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        codeHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    return { valid: !!token };
  }

  async resetPassword(
    identifier: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.users.findByEmailOrPhone(
      identifier.includes("@") ? identifier : undefined,
      identifier.includes("@") ? undefined : identifier,
    );
    if (!user) {
      throw new UnauthorizedException("Invalid or expired reset code");
    }

    const codeHash = createHash("sha256").update(code).digest("hex");
    const token = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        codeHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!token) {
      throw new UnauthorizedException("Invalid or expired reset code");
    }

    const saltRounds = this.config.get<number>("bcrypt.saltRounds") ?? 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.session.updateMany({
        where: { userId: user.id },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private generateResetCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
