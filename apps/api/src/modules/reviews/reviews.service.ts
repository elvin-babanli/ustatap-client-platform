import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, Prisma, ReviewStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { PaginatedResponse, PaginationMeta } from "../../common/dto";
import { DEFAULT_REVIEW_STATUS, EDITABLE_REVIEW_STATUSES } from "./constants";
import type {
  CreateReviewDto,
  UpdateReviewDto,
  ReplyReviewDto,
  ReviewsQueryDto,
} from "./dto";
import { NotificationsService } from "../notifications/notifications.service";

const REVIEW_SELECT = {
  id: true,
  bookingId: true,
  masterProfileId: true,
  rating: true,
  comment: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(customerUserId: string, dto: CreateReviewDto) {
    const customerProfile = await this.prisma.customerProfile.findFirst({
      where: { userId: customerUserId },
    });
    if (!customerProfile) {
      throw new ForbiddenException("Customer profile not found");
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        id: dto.bookingId,
        customerUserId,
        status: BookingStatus.COMPLETED,
      },
      include: {
        masterProfile: { select: { id: true, userId: true } },
      },
    });

    if (!booking) {
      throw new BadRequestException(
        "Booking not found, not yours, or not completed",
      );
    }

    const existing = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
    });
    if (existing) {
      throw new BadRequestException("Review already exists for this booking");
    }

    const review = await this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          bookingId: dto.bookingId,
          customerId: customerProfile.id,
          masterProfileId: booking.masterProfileId,
          rating: dto.rating,
          comment: dto.comment,
          status: DEFAULT_REVIEW_STATUS,
        },
        include: {
          booking: {
            select: {
              service: { select: { nameEn: true } },
            },
          },
          masterProfile: { select: { displayName: true } },
        },
      });

      const agg = await tx.review.aggregate({
        where: {
          masterProfileId: booking.masterProfileId,
          status: ReviewStatus.PUBLISHED,
        },
        _avg: { rating: true },
        _count: { id: true },
      });
      const averageRating = Math.round((agg._avg.rating ?? 0) * 100) / 100;
      const totalReviews = agg._count.id ?? 0;

      await tx.masterProfile.update({
        where: { id: booking.masterProfileId },
        data: { averageRating, totalReviews },
      });

      return created;
    });

    this.notifications?.createForUser(
      booking.masterProfile.userId,
      "REVIEW_RECEIVED",
      "New review received",
      `You received a ${dto.rating}-star review for your service.`,
    );

    return this.formatReview(review);
  }

  async findCustomerReviews(
    customerUserId: string,
    query: ReviewsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const customerProfile = await this.prisma.customerProfile.findFirst({
      where: { userId: customerUserId },
    });
    if (!customerProfile) {
      throw new ForbiddenException("Customer profile not found");
    }

    const where: Prisma.ReviewWhereInput = { customerId: customerProfile.id };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          ...REVIEW_SELECT,
          booking: {
            select: {
              id: true,
              status: true,
              scheduledDate: true,
              service: { select: { nameEn: true, slug: true } },
            },
          },
          masterProfile: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          replies: { select: { id: true, comment: true, createdAt: true } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return this.paginatedResult(items, query.page, query.limit, total);
  }

  async findCustomerReviewById(
    customerUserId: string,
    reviewId: string,
  ) {
    const customerProfile = await this.prisma.customerProfile.findFirst({
      where: { userId: customerUserId },
    });
    if (!customerProfile) {
      throw new ForbiddenException("Customer profile not found");
    }

    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, customerId: customerProfile.id },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            service: { select: { nameEn: true, slug: true } },
          },
        },
        masterProfile: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        replies: {
          select: { id: true, comment: true, createdAt: true, user: { select: { id: true } } },
        },
      },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    return this.formatReview(review);
  }

  async updateCustomerReview(
    customerUserId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ) {
    const customerProfile = await this.prisma.customerProfile.findFirst({
      where: { userId: customerUserId },
    });
    if (!customerProfile) {
      throw new ForbiddenException("Customer profile not found");
    }

    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, customerId: customerProfile.id },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (!EDITABLE_REVIEW_STATUSES.includes(review.status)) {
      throw new BadRequestException(
        `Cannot edit review in ${review.status} status`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const r = await tx.review.update({
        where: { id: reviewId },
        data: {
          ...(dto.rating !== undefined && { rating: dto.rating }),
          ...(dto.comment !== undefined && { comment: dto.comment }),
        },
        include: {
          booking: { select: { service: { select: { nameEn: true } } } },
          masterProfile: { select: { displayName: true } },
        },
      });

      const agg = await tx.review.aggregate({
        where: {
          masterProfileId: review.masterProfileId,
          status: ReviewStatus.PUBLISHED,
        },
        _avg: { rating: true },
        _count: { id: true },
      });
      const averageRating = Math.round((agg._avg.rating ?? 0) * 100) / 100;
      const totalReviews = agg._count.id ?? 0;

      await tx.masterProfile.update({
        where: { id: review.masterProfileId },
        data: { averageRating, totalReviews },
      });

      return r;
    });

    return this.formatReview(updated);
  }

  async findByMasterProfileId(
    masterProfileId: string,
    query: ReviewsQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where: Prisma.ReviewWhereInput = {
      masterProfileId,
      status: ReviewStatus.PUBLISHED,
    };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          customer: {
            select: { firstName: true, lastName: true },
          },
          booking: {
            select: {
              service: { select: { nameEn: true } },
            },
          },
          replies: {
            select: { id: true, comment: true, createdAt: true },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return this.paginatedResult(items, query.page, query.limit, total);
  }

  async reply(
    masterUserId: string,
    reviewId: string,
    dto: ReplyReviewDto,
  ) {
    const masterProfile = await this.prisma.masterProfile.findFirst({
      where: { userId: masterUserId },
    });
    if (!masterProfile) {
      throw new ForbiddenException("Master profile not found");
    }

    const review = await this.prisma.review.findFirst({
      where: {
        id: reviewId,
        masterProfileId: masterProfile.id,
      },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    const existingReply = await this.prisma.reviewReply.findFirst({
      where: { reviewId },
    });
    if (existingReply) {
      throw new BadRequestException("Reply already exists for this review");
    }

    const reply = await this.prisma.reviewReply.create({
      data: {
        reviewId,
        userId: masterUserId,
        comment: dto.comment,
      },
    });

    return { id: reply.id, comment: reply.comment, createdAt: reply.createdAt };
  }

  private formatReview(review: unknown) {
    return review;
  }

  private paginatedResult<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResponse<T> {
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
