# Database Schema

## Why PostgreSQL

- **Relational integrity:** Marketplace has users, profiles, bookings, payments, reviews — clear foreign key relations and referential integrity
- **ACID compliance:** Critical for payments, bookings, and transactional operations
- **Performance:** Mature query planner, indexes, partitioning for scale
- **JSON support:** `metadata` in AuditLog, flexible config where needed
- **Industry standard:** Proven at scale, wide tooling, no vendor lock-in
- **Prisma support:** First-class Prisma support with migrations and type generation

## Naming Convention

| Layer | Convention | Example |
|-------|------------|---------|
| Prisma models | PascalCase | `MasterProfile`, `BookingStatusHistory` |
| Prisma fields | camelCase | `masterProfileId`, `scheduledDate` |
| Database tables | snake_case (via `@@map`) | `master_profiles`, `booking_status_history` |
| Database columns | snake_case (via `@map`) | `master_profile_id`, `scheduled_date` |
| Enums | PascalCase values | `PENDING`, `COMPLETED` |

## Core Models

### User & Profiles

| Model | Purpose |
|-------|---------|
| **User** | Core account: email, phone, passwordHash, role, status, verification flags |
| **CustomerProfile** | Customer-specific data: name, avatar, preferredLanguage, dateOfBirth |
| **MasterProfile** | Service provider: displayName, bio, verificationStatus, averageRating, completedJobsCount |
| **MasterVerificationDocument** | Document uploads for master verification: documentType, fileUrl, status, reviewedBy |

### Categories & Services

| Model | Purpose |
|-------|---------|
| **ServiceCategory** | Multilingual category: nameAz/En/Ru, slug, description, sortOrder |
| **Service** | Generic service type: nameAz/En/Ru, slug, belongs to category |
| **MasterService** | Pivot: MasterProfile ↔ Service with basePrice, currency |

### Location

| Model | Purpose |
|-------|---------|
| **Address** | Reusable address: userId (optional), label, country, city, coordinates |
| **ServiceArea** | Master service area: city, district, radiusKm |

### Booking Lifecycle

| Model | Purpose |
|-------|---------|
| **Booking** | Core booking: customer, master, service, address, status, schedule, pricing |
| **BookingStatusHistory** | Audit trail: fromStatus → toStatus, changedBy, note |
| **BookingAttachment** | Files attached to booking |

### Reviews

| Model | Purpose |
|-------|---------|
| **Review** | Customer review: booking, rating, comment, status |
| **ReviewReply** | Master/admin reply to review |

### Payments

| Model | Purpose |
|-------|---------|
| **Payment** | Payment record: booking, payer, payee, amount, status, method |
| **Commission** | Platform commission: paymentId, rate, amount |
| **Payout** | Master payout: amount, status, processedAt |

### System

| Model | Purpose |
|-------|---------|
| **Session** | Refresh token sessions: userId, refreshTokenHash (SHA-256), expiresAt, revokedAt, ipAddress, userAgent |
| **PasswordResetToken** | Single-use reset: userId, codeHash, expiresAt, usedAt |
| **Notification** | In-app notification: userId, type, title, message, isRead |
| **Dispute** | Booking dispute: openedBy, assignedAdmin, status, issueType, reason, attachmentUrls (JSON array) |
| **MessageThread** | One per booking: bookingId; links to Message |
| **Message** | Thread message: threadId, senderId, content |
| **AuditLog** | System audit: actorUserId, entityType, entityId, action, metadata |

### Derived Fields (MasterProfile)

- `averageRating`, `totalReviews`, `completedJobsCount` — computed from reviews/bookings; updated by application logic, not user input

### Session Model (Auth)

Stores refresh tokens hashed with SHA-256 (never plaintext). Enables:
- Revocation (logout, revoke all sessions)
- Audit (device, IP, user agent)
- Future: session listing, "log out everywhere"

## Relations Overview

```
User 1:1 CustomerProfile
User 1:1 MasterProfile
MasterProfile 1:n MasterVerificationDocument
MasterProfile 1:n MasterService n:1 Service
Service n:1 ServiceCategory
MasterProfile 1:n ServiceArea
User 1:n Address (optional)
Booking n:1 User (customer)
Booking n:1 MasterProfile
Booking n:1 MasterService
Booking n:1 Service
Booking n:1 Address
Booking 1:n BookingStatusHistory
Booking 1:n BookingAttachment
Booking 1:1 Review
Booking 1:n Payment
Booking 0..1 Dispute
Booking 0..1 MessageThread 1:n Message
User 1:n PasswordResetToken
User 1:n Message (as sender)
Review 1:n ReviewReply
Payment 0..1 Commission
MasterProfile 1:n Payout
User 1:n Notification
```

## Booking Lifecycle (Data Perspective)

1. **PENDING** — Created by customer, awaiting master confirmation
2. **CONFIRMED** — Master accepted
3. **IN_PROGRESS** — Service being performed
4. **COMPLETED** — Service done, can be reviewed
5. **CANCELLED** — Cancelled by customer or master (PENDING/CONFIRMED only)
6. **DISPUTED** — Dispute opened (foundation only)

Each status change is recorded in `BookingStatusHistory` with `changedByUserId` and optional `note`.

### Booking Model Implementation Notes

- **Relations:** customerUserId → User, masterProfileId → MasterProfile, masterServiceId → MasterService, serviceId → Service, addressId → Address
- **Address:** Create via inline object or use existing addressId (customer's addresses)
- **Validation:** Only public/active master services; master must be APPROVED and available

### BookingStatusHistory Implementation Notes

- Created on every status transition (including initial PENDING on create)
- `fromStatus` / `toStatus` document the change; for creation, both can be PENDING with note "Booking created"
- Immutable; no updates after insert

### BookingAttachment Implementation Notes

- Stores `fileUrl` and optional `fileType`; no real file storage in Phase 5
- Added at create or via `POST /bookings/me/:id/attachments`
- Foundation for future upload integration

### Review Derived Field Maintenance

- `MasterProfile.averageRating` and `totalReviews` updated on review create/update
- Recalculated from `Review` where `status = PUBLISHED`; uses `aggregate` then `masterProfile.update`
- Inline in ReviewsService transaction; no separate util

### MasterVerificationDocument Usage Notes

- Stores documentType, fileUrl, originalFileName (optional)
- status per document: PENDING, APPROVED, REJECTED
- reviewedByUserId, reviewedAt, rejectionReason for admin review
- No file storage; metadata only. Future: integrate with upload provider.

### MasterProfile Verification Fields

- verificationStatus: PENDING, APPROVED, REJECTED (profile-level)
- rejectionReason: set by admin when rejecting
- reviewedByUserId, reviewedAt: last admin review

### Audit Log Usage Notes

- entityType: "MasterProfile", "User", "MasterVerificationDocument"
- action: "VERIFICATION_STATUS_UPDATE", "STATUS_UPDATE", "CREATE"
- metadata: JSON with previousStatus, nextStatus; do not store raw sensitive data

### Notification Usage Notes

- Created by BookingsService (booking created, status changes) and ReviewsService (review received)
- `type`: BOOKING_CREATED, BOOKING_CONFIRMED, BOOKING_CANCELLED, REVIEW_RECEIVED, SYSTEM, etc.
- `isRead` / `readAt` managed by NotificationsService; no delivery (email/SMS/push) in Phase 6

## Payment / Commission / Payout Foundation

- **Payment:** Links to booking, payer (customer), payee (master). Status: PENDING → COMPLETED / FAILED / CANCELLED / REFUNDED.
  - `idempotencyKey` optional for duplicate prevention
  - `failureReason` when FAILED
  - `provider` = INTERNAL_PLACEHOLDER; `providerReference` for future gateway
- **Commission:** One per payment; created when payment COMPLETED. Rate from config.
- **Payout:** Master receives money. Status: PENDING → PROCESSING → COMPLETED/FAILED; or CANCELLED.
  - `notes` for admin reference

No gateway integration; schema ready for provider/providerReference when integrated.

## Audit & Dispute Models

- **AuditLog:** Immutable trail. `actorUserId` nullable (system actions). `entityType` + `entityId` identify target. `metadata` (JSON) for extra context.
- **Dispute:** One per booking. `openedByUserId`, `assignedAdminUserId`. Status: OPEN → UNDER_REVIEW → RESOLVED → CLOSED. `issueType` (OVERCHARGE, BAD_QUALITY, NO_SHOW, SAFETY_ISSUE, PAYMENT_ISSUE, OTHER). `attachmentUrls` JSON array for future file URLs.

## Password Reset & Messaging

- **PasswordResetToken:** Stores hashed reset code; single-use, expiry. Created by forgot-password; consumed by reset-password.
- **MessageThread:** One per booking; only customer and master of that booking participate.
- **Message:** `threadId`, `senderId`, `content`. No phone/email exposure in API responses.

## Multilingual Strategy

- **ServiceCategory** and **Service:** `nameAz`, `nameEn`, `nameRu`, `descriptionAz`, `descriptionEn`, `descriptionRu`
- **SupportedLanguage** enum: AZ, EN, RU
- **CustomerProfile.preferredLanguage:** User's UI language
- Slug: Single slug per entity (EN-based or neutral); used in URLs

## Maintainability

1. **Normalized:** No redundant data; foreign keys enforce consistency
2. **Explicit relations:** Pivot models (MasterService) instead of implicit many-to-many
3. **Status enums:** Centralized enums for status flows
4. **Indexes:** On FKs, status, slug, createdAt where queries are expected
5. **Soft delete:** Not used; use status fields (e.g. INACTIVE) where needed
6. **Migrations:** Prisma migrations version schema changes
7. **Documentation:** This doc and `schema.prisma` comments keep intent clear
