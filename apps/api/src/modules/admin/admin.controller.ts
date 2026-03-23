import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AdminService } from "./admin.service";
import {
  MasterVerificationsQueryDto,
  UpdateMasterVerificationStatusDto,
  UsersQueryDto,
  UpdateUserStatusDto,
} from "./dto";

/** Moderate rate limit for admin mutations */
const ADMIN_MUTATION_THROTTLE = { default: { limit: 30, ttl: 60000 } };

@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("master-verifications")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findMasterVerifications(@Query() query: MasterVerificationsQueryDto) {
    return this.admin.findMasterVerifications(query);
  }

  @Get("master-verifications/:masterProfileId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findMasterVerificationById(@Param("masterProfileId") masterProfileId: string) {
    return this.admin.findMasterVerificationById(masterProfileId);
  }

  @Throttle(ADMIN_MUTATION_THROTTLE)
  @Patch("master-verifications/:masterProfileId/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateMasterVerificationStatus(
    @CurrentUser() userId: string,
    @Param("masterProfileId") masterProfileId: string,
    @Body() dto: UpdateMasterVerificationStatusDto,
  ) {
    return this.admin.updateMasterVerificationStatus(
      userId,
      masterProfileId,
      dto,
    );
  }

  @Get("users")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findUsers(@Query() query: UsersQueryDto) {
    return this.admin.findUsers(query);
  }

  @Throttle(ADMIN_MUTATION_THROTTLE)
  @Patch("users/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateUserStatus(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.admin.updateUserStatus(userId, id, dto);
  }
}
