import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { MasterProfilesService } from "./master-profiles.service";
import { ReviewsService } from "../reviews/reviews.service";
import {
  MastersQueryDto,
  UpdateMasterProfileDto,
  UpdateMasterServicesDto,
  CreateVerificationDocumentDto,
} from "./dto";
import { ReviewsQueryDto } from "../reviews/dto";

@Controller()
export class MasterProfilesController {
  constructor(
    private readonly masterProfiles: MasterProfilesService,
    private readonly reviews: ReviewsService,
  ) {}

  @Get("masters")
  findPublicListing(@Query() query: MastersQueryDto) {
    return this.masterProfiles.findPublicListing(query);
  }

  @Get("masters/:id")
  findPublicById(@Param("id") id: string) {
    return this.masterProfiles.findPublicById(id);
  }

  @Get("masters/:id/reviews")
  findMasterReviews(
    @Param("id") masterId: string,
    @Query() query: ReviewsQueryDto,
  ) {
    return this.reviews.findByMasterProfileId(masterId, query);
  }

  @Get("master-profile/me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  getMe(@CurrentUser() userId: string) {
    return this.masterProfiles.getMe(userId);
  }

  @Patch("master-profile/me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  updateMe(
    @CurrentUser() userId: string,
    @Body() dto: UpdateMasterProfileDto,
  ) {
    return this.masterProfiles.updateMe(userId, dto);
  }

  @Put("master-profile/me/services")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  updateMyServices(
    @CurrentUser() userId: string,
    @Body() dto: UpdateMasterServicesDto,
  ) {
    return this.masterProfiles.updateMyServices(userId, dto.services);
  }

  @Get("master-profile/me/verification")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  getVerificationSummary(@CurrentUser() userId: string) {
    return this.masterProfiles.getVerificationSummary(userId);
  }

  @Post("master-profile/me/verification-documents")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  createVerificationDocument(
    @CurrentUser() userId: string,
    @Body() dto: CreateVerificationDocumentDto,
  ) {
    return this.masterProfiles.createVerificationDocument(userId, dto);
  }

  @Get("master-profile/me/verification-documents")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  getVerificationDocuments(@CurrentUser() userId: string) {
    return this.masterProfiles.findVerificationDocuments(userId);
  }

  @Get("master-profile/me/verification-documents/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  getVerificationDocumentById(
    @CurrentUser() userId: string,
    @Param("id") id: string,
  ) {
    return this.masterProfiles.findVerificationDocumentById(userId, id);
  }
}
