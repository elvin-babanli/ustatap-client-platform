import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from "./dto";

/** Stricter rate limit for auth endpoints (brute-force mitigation) */
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60000 } }; // 5 req/min

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle(AUTH_THROTTLE)
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const result = await this.auth.register(dto);
    return this.formatAuthResponse(result);
  }

  @Throttle(AUTH_THROTTLE)
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ) {
    const context = this.getRequestContext(req);
    const result = await this.auth.login(dto, context);
    return this.formatAuthResponse(result);
  }

  @Throttle(AUTH_THROTTLE)
  @Post("refresh")
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    const context = this.getRequestContext(req);
    return this.auth.refresh(dto, context);
  }

  @Throttle(AUTH_THROTTLE)
  @Post("logout")
  async logout(@Body() dto: RefreshTokenDto) {
    await this.auth.logout(dto.refreshToken);
    return { message: "Logged out successfully" };
  }

  @ApiBearerAuth()
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() userId: string) {
    return this.auth.me(userId);
  }

  @Throttle(AUTH_THROTTLE)
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.identifier);
  }

  @Throttle(AUTH_THROTTLE)
  @Post("verify-reset-code")
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.auth.verifyResetCode(dto.identifier, dto.code);
  }

  @Throttle(AUTH_THROTTLE)
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(
      dto.identifier,
      dto.code,
      dto.newPassword,
    );
    return { message: "Password has been reset successfully" };
  }

  private getRequestContext(req: Request) {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket?.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const requestId = (req as Request & { requestId?: string }).requestId;
    return { ip, userAgent, requestId };
  }

  private formatAuthResponse(result: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: { id: string; email: string | null; phone: string; role: string; status: string; isPhoneVerified: boolean; isEmailVerified: boolean; createdAt: Date };
  }) {
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      user: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        status: result.user.status,
        isPhoneVerified: result.user.isPhoneVerified,
        isEmailVerified: result.user.isEmailVerified,
        createdAt: result.user.createdAt,
      },
    };
  }

}
