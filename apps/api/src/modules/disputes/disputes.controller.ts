import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";
import { DisputesService } from "./disputes.service";
import { CreateDisputeDto } from "./dto";

@ApiTags("disputes")
@Controller("disputes")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER, UserRole.MASTER)
@ApiBearerAuth()
export class DisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Post()
  create(@CurrentUser() userId: string, @Body() dto: CreateDisputeDto) {
    return this.disputes.create(userId, dto);
  }

  @Get("me")
  findMyDisputes(@CurrentUser() userId: string) {
    return this.disputes.findMyDisputes(userId);
  }

  @Get("me/:id")
  findMyDisputeById(@CurrentUser() userId: string, @Param("id") id: string) {
    return this.disputes.findMyDisputeById(userId, id);
  }
}
