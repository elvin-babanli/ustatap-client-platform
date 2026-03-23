# Business Rules

## Registration Rules

- **Email:** Optional; if provided, must be unique
- **Phone:** Required, must be unique
- **Password:** Min 8 chars, uppercase, lowercase, number
- **Profile:** CustomerProfile created with firstName, lastName
- **Default role:** CUSTOMER
- **Default status:** PENDING_VERIFICATION — user can log in; verification gates for sensitive actions in future

## Verification Assumptions

- `isPhoneVerified` / `isEmailVerified` set to false on registration
- Future OTP/email flows will update these
- PENDING_VERIFICATION users can browse; booking/payment may require verification

## Suspended User Restrictions

- SUSPENDED: Cannot log in (403 Forbidden)
- INACTIVE: Cannot log in (403 Forbidden)
- ACTIVE / PENDING_VERIFICATION: Can log in

## Internal Access Control

- Admin can set User.status to SUSPENDED
- Role checked via `@Roles()` + RolesGuard
- Unauthorized (401) vs Forbidden (403) distinguished

## Role Separation

- **Customer:** Can browse, search, book services, leave reviews, manage own profile
- **Master:** Can offer services, manage availability, receive bookings, get paid (after verification)
- **Admin:** Full platform access, moderation, user management, audit logs

## Booking Lifecycle

- **Status flow:** PENDING → CONFIRMED → IN_PROGRESS → COMPLETED (see `BookingStatus` enum)
- **Alternate outcomes:** CANCELLED, DISPUTED
- **Creation:** Customer only. Target: masterProfileId, masterServiceId. Initial status: PENDING.
- **Status transitions:** Centralized in `BOOKING_STATUS_TRANSITIONS`. Invalid transitions return clear errors.
- **Status history:** Every status change writes `BookingStatusHistory` (fromStatus, toStatus, changedByUserId, note).

### Customer Booking Permissions

- Create booking (CUSTOMER only)
- View own bookings (list + detail)
- Cancel own booking when status is PENDING or CONFIRMED
- Add attachments to own booking (create or later)
- Cannot transition status (except via cancel)

### Master Booking Permissions

- View only assigned bookings (masterProfileId = own profile)
- PENDING → CONFIRMED or CANCELLED
- CONFIRMED → IN_PROGRESS or CANCELLED
- IN_PROGRESS → COMPLETED
- Cannot access other masters' bookings

### Admin Booking Permissions

- View all bookings
- Full detail including status history
- Future: status override foundation (not implemented)

### Cancellation Rules

- Customer: PENDING, CONFIRMED → CANCELLED
- Master: PENDING, CONFIRMED → CANCELLED
- Terminal statuses (COMPLETED, CANCELLED, DISPUTED) cannot be reactivated

## Review Rules

### Review Eligibility

- Customer only can create reviews
- Review only for COMPLETED bookings
- One review per booking (duplicate blocked)
- Customer must own the booking

### Review Status

- New reviews: PUBLISHED by default (no moderation queue in Phase 6)
- EDITABLE: PUBLISHED — customer can update rating/comment
- HIDDEN: future moderation use

### Master Reply

- Master can reply only to reviews for their own master profile
- One reply per review
- Reply ownership: userId = master's user id

### Derived Fields (MasterProfile)

- `averageRating` and `totalReviews` recalculated on review create/update from published reviews

## Notification Rules

### Ownership

- User sees only own notifications
- Read/unread managed per user

### Foundation Behavior

- No email/SMS/push delivery in Phase 6
- Notifications created when: booking created (→ master), booking status change (→ customer/master), review received (→ master)
- Stored in Notification table; consumed via API

## Dashboard Data

- Customer: recent bookings, status summary, totals, unread notifications, review count
- Master: booking counts by status, rating/reviews, unread notifications, active services
- Admin: global stats (users, masters, bookings, reviews, disputes, categories, services)
- Data source: live Prisma queries; no caching

## Trust & Safety — Verification & Moderation

### Public Master Listing

- Only masters with `verificationStatus = APPROVED` appear in public listing
- PENDING and REJECTED masters are not discoverable publicly

### Verification Document Ownership

- MASTER uploads (metadata only: documentType, fileUrl, originalFileName)
- MASTER sees only own documents
- ADMIN sees all documents for moderation
- PUBLIC never sees verification documents

### Verification Status

- Only ADMIN can change MasterProfile.verificationStatus
- REJECTED requires rejectionReason
- Master receives safe subset of rejectionReason in verification summary

### Rejected Verification — Resubmission

- Master can add new verification documents after rejection
- Existing documents remain as history (no hard delete)
- Admin re-reviews when new documents submitted; can set status back to PENDING or APPROVE/REJECT

### Admin-Only Moderation

- Verification status: ADMIN only
- User status (ACTIVE/INACTIVE/SUSPENDED): ADMIN only
- Admin cannot suspend themselves

### Document Access Rules

- Master: own verification documents only
- Admin: all verification documents for moderation
- Customer: no access to verification documents

### User Suspension Implications

- SUSPENDED: cannot log in (403)
- INACTIVE: cannot log in (403)
- Admin self-suspend blocked

## Payment Rules

### Payment Ownership

- CUSTOMER sees only own payments (payerUserId = self)
- MASTER sees only own payouts (masterProfileId = own profile)
- ADMIN sees all payments and payouts

### Payment Initiation

- Customer initiates payment for own booking only
- Booking must be CONFIRMED, IN_PROGRESS or COMPLETED
- One active (PENDING) payment per booking; duplicate blocked
- IdempotencyKey optional for safe retries

### Commission Assumptions

- Commission created when payment status = COMPLETED
- Rate from config (APP_DEFAULT_COMMISSION_RATE, default 0.05)
- Commission status = COLLECTED when payment completes

### Payout Assumptions

- Admin creates payouts manually
- Master cannot create payouts
- Payout status: PENDING → PROCESSING → COMPLETED/FAILED; or PENDING → CANCELLED

### Admin-Only Financial Mutations

- Payment status update: ADMIN only
- Payout create: ADMIN only
- Payout status update: ADMIN only

## Internal Payments Only

- All payments flow through the platform
- No direct payment between customer and master
- Commission deducted; payouts to masters

## Public Visibility Rules

- **Categories:** Only `isActive` categories in public listing
- **Services:** Only `isActive` services; filter by categorySlug, search (multilingual names)
- **Masters:** Only `verificationStatus=APPROVED` in public listing; filter by city, serviceSlug, categorySlug, isAvailable

## Category / Service Activation

- Admin creates/updates categories and services
- `isActive` controls visibility; no hard delete
- Slug unique per category for services; globally unique for categories

## Profile Ownership

- **Customer:** Can only access own profile via `/customer-profile/me`; role CUSTOMER required
- **Master:** Can only access own profile via `/master-profile/me`; role MASTER required; cannot change verificationStatus, averageRating, completedJobsCount

## Master Service Management

- Master manages offered services via `PUT /master-profile/me/services`
- Payload: `{ services: [{ serviceId, basePrice, currency, isActive }] }`
- Only active services can be added; no duplicate serviceId per master
- Services not in payload are soft-deactivated (isActive=false)

## Verification Required for Masters

- Masters must complete verification before accepting bookings
- Document/identity verification (future)
- Service-specific requirements (certifications, etc.)

## Audit Logging

- Sensitive operations logged: auth events, payment changes, admin actions
- Immutable audit trail for compliance
- Retention policy (to be defined)

## Auth Abuse Prevention

- Rate limiting: 5 req/min on login, register, refresh, logout
- Generic "Invalid credentials" on login failure (no user enumeration)
- Structured logging for auth events (no passwords/tokens)

## Admin Mutation Safety

- Admin mutation endpoints throttled (30 req/min)
- Audit metadata sanitized: passwords, tokens, secrets never stored in audit logs
- Role guard + JWT required; admin cannot self-suspend

## Payment Initiation Idempotency

- `Idempotency-Key` header or DTO `idempotencyKey` supported
- Duplicate initiation with same key returns existing payment
- Reduces double-charge risk on retries

## Multilingual Support

- Website: Azerbaijani, English, Russian
- Content translatable (categories, services, static pages)
- User-facing text via i18n layer
