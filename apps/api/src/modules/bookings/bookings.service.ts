import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, Currency, UserRole, VerificationStatus } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { PaginatedResponse, PaginationMeta } from "../../common/dto";
import {
  canCustomerCancel,
  canTransition,
} from "./utils/booking-status.util";
import type {
  CreateBookingDto,
  UpdateBookingStatusDto,
  BookingsQueryDto,
  AdminBookingsQueryDto,
  CreateBookingAddressDto,
  CreateBookingAttachmentDto,
  AddBookingAttachmentsDto,
} from "./dto";

const BOOKING_SELECT = {
  id: true,
  status: true,
  scheduledDate: true,
  scheduledTimeStart: true,
  scheduledTimeEnd: true,
  problemDescription: true,
  estimatedPrice: true,
  finalPrice: true,
  currency: true,
  canceledAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  masterProfile: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      averageRating: true,
      totalReviews: true,
    },
  },
  masterService: {
    select: {
      id: true,
      basePrice: true,
      currency: true,
      service: {
        select: {
          id: true,
          nameAz: true,
          nameEn: true,
          nameRu: true,
          slug: true,
        },
      },
    },
  },
  address: {
    select: {
      id: true,
      city: true,
      district: true,
      street: true,
      building: true,
    },
  },
} as const;

export interface BookingDetailSelect {
  attachments: true;
  statusHistory: {
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      note: true,
      createdAt: true,
    };
    orderBy: { createdAt: "desc" };
  };
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(customerUserId: string, dto: CreateBookingDto) {
    const { addressId, address, masterProfileId, masterServiceId } = dto;

    if (!addressId && !address) {
      throw new BadRequestException("Address or addressId is required");
    }

    const [masterService, masterProfile] = await Promise.all([
      this.prisma.masterService.findFirst({
        where: {
          id: masterServiceId,
          masterProfileId,
          isActive: true,
          service: { isActive: true },
          masterProfile: {
            verificationStatus: VerificationStatus.APPROVED,
            isAvailable: true,
          },
        },
        include: { service: true },
      }),
      this.prisma.masterProfile.findFirst({
        where: { id: masterProfileId, verificationStatus: VerificationStatus.APPROVED },
      }),
    ]);

    if (!masterService || !masterProfile) {
      throw new BadRequestException("Master or service not available for booking");
    }

    if (masterService.masterProfileId !== masterProfileId) {
      throw new BadRequestException("Service does not belong to the specified master");
    }

    const scheduledDate = new Date(dto.scheduledDate);
    const [timeStart, timeEnd] = this.parseTimeStrings(
      dto.scheduledTimeStart,
      dto.scheduledTimeEnd,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      let resolvedAddressId: string;

      if (addressId) {
        const addr = await tx.address.findFirst({
          where: { id: addressId },
        });
        if (!addr) {
          throw new BadRequestException("Address not found");
        }
        resolvedAddressId = addressId;
      } else if (address) {
        const created = await tx.address.create({
          data: this.addressDtoToCreate(address, customerUserId),
        });
        resolvedAddressId = created.id;
      } else {
        throw new BadRequestException("Address or addressId is required");
      }

      const booking = await tx.booking.create({
        data: {
          customerUserId,
          masterProfileId,
          masterServiceId,
          serviceId: masterService.serviceId,
          addressId: resolvedAddressId,
          status: BookingStatus.PENDING,
          scheduledDate,
          scheduledTimeStart: timeStart,
          scheduledTimeEnd: timeEnd,
          problemDescription: dto.problemDescription,
          estimatedPrice: dto.estimatedPrice,
          currency: dto.currency as Currency,
        },
        include: BOOKING_SELECT,
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.PENDING,
          changedByUserId: customerUserId,
          note: "Booking created",
        },
      });

      if (dto.attachments?.length) {
        await tx.bookingAttachment.createMany({
          data: dto.attachments.map((a) => ({
            bookingId: booking.id,
            fileUrl: a.fileUrl,
            fileType: a.fileType,
          })),
        });
      }

      return this.findByIdWithDetails(tx, booking.id);
    });

    const master = await this.prisma.masterProfile.findUnique({
      where: { id: masterProfileId },
      select: { userId: true },
    });
    if (master) {
      this.notifications.createForUser(
        master.userId,
        "BOOKING_CREATED",
        "New booking received",
        "You have received a new booking request.",
      );
    }
    return result;
  }

  async findCustomerBookings(
    customerUserId: string,
    query: BookingsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.BookingWhereInput = { customerUserId };
    this.applyQueryFilters(where, query);

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: this.getOrderBy(query),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: BOOKING_SELECT,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return this.paginatedResult(items, query.page, query.limit, total);
  }

  async findCustomerBookingById(
    customerUserId: string,
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerUserId },
      select: { ...BOOKING_SELECT, attachments: true, statusHistory: true },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return this.formatDetail(booking);
  }

  async cancelByCustomer(
    customerUserId: string,
    bookingId: string,
    reason?: string,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerUserId },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (!canCustomerCancel(booking.status)) {
      throw new BadRequestException(
        `Cannot cancel booking in ${booking.status} status`,
      );
    }

    return this.transitionStatus(
      bookingId,
      booking.status,
      BookingStatus.CANCELLED,
      customerUserId,
      UserRole.CUSTOMER,
      reason,
    );
  }

  async findMasterBookingsByUserId(
    masterUserId: string,
    query: BookingsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const masterProfile = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!masterProfile) {
      throw new ForbiddenException("Master profile not found");
    }
    return this.findMasterBookings(masterProfile.id, query);
  }

  async findMasterBookingByIdByUserId(
    masterUserId: string,
    bookingId: string,
  ) {
    const masterProfile = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!masterProfile) {
      throw new ForbiddenException("Master profile not found");
    }
    return this.findMasterBookingById(masterProfile.id, bookingId);
  }

  private async findMasterBookings(
    masterProfileId: string,
    query: BookingsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.BookingWhereInput = { masterProfileId };
    this.applyQueryFilters(where, query);

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: this.getOrderBy(query),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          ...BOOKING_SELECT,
          customer: {
            select: {
              id: true,
              customerProfile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return this.paginatedResult(items, query.page, query.limit, total);
  }

  async findMasterBookingById(
    masterProfileId: string,
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, masterProfileId },
      select: {
        ...BOOKING_SELECT,
        attachments: true,
        statusHistory: true,
        customer: {
          select: {
            id: true,
            email: true,
            phone: true,
            customerProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return this.formatDetail(booking);
  }

  async updateStatusByMaster(
    masterUserId: string,
    bookingId: string,
    dto: UpdateBookingStatusDto,
  ) {
    const masterProfile = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!masterProfile) {
      throw new ForbiddenException("Master profile not found");
    }

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, masterProfileId: masterProfile.id },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return this.transitionStatus(
      bookingId,
      booking.status,
      dto.status,
      masterUserId,
      UserRole.MASTER,
      dto.note,
    );
  }

  async findAdminBookings(
    query: AdminBookingsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.BookingWhereInput = {};
    this.applyQueryFilters(where, query);
    if (query.customerUserId) {
      where.customerUserId = query.customerUserId;
    }
    if (query.masterProfileId) {
      where.masterProfileId = query.masterProfileId;
    }

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: this.getOrderBy(query),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          ...BOOKING_SELECT,
          customerUserId: true,
          masterProfileId: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return this.paginatedResult(items, query.page, query.limit, total);
  }

  async findAdminBookingById(bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId },
      select: {
        ...BOOKING_SELECT,
        customerUserId: true,
        masterProfileId: true,
        internalNotes: true,
        attachments: true,
        statusHistory: {
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            note: true,
            createdAt: true,
            changedBy: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        customer: {
          select: {
            id: true,
            email: true,
            phone: true,
            customerProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return this.formatDetail(booking);
  }

  async addAttachments(
    customerUserId: string,
    bookingId: string,
    dto: AddBookingAttachmentsDto,
  ) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, customerUserId },
    });
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException("Cannot add attachments to completed or cancelled booking");
    }

    await this.prisma.bookingAttachment.createMany({
      data: dto.attachments.map((a) => ({
        bookingId,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
      })),
    });

    return this.findByIdWithDetails(this.prisma, bookingId);
  }

  private async transitionStatus(
    bookingId: string,
    fromStatus: BookingStatus,
    toStatus: BookingStatus,
    actorUserId: string,
    role: UserRole,
    note?: string,
  ) {
    if (!canTransition(fromStatus, toStatus, role)) {
      throw new BadRequestException(
        `Invalid status transition from ${fromStatus} to ${toStatus}`,
      );
    }

    const updateData: Prisma.BookingUpdateInput = {
      status: toStatus,
      ...(toStatus === BookingStatus.CANCELLED && { canceledAt: new Date() }),
      ...(toStatus === BookingStatus.COMPLETED && { completedAt: new Date() }),
    };

    const [booking] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
      }),
      this.prisma.bookingStatusHistory.create({
        data: {
          bookingId,
          fromStatus,
          toStatus,
          changedByUserId: actorUserId,
          note: note ?? `Status changed to ${toStatus}`,
        },
      }),
    ]);

    await this.notifyStatusChange(bookingId, toStatus, actorUserId, role);

    return this.findByIdWithDetails(this.prisma, booking.id);
  }

  private async notifyStatusChange(
    bookingId: string,
    toStatus: BookingStatus,
    actorUserId: string,
    role: UserRole,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        customerUserId: true,
        masterProfile: { select: { userId: true } },
      },
    });
    if (!booking) return;

    const customerUserId = booking.customerUserId;
    const masterUserId = booking.masterProfile.userId;

    if (toStatus === BookingStatus.CONFIRMED && role === UserRole.MASTER) {
      this.notifications.createForUser(
        customerUserId,
        "BOOKING_CONFIRMED",
        "Booking confirmed",
        "Your booking has been confirmed by the master.",
      );
    } else if (toStatus === BookingStatus.CANCELLED) {
      const notifyUserId = role === UserRole.CUSTOMER ? masterUserId : customerUserId;
      this.notifications.createForUser(
        notifyUserId,
        "BOOKING_CANCELLED",
        "Booking cancelled",
        "A booking has been cancelled.",
      );
    } else if (toStatus === BookingStatus.IN_PROGRESS && role === UserRole.MASTER) {
      this.notifications.createForUser(
        customerUserId,
        "SYSTEM",
        "Service started",
        "The master has started the service.",
      );
    } else if (toStatus === BookingStatus.COMPLETED && role === UserRole.MASTER) {
      this.notifications.createForUser(
        customerUserId,
        "SYSTEM",
        "Service completed",
        "The service has been marked as completed.",
      );
    }
  }

  private async findByIdWithDetails(
    tx: PrismaClient | Prisma.TransactionClient,
    id: string,
  ) {
    const booking = await (tx as PrismaService).booking.findUnique({
      where: { id },
      select: {
        ...BOOKING_SELECT,
        attachments: true,
        statusHistory: {
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            note: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    return this.formatDetail(booking);
  }

  private applyQueryFilters(
    where: Prisma.BookingWhereInput,
    query: BookingsQueryDto,
  ) {
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.scheduledDate = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }
  }

  private getOrderBy(query: BookingsQueryDto) {
    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder ?? "desc";
    return { [sortBy]: sortOrder };
  }

  private paginatedResult<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResponse<T> {
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
    return { items, meta };
  }

  private formatDetail(booking: unknown) {
    return booking;
  }

  private addressDtoToCreate(
    dto: CreateBookingAddressDto,
    userId: string,
  ): Prisma.AddressCreateInput {
    return {
      user: { connect: { id: userId } },
      label: dto.label,
      country: dto.country,
      city: dto.city,
      district: dto.district,
      street: dto.street,
      building: dto.building,
      apartment: dto.apartment,
      latitude: dto.latitude,
      longitude: dto.longitude,
      postalCode: dto.postalCode,
    };
  }

  private parseTimeStrings(
    start: string,
    end: string,
  ): [Date, Date] {
    const base = new Date("1970-01-01");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const timeStart = new Date(base);
    timeStart.setHours(sh ?? 0, sm ?? 0, 0, 0);
    const timeEnd = new Date(base);
    timeEnd.setHours(eh ?? 0, em ?? 0, 0, 0);
    return [timeStart, timeEnd];
  }
}
