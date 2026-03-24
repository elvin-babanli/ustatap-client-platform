# API Modules

Planned NestJS modules:

| Module | Description |
|--------|-------------|
| **auth** | Authentication (JWT, sessions), login, register, password reset, email verification |
| **users** | User CRUD, profile management, account settings |
| **customer-profiles** | Customer-specific profile data, preferences, booking history summary |
| **master-profiles** | Master/service provider profiles, skills, availability, portfolio |
| **categories** | Service categories hierarchy, parent-child relations, metadata |
| **services** | Service listings, search, CRUD, pricing, availability |
| **bookings** | Booking creation, status lifecycle, cancellation, scheduling |
| **reviews** | Reviews and ratings for masters and services, moderation |
| **payments** | Payment processing, payouts to masters, refunds |
| **notifications** | In-app notifications, email, push (future) |
| **admin** | Admin dashboard API, user management, moderation, platform config |
| **audit-logs** | System audit trail for sensitive operations |

## Common Infrastructure

- **Response/error:** Standard envelope; errors include `statusCode`, `message`, `path`, `timestamp`, `requestId`, `details` (validation)
- **Request ID:** `x-request-id` on all requests; returned in error responses
- **Rate limiting:** Global + auth/admin overrides (see architecture.md)
- **Swagger:** `GET /api/docs`
- **Health:** `GET /api/v1/health`, `GET /api/v1/health/readiness`
- **Idempotency:** Payment initiation via `Idempotency-Key` header or DTO

## Implemented

| Module | Status |
|--------|--------|
| **health** | `GET /api/v1/health`, `GET /api/v1/health/readiness` |
| **auth** | register (role-based CUSTOMER/MASTER), login, refresh, logout, me, forgot-password, verify-reset-code, reset-password |
| **users** | Partial — auth support |
| **categories** | list, by slug; admin create/update/status |
| **services** | list (paginated), by slug; admin create/update/status |
| **customer-profiles** | GET/PATCH me (CUSTOMER) |
| **master-profiles** | public listing + detail; GET/PATCH me, PUT services (MASTER) |
| **bookings** | create, list, detail, cancel (customer); list, detail, status update (master); list, detail (admin) |
| **reviews** | create, list, update (customer); public master reviews; reply (master) |
| **notifications** | list, mark read, mark all read, unread count (authenticated) |
| **dashboard** | customer, master, admin data endpoints (role-based) |
| **admin** | master verifications, user listing, user status update |
| **audit-logs** | AuditLogsService for mutation audit |
| **payments** | payment initiation, list/detail (customer); payouts (master); admin payment/payout management |
| **disputes** | create, list own, detail own; admin list, detail |
| **messages** | threads (booking-based), thread by booking, thread by id, create thread, send message (CUSTOMER/MASTER) |

### Categories Module

- **Public:** `GET /categories`, `GET /categories/:slug`
- **Admin:** `POST /categories`, `PATCH /categories/:id`, `PATCH /categories/:id/status`

### Services Module

- **Public:** `GET /services?categorySlug=&search=&page=&limit=`, `GET /services/:slug`
- **Admin:** `POST /services`, `PATCH /services/:id`, `PATCH /services/:id/status`

### Customer Profiles Module

- **Protected (CUSTOMER):** `GET /customer-profile/me`, `PATCH /customer-profile/me`

### Auth Module (extended)

- **Public:** `POST /auth/register` — Role-based: CUSTOMER (creates customer profile) or MASTER (creates master profile, verificationStatus=PENDING). ADMIN cannot register. Master accepts: bio, experienceYears, categoryId, startingPrice.
- **Public:** `POST /auth/forgot-password` — Body: `{ identifier }` (email or phone). Generic response; in dev, reset code logged server-side. Creates PasswordResetToken (single-use, expiry).
- **Public:** `POST /auth/verify-reset-code` — Body: `{ identifier, code }`. Validates code before showing reset form.
- **Public:** `POST /auth/reset-password` — Body: `{ identifier, code, newPassword }`. Resets password, invalidates token. Consider revoking existing sessions.

### Master Profiles Module

- **Public:** `GET /masters?city=&serviceSlug=&categorySlug=&isAvailable=&page=&limit=&sortBy=&sortOrder=&priceMin=&priceMax=&minRating=&verifiedOnly=&urgentAvailable=&language=` — Search filters: priceMin/priceMax (real), minRating (real), verifiedOnly (real), urgentAvailable (placeholder/graceful ignore), language (real if data exists), sortBy: recommended|priceAsc|ratingDesc|nearest|fastestArrival (nearest/fastestArrival placeholder if no geo data).
- **Protected (MASTER):** `GET /master-profile/me`, `PATCH /master-profile/me`, `PUT /master-profile/me/services`
- **Protected (MASTER) — Verification:**
  - `GET /master-profile/me/verification` — Verification summary (status, documents, latestRejectionReason)
  - `POST /master-profile/me/verification-documents` — Create document metadata (documentType, fileUrl, originalFileName)
  - `GET /master-profile/me/verification-documents` — List own documents
  - `GET /master-profile/me/verification-documents/:id` — Get document by id

### Bookings Module

- **Protected (CUSTOMER):**
  - `POST /bookings` — Create booking (masterProfileId, masterServiceId, address/addressId, schedule, estimatedPrice, currency)
  - `GET /bookings/me` — List own bookings (pagination, status, dateFrom, dateTo, sortBy, sortOrder)
  - `GET /bookings/me/:id` — Get own booking detail
  - `PATCH /bookings/me/:id/cancel` — Cancel own booking (PENDING/CONFIRMED only)
  - `POST /bookings/me/:id/attachments` — Add attachment URLs to booking
- **Protected (MASTER):**
  - `GET /bookings/master/me` — List assigned bookings (filters, pagination)
  - `GET /bookings/master/me/:id` — Get assigned booking detail
  - `PATCH /bookings/master/me/:id/status` — Update status (allowed transitions only)
- **Protected (ADMIN):**
  - `GET /bookings/admin` — List all bookings (filters: status, customerUserId, masterProfileId, date range)
  - `GET /bookings/admin/:id` — Get full booking detail with status history

### Reviews Module

- **Protected (CUSTOMER):**
  - `POST /reviews` — Create review (bookingId, rating, comment) — COMPLETED booking only, one per booking
  - `GET /reviews/me` — List own reviews (pagination, status filter)
  - `GET /reviews/me/:id` — Get own review detail
  - `PATCH /reviews/me/:id` — Update own review (PUBLISHED only; rating, comment)
- **Public:**
  - `GET /masters/:id/reviews` — List published reviews for a master (pagination)
- **Protected (MASTER):**
  - `POST /reviews/:id/reply` — Reply to own review (one reply per review)

### Notifications Module

- **Protected (authenticated):**
  - `GET /notifications/me` — List own notifications (pagination, unread first)
  - `PATCH /notifications/me/read-all` — Mark all as read
  - `PATCH /notifications/me/:id/read` — Mark single as read
  - `GET /notifications/me/unread-count` — Get unread count

### Dashboard Module

- **Protected (CUSTOMER):** `GET /dashboard/customer` — recentBookings, bookingsByStatus, totals, unreadNotifications, recentReviewsCount, totalPaymentsCompletedAmount
- **Protected (MASTER):** `GET /dashboard/master` — booking counts, averageRating, totalReviews, unreadNotifications, activeServicesCount, totalCompletedPayoutsAmount, pendingPayoutsAmount
- **Protected (ADMIN):** `GET /dashboard/admin` — totalUsers, totalCustomers, totalMasters, pendingMasterVerifications, totalBookings, bookingsByStatus, totalReviews, unreadOrOpenDisputes, activeCategories, activeServices, totalPayments, completedPayments, failedPayments, totalPayouts, pendingPayouts

### Admin Module

- **Protected (ADMIN):**
  - `GET /admin/master-verifications` — List master verifications (filters: verificationStatus, masterProfileId, search)
  - `GET /admin/master-verifications/:masterProfileId` — Master verification detail (documents, rejectionReason, reviewer)
  - `PATCH /admin/master-verifications/:masterProfileId/status` — Update verification status (APPROVED/REJECTED/PENDING); rejectionReason required when REJECTED
  - `GET /admin/users` — List users (filters: role, status, search)
  - `PATCH /admin/users/:id/status` — Update user status (ACTIVE/INACTIVE/SUSPENDED/PENDING_VERIFICATION); admin cannot suspend self

### Payments Module

- **Protected (CUSTOMER):**
  - `POST /payments/bookings/:bookingId/initiate` — Initiate payment for own booking (CONFIRMED/IN_PROGRESS/COMPLETED); idempotencyKey optional
  - `GET /payments/me` — List own payments (pagination, status, bookingId)
  - `GET /payments/me/:id` — Get own payment detail
- **Protected (MASTER):**
  - `GET /payments/master/payouts/me` — List own payouts
  - `GET /payments/master/payouts/me/summary` — Payout summary (totals by status)
- **Protected (ADMIN):**
  - `GET /payments/admin` — List all payments (filters: status, bookingId, payerUserId, provider, date range)
  - `GET /payments/admin/:id` — Payment detail (booking, commission)
  - `PATCH /payments/admin/:id/status` — Update payment status; COMPLETED triggers commission creation
  - `GET /payments/admin/payouts` — List payouts
  - `POST /payments/admin/payouts` — Create payout for master
  - `PATCH /payments/admin/payouts/:id/status` — Update payout status

### Disputes Module

- **Protected (CUSTOMER, MASTER):**
  - `POST /disputes` — Create dispute (bookingId, issueType, reason, attachmentUrls?). User must own booking. Initial status: OPEN. Booking status → DISPUTED.
  - `GET /disputes/me` — List own disputes
  - `GET /disputes/me/:id` — Get own dispute detail
- **Protected (ADMIN):**
  - `GET /admin/disputes` — List all disputes (optional)
  - `GET /admin/disputes/:id` — Get dispute detail (optional)

### Messages Module

- **Protected (CUSTOMER, MASTER):** Booking-based messaging; only participants of a booking can message.
  - `GET /messages/threads` — List own threads (with lastMessage, otherPartyDisplayName)
  - `GET /messages/threads/by-booking/:bookingId` — Get or create thread for booking (participant only)
  - `GET /messages/threads/:id` — Get thread with messages
  - `POST /messages/threads` — Body: `{ bookingId }` — Create or get thread
  - `POST /messages/threads/:id/messages` — Body: `{ content }` — Send message
- No WebSocket; REST foundation, polling-friendly.
