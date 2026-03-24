# Ustatap Client Platform

Service marketplace platform with Next.js frontend and NestJS backend.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, React 19
- **Backend:** NestJS 10, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma

## Quick Start (Docker)

```bash
docker compose up -d
```

- **Web:** http://localhost:3000
- **API:** http://localhost:3001
- **Swagger:** http://localhost:3001/api/docs

## Quick Start (Local)

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL

### Setup

```bash
pnpm install
cp .env.development.example apps/api/.env
# Web: set NEXT_PUBLIC_API_URL in apps/web/.env.local (optional; defaults to http://localhost:3001)
pnpm --filter api prisma db push    # or: pnpm prisma:migrate:dev
pnpm build:api                      # seed runs compiled dist/prisma/seed.js
pnpm prisma:seed
```

### Run

```bash
# Terminal 1
pnpm dev:api

# Terminal 2
pnpm dev:web
```

- **Web:** http://localhost:3000
- **API:** http://localhost:3001

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_ACCESS_SECRET | Yes | Min 32 chars (production) |
| JWT_REFRESH_SECRET | Yes | Min 32 chars (production) |
| CORS_ORIGINS | Production | Comma-separated allowed origins |
| NEXT_PUBLIC_API_URL | Web | API base URL (client-side) |

See `.env.development.example` and `.env.production.example`.

## API

- **Base:** `http://localhost:3001/api/v1`
- **Swagger:** `http://localhost:3001/api/docs`
- **Health:** `GET /api/v1/health`
- **Readiness:** `GET /api/v1/health/readiness`

Auth: `Authorization: Bearer <accessToken>`

## Default Test Users (Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ustatap.test | Test1234 |
| Customer | customer@ustatap.test | Test1234 |
| Master | master@ustatap.test | Test1234 |

## Project Structure

```
ustatap-client-platform/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/         # Shared (config, types)
├── docs/             # Documentation
├── docker-compose.yml
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| pnpm dev:api | Start API (dev) |
| pnpm dev:web | Start Web (dev) |
| pnpm build:api | Build API |
| pnpm build:web | Build Web |
| pnpm prisma:seed | Run database seed |
| pnpm prisma:studio | Open Prisma Studio |

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Operations](docs/ops.md)

## Commit Strategy

- Atomic commits per logical change
- Conventional commits: `feat()`, `fix()`, `docs()`, `chore()`
- No "Made with Cursor" or similar in messages
