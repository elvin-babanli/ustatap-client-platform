import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CustomerProfilesService } from "./customer-profiles.service";
import { UpdateCustomerProfileDto } from "./dto";

@Controller("customer-profile")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerProfilesController {
  constructor(private readonly customerProfiles: CustomerProfilesService) {}

  @Get("me")
  getMe(@CurrentUser() userId: string) {
    return this.customerProfiles.getMe(userId);
  }

  @Patch("me")
  updateMe(
    @CurrentUser() userId: string,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.customerProfiles.updateMe(userId, dto);
  }
}
