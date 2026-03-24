# Deployment Guide

## Local Development

```bash
pnpm install
# Optional: copy apps/api/.env from apps/api/.env.development or set your own `.env` / `.env.local` there
pnpm prisma:migrate:dev   # or: pnpm --filter api prisma db push
pnpm prisma:seed
pnpm dev:api    # or: npx pnpm dev:api
pnpm dev:web    # or: npx pnpm dev:web
# Or both: pnpm dev
```

**Windows:** If you set `DATABASE_URL` under User or System environment variables, it overrides `apps/api/.env` for many tools. Prefer removing that variable for local dev, or ensure it matches Docker (e.g. port **5433**). The API entrypoint loads `apps/api/.env` with **override** so the app follows the project file even when a stale `DATABASE_URL` exists in the OS.

**Port 3001 in use (`EADDRINUSE`):** Docker Compose also exposes the API on `3001`. For a **local** `pnpm dev:api`, run `docker compose stop api` (Postgres can keep running).

- API: http://localhost:3001
- Web: http://localhost:3000

## Docker Deployment

```bash
docker compose up -d
```

- API: http://localhost:3001
- Web: http://localhost:3000
- PostgreSQL (from host): `localhost:5433` → container `5432` (user: `ustatap`, pass: `ustatap_secret`). Port **5433** avoids conflicts with a local Postgres on **5432**.

Seed runs automatically on first API start. To override env, create `.env`:

```env
JWT_ACCESS_SECRET=your-secure-secret-min-32-chars
JWT_REFRESH_SECRET=your-secure-secret-min-32-chars
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Production (VPS / Ubuntu)

### Option A: Docker

1. Clone repo, copy `.env.production.example` to `.env`
2. Set DATABASE_URL, JWT secrets, CORS_ORIGINS, NEXT_PUBLIC_API_URL
3. Run `docker compose up -d`
4. Put NGINX in front as reverse proxy
5. Use Let's Encrypt for SSL

### Option B: Node + PM2

1. Install Node 20+, PostgreSQL
2. Build: `pnpm install && pnpm build:api && pnpm build:web`
3. Run migrations: `pnpm --filter api prisma migrate deploy`
4. Seed: `pnpm prisma:seed`
5. PM2: `pm2 start apps/api/dist/main.js --name api`
6. PM2: `pm2 start "pnpm --filter web start" --name web`
7. NGINX reverse proxy to API:3001 and Web:3000

### NGINX (basic reverse proxy)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

Certbot configures NGINX automatically.
