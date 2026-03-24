import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { BookingsService } from "./bookings.service";
import {
  CreateBookingDto,
  CancelBookingDto,
  UpdateBookingStatusDto,
  AddBookingAttachmentsDto,
} from "./dto";
import {
  BookingsQueryDto,
  AdminBookingsQueryDto,
} from "./dto";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@CurrentUser() userId: string, @Body() dto: CreateBookingDto) {
    return this.bookings.create(userId, dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMyBookings(
    @CurrentUser() userId: string,
    @Query() query: BookingsQueryDto,
  ) {
    return this.bookings.findCustomerBookings(userId, query);
  }

  @Get("me/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMyBookingById(
    @CurrentUser() userId: string,
    @Param("id") id: string,
  ) {
    return this.bookings.findCustomerBookingById(userId, id);
  }

  @Patch("me/:id/cancel")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  cancelMyBooking(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookings.cancelByCustomer(userId, id, dto.reason);
  }

  @Post("me/:id/attachments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  addAttachments(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: AddBookingAttachmentsDto,
  ) {
    return this.bookings.addAttachments(userId, id, dto);
  }

  @Get("master/me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  findMasterBookings(
    @CurrentUser() userId: string,
    @Query() query: BookingsQueryDto,
  ) {
    return this.bookings.findMasterBookingsByUserId(userId, query);
  }

  @Get("master/me/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  findMasterBookingById(
    @CurrentUser() userId: string,
    @Param("id") id: string,
  ) {
    return this.bookings.findMasterBookingByIdByUserId(userId, id);
  }

  @Patch("master/me/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MASTER)
  updateMasterBookingStatus(
    @CurrentUser() userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookings.updateStatusByMaster(userId, id, dto);
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAdminBookings(@Query() query: AdminBookingsQueryDto) {
    return this.bookings.findAdminBookings(query);
  }

  @Get("admin/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAdminBookingById(@Param("id") id: string) {
    return this.bookings.findAdminBookingById(id);
  }
}
