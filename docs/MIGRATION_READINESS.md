# Migration Readiness

## Current Schema State

Prisma schema includes models added in backend gap closing:

- **PasswordResetToken** — Forgot/reset password flow
- **MessageThread** — Booking-based messaging
- **Message** — Thread messages
- **Dispute** — Extended with `issueType`, `attachmentUrls` (JSON)

## Migration Commands

When database is available (PostgreSQL running, valid `DATABASE_URL` in `apps/api/.env`):

```bash
cd apps/api
npx prisma migrate dev --name backend_gap_closing
```

Or to create migration without applying (e.g. for review):

```bash
npx prisma migrate dev --name backend_gap_closing --create-only
```

Then apply in production:

```bash
npx prisma migrate deploy
```

## Verify Schema Sync

```bash
cd apps/api
npx prisma generate
```

If `prisma generate` succeeds, the schema is valid. Migration creates the physical tables.

## Code–Schema Alignment

- All Prisma models referenced in code exist in schema
- No orphan references
- Enums: `DisputeIssueType`, `DisputeStatus` used by disputes module
