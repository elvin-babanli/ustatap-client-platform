# Architecture Decisions

## Monorepo Reasoning

- **Single source of truth:** Shared types, config, and future UI components across web and API
- **Atomic changes:** Frontend and backend updates in one commit when features span both
- **Unified tooling:** Single pnpm workspace, consistent linting, shared dependencies
- **Scalability:** Easy to add new apps (e.g. mobile API, worker) without repo fragmentation

## Backend Architecture

### Structure

- **Global prefix:** All API routes under `/api/v1`
- **ValidationPipe:** Global with `whitelist`, `forbidNonWhitelisted`, `transform` for DTO validation
- **Exception filter:** Centralized HTTP exception handling, consistent error response format
- **Config:** `ConfigModule` with `app.config.ts`, environment-based configuration
- **Modules:** Domain modules in `src/modules/`, shared utilities in `src/common/`

### Common Folder

| Folder | Purpose |
|--------|---------|
| constants | Shared constants, API version |
| decorators | Custom param/route decorators |
| dto | Shared DTOs, base classes |
| enums | Shared enums |
| filters | Exception filters |
| guards | Auth/role guards |
| interceptors | Logging, transform interceptors |
| pipes | Custom validation pipes |
| types | Shared type definitions |
| utils | Helper functions |

## Frontend Route Architecture

### Route Groups

- **(public):** Unauthenticated pages — home, categories, search, master profile, booking, about, contact, FAQ, terms, privacy
- **(auth):** Authentication flows — login, register, verify, forgot-password
- **(customer):** Customer dashboard and related pages
- **(master):** Master/service provider dashboard
- **(admin):** Admin dashboard and platform management

Route groups use parentheses `(name)` so they do not affect the URL path.

### URL Structure

| Path | Description |
|------|-------------|
| `/` | Home |
| `/categories` | Service categories |
| `/search` | Search |
| `/masters/[id]` | Master profile |
| `/booking` | Booking flow |
| `/about`, `/contact`, `/faq` | Static pages |
| `/terms`, `/privacy` | Legal pages |
| `/login`, `/register` | Auth |
| `/customer/dashboard` | Customer dashboard |
| `/master/dashboard` | Master dashboard |
| `/admin/dashboard` | Admin dashboard |

## Shared Packages

| Package | Purpose |
|---------|---------|
| **@ustatap/config** | Shared tsconfig base, future ESLint/Prettier config |
| **@ustatap/types** | API response types, paginated response, user roles, shared interfaces |
| **@ustatap/ui** | Future shared React components |

## Why Next.js

- **Full-stack capability:** API routes, server components, middleware in one framework
- **Performance:** Server-side rendering, static generation, incremental static regeneration
- **Developer experience:** Fast refresh, TypeScript-first, strong ecosystem
- **Production-ready:** Used by major companies, well-documented, long-term support
- **SEO:** Critical for marketplace discovery and organic traffic

## Why NestJS

- **Enterprise patterns:** Modular architecture, dependency injection, layered structure
- **TypeScript native:** Strong typing, decorators, consistent with frontend
- **Scalability:** Clear separation of concerns, easy to add modules
- **Ecosystem:** Guards, interceptors, pipes, integration with Prisma, Redis, etc.
- **Maintainability:** Convention over configuration, predictable structure for team onboarding

## Why PostgreSQL

- **Relational data:** Marketplace has users, bookings, payments, reviews — clear relations
- **ACID compliance:** Critical for payments and transactional integrity
- **Performance:** Mature optimizer, indexes, partitioning for scale
- **JSON support:** Flexible columns when needed (metadata, config)
- **Industry standard:** Proven at scale, wide tooling, no vendor lock-in

## Why Prisma

- **Type-safe ORM:** Auto-generated types from schema, reduces runtime errors
- **Migrations:** Version-controlled schema changes, rollback support
- **Developer experience:** Intuitive API, good documentation, Prisma Studio for debugging
- **NestJS integration:** PrismaService extends PrismaClient, injectable via DI
- **Performance:** Query optimization, connection pooling

## API Boundaries

| Type | Auth | Examples |
|------|------|----------|
| **Public** | None | categories, services list, masters list/detail |
| **Protected** | JWT + role | customer-profile/me, master-profile/me |
| **Admin** | JWT + ADMIN | category/service create/update/status |

## Search / Listing Strategy

- **Pagination:** `items` + `meta` (page, limit, total, totalPages); limit max 100
- **Filtering:** Query params (categorySlug, serviceSlug, city, isAvailable)
- **Search:** Multilingual ILIKE on nameAz/En/Ru for services
- **Sorting:** sortBy (createdAt, averageRating, completedJobsCount), sortOrder (asc/desc)

## Auth Architecture

### JWT + Refresh Strategy

- **Access token:** Short-lived (15m default), Bearer in `Authorization` header
- **Refresh token:** Longer-lived (7d default), stored in DB hashed (SHA-256), used to obtain new access token
- **Session model:** Stores `refreshTokenHash`, `userId`, `expiresAt`, `revokedAt`, `ipAddress`, `userAgent` for audit and revocation
- **Refresh rotation:** On refresh, old session revoked, new tokens issued — reduces token reuse window

### Role Guard Strategy

- **JwtAuthGuard:** Validates Bearer token, attaches user to request
- **RolesGuard:** Checks `@Roles()` decorator against `user.role` from JWT strategy
- **CurrentUser decorator:** Extracts `userId` from request for controllers
- **Usage:** `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)` on protected routes

### Password Hashing

- **bcryptjs:** 12 rounds (configurable via `BCRYPT_SALT_ROUNDS`). Chosen for cross-platform compatibility (no native bindings).

### Security Notes

- Login returns generic "Invalid credentials" to prevent user enumeration
- Suspended/inactive users get Forbidden (403), not Unauthorized (401)
- New users: `PENDING_VERIFICATION` — can log in; verification gates applied in future for sensitive actions

## Booking Service Architecture

- **Location:** `apps/api/src/modules/bookings/`
- **Centralized status transitions:** `constants/booking-status.constants.ts` defines allowed transitions per role
- **Utils:** `booking-status.util.ts` — `canTransition()`, `canCustomerCancel()`
- **No magic strings:** All status enums used via `BookingStatus`
- **Service layer:** `BookingsService` handles business rules; controller delegates

### Status History Reasoning

- Every status change creates `BookingStatusHistory` record
- Enables audit, dispute resolution, and analytics
- `changedByUserId` tracks who made the change; `note` optional context

### Why Status Transition Centralization

- Prevents invalid state changes (e.g. PENDING → COMPLETED)
- Single source of truth for business rules
- Easy to extend for dispute flow, admin override
- Clear error messages for invalid transitions

## Dashboard Data Aggregation

- **API-first before UI:** Dashboard endpoints return aggregated data; frontend consumes without extra orchestration
- **Role-based:** `/dashboard/customer`, `/dashboard/master`, `/dashboard/admin` — each returns role-specific stats
- **Live queries:** No caching; simple Prisma groupBy, count, findMany
- **Minimal scope:** Booking/review/notification/service counts; no payment analytics in Phase 6

## Financial Domain Foundation

### Payment State Transitions

- PENDING → COMPLETED, FAILED, CANCELLED
- COMPLETED → REFUNDED (future)
- Centralized in PAYMENT_STATUS_TRANSITIONS

### Commission Logic

- Created/updated when admin marks payment COMPLETED
- Amount = payment.amount × DEFAULT_COMMISSION_RATE

### Why Gateway Integration Is Postponed

- Foundation first: payment records, commission, payouts, state transitions
- Provider field reserved (INTERNAL_PLACEHOLDER); providerReference for gateway refs
- IdempotencyKey supports safe retries when real gateway added

### Payout Flow

- Admin manually creates payout for master
- Status transitions controlled; audit logged

## Trust & Safety Layer

### Verification Workflow

- Master creates verification document metadata (fileUrl, documentType, originalFileName)
- No real file upload in Phase 7; foundation for future storage integration
- Admin reviews master profile; approves or rejects with reason
- Rejected masters can resubmit; documents retained as history

### Audit Logging Strategy

- AuditLogsService (global) used for sensitive mutations
- Logged actions: verification status change, user status change, verification document create
- Metadata: previousStatus, nextStatus, targetType; sensitive values redacted
- actorUserId nullable for system actions

## Notification Foundation Strategy

- **Data layer only:** Notification records stored; no delivery infrastructure (email/SMS/push)
- **Integration points:** BookingsService and ReviewsService call NotificationsService.createForUser on events
- **Ownership:** User-scoped; read/unread managed via isRead, readAt
- **Future-ready:** Add delivery channels later without changing the data model

## Database Layer (Prisma)

- **Location:** `apps/api/prisma/schema.prisma`
- **Client:** Generated via `pnpm prisma:generate` (runs automatically on `build`)
- **Module:** `PrismaModule` in `AppModule`, `PrismaService` global
- **Migrations:** `pnpm prisma:migrate:dev` (development), `pnpm prisma:migrate:deploy` (production)
- **Studio:** `pnpm prisma:studio` for GUI
- **Seed:** `pnpm prisma:seed` — placeholder for category/service seed

## Security Hardening & Production Readiness (Block 2)

### Request Tracing

- **Request ID:** Every request gets `x-request-id` (generated or from client); returned in error responses
- **Structured logging:** JSON logs with requestId, method, path, statusCode, durationMs
- **Sensitive data:** Passwords, tokens, credentials never logged; redaction in metadata

### Rate Limiting

- **Default:** 100 req/min per IP (ThrottlerModule)
- **Auth endpoints (login, register, refresh, logout):** 5 req/min — brute-force mitigation
- **Admin mutations:** 30 req/min — abuse prevention
- **Method:** In-memory throttler; suitable for single-instance. Redis-backed limiter recommended for scale.

### Config Validation

- **Fail-fast:** `validateConfig()` runs before NestFactory.create; invalid env aborts startup
- **Production:** JWT secrets must be ≥32 chars
- **CORS:** `CORS_ORIGINS` comma-separated; dev defaults to localhost

### Health & Readiness

- **GET /health:** Basic liveness (service, version, timestamp)
- **GET /health/readiness:** Database ping, uptime, environment; use for load balancer / k8s probes

### Swagger / OpenAPI

- **Path:** `/api/docs`
- **Bearer auth:** Supported for protected endpoints
- **Foundation:** Tags and basic setup; per-endpoint annotations optional

### Idempotency

- **Payment initiation:** `Idempotency-Key` header or DTO `idempotencyKey`; duplicate requests return existing payment
- **Scope:** Payment initiation only; not full enterprise engine

### Response & Error Standardization

- **Errors:** `{ success, statusCode, error, message, path, timestamp, requestId?, details? }`
- **Validation details:** `details[]` with property and messages for 400
- **Production 500:** Generic "Internal server error"; stack only in dev

### API Versioning

- **Current:** `/api/v1` prefix
- **Strategy:** URL path versioning; new major versions as `/api/v2` when breaking changes required
- **Deprecation:** Announce in docs and response headers before removal

## Why Redis (Future)

- **Session store:** Fast, scalable session management for auth
- **Caching:** API response cache, frequently accessed data
- **Rate limiting:** Track requests per user/IP for security
- **Job queues:** Background jobs (notifications, async processing)
- **Real-time:** Pub/sub for live updates if needed
