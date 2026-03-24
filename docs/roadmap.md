# Ustatap Roadmap

## Phase 0 — Foundation
- Monorepo structure
- pnpm workspace
- Next.js frontend base
- NestJS backend base
- Documentation setup

## Phase 1 — Core Architecture
- **Backend:** Global API prefix `/api/v1`, ValidationPipe, exception filter, config structure, health module, common folder skeleton, planned module folders
- **Frontend:** Route groups (public, auth, customer, master, admin), placeholder pages, dashboard structure
- **Shared:** packages/types (ApiResponse, PaginatedResponse, HealthResponse, UserRole), packages/config (tsconfig base, eslint placeholder)
- **API client:** lib/api placeholder, env safe access pattern
- **Environment:** .env.example for API and web
- **Documentation:** architecture, roadmap, api-modules, business-rules updates

## Phase 2 — Database
- **Prisma setup:** schema.prisma, PostgreSQL datasource, client generator
- **20 core models:** User, CustomerProfile, MasterProfile, MasterVerificationDocument, ServiceCategory, Service, MasterService, Address, ServiceArea, Booking, BookingStatusHistory, BookingAttachment, Review, ReviewReply, Payment, Commission, Payout, Notification, Dispute, AuditLog
- **Enums:** UserRole, UserStatus, VerificationStatus, DocumentType, BookingStatus, ReviewStatus, PaymentStatus, PaymentMethod, CommissionStatus, PayoutStatus, NotificationType, DisputeStatus, SupportedLanguage, Currency
- **Naming:** PascalCase models, camelCase fields, snake_case tables via @@map
- **PrismaModule/PrismaService:** Ready for Phase 3 integration
- **Seed foundation:** prisma/seed.ts placeholder
- **Documentation:** database-schema.md, architecture.md

## Phase 3 — Auth & Access Architecture
- **Prisma integration:** PrismaModule in AppModule, enableShutdownHooks
- **Session model:** refreshTokenHash, userId, expiresAt, revokedAt
- **Auth endpoints:** register, login, refresh, logout, me
- **JWT + refresh:** access (15m), refresh (7d), hashed session storage
- **Guards/decorators:** JwtAuthGuard, RolesGuard, CurrentUser, Roles
- **Users module:** UsersService for auth (createWithCustomerProfile, findByEmail/Phone)
- **Frontend:** lib/api/auth client, lib/auth types, protected route README
- **Documentation:** architecture, database-schema, business-rules, api-modules

## Phase 4 — Marketplace Core Foundation
- **Categories:** Public list/by slug; Admin create/update/status
- **Services:** Public list (paginated, filter categorySlug, search); Admin create/update/status
- **Customer profiles:** GET/PATCH me (CUSTOMER only)
- **Master profiles:** Public listing (filters: city, serviceSlug, categorySlug, isAvailable); Public detail by ID; GET/PATCH me, PUT services (MASTER only)
- **Shared:** PaginationQueryDto, PaginatedResponse; multilingual search
- **Frontend:** lib/api categories, services, masters, customer-profile, master-profile
- **Documentation:** api-modules, business-rules, architecture, database-schema

## Phase 5 — Booking Architecture & Reservation Flow ✓
- **Bookings module:** create, list, detail, cancel (customer); list, detail, status update (master); list, detail (admin)
- **Status transitions:** Centralized rules; PENDING → CONFIRMED → IN_PROGRESS → COMPLETED; CANCELLED, DISPUTED
- **Status history:** Every change recorded in BookingStatusHistory
- **Attachments:** Foundation (fileUrl, fileType) — no real storage
- **Frontend API helpers:** lib/api/bookings.ts
- **Documentation:** api-modules, business-rules, architecture, database-schema

## Phase 6 — Reviews + Notifications + Dashboard Data ✓
- **Reviews:** create (COMPLETED booking), list/update (customer); public master reviews; master reply
- **Notifications:** list, mark read, mark all read, unread count; created on booking/review events
- **Dashboard:** customer, master, admin data endpoints (no UI)
- **Frontend API helpers:** reviews, notifications, dashboard

## Phase 7 — Verification & Admin Moderation Foundation ✓
- **Master verification:** GET verification summary, create/list/get verification documents
- **Admin moderation:** master verifications list/detail/status; users list/status
- **Audit logs:** AuditLogsService; verification status, user status, document create
- **Schema:** MasterProfile rejectionReason, reviewedBy, reviewedAt; MasterVerificationDocument originalFileName

## Phase 8 — Dashboards (UI)
- Customer dashboard UI
- Master dashboard UI
- Admin dashboard UI

## Phase 9 — Financial Core Foundation ✓
- **Payments:** initiate (customer), list/detail; admin status update
- **Commissions:** auto-created when payment COMPLETED; rate from config
- **Payouts:** admin create, status update; master view only
- **Dashboard:** financial summary (totalPaymentsCompletedAmount, payout amounts, admin stats)

## Phase 10 — Payments (Gateway)
- Payment gateway integration
- Booking payments
- Payouts for masters

## Phase 11 — Security
- Rate limiting
- Input validation
- Security hardening
- Audit logs

## Phase 12 — Deployment
- CI/CD pipeline
- Production configuration
- Monitoring and logging
