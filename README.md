# Ustatap Client Platform

High-traffic, secure service marketplace web platform. Monorepo containing Next.js frontend and NestJS backend.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, React 19
- **Backend:** NestJS 10, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Cache:** Redis (planned)

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Setup

```bash
pnpm install
```

Copy `apps/api/.env.example` to `apps/api/.env` and configure:

- **DATABASE_URL** — PostgreSQL connection string (required)
- **JWT_ACCESS_SECRET** / **JWT_REFRESH_SECRET** — Min 32 chars in production
- **CORS_ORIGINS** — Comma-separated allowed origins (dev defaults to localhost:3000)

Config validation runs at startup; invalid or missing required env will fail fast.

## Database (Prisma)

```bash
# Generate Prisma client (runs on build)
pnpm --filter api prisma:generate

# Run migrations (requires PostgreSQL)
pnpm --filter api prisma:migrate:dev

# Open Prisma Studio
pnpm --filter api prisma:studio

# Seed (placeholder)
pnpm --filter api prisma:seed
```

## Development

```bash
# Frontend (Next.js) - http://localhost:3000
pnpm dev:web

# Backend (NestJS) - http://localhost:3001
pnpm dev:api
```

## API

- **Base URL:** `http://localhost:3001/api/v1`
- **Swagger:** `http://localhost:3001/api/docs`
- **Health:** `GET /api/v1/health`
- **Readiness:** `GET /api/v1/health/readiness` (includes DB ping)

**Auth:** Use `Authorization: Bearer <accessToken>` header. See Swagger for details.

**Security:** CORS, Helmet headers, rate limiting (stricter on auth/admin), config validation at startup.

## Project Structure

```
ustatap-client-platform/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── config/       # Shared configs
│   ├── types/        # Shared types
│   └── ui/           # Future shared UI
└── docs/             # Documentation
```

## Documentation

See `/docs` for architecture, roadmap, and API module planning.
