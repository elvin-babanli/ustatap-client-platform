#!/bin/sh
set -e
cd /app
# Apply schema: migrate deploy when migrations/ has migrations; otherwise db push
# (migrate deploy exits 0 with "no migrations" but does not create tables — must not skip db push)
if [ -d apps/api/prisma/migrations ] && [ -n "$(ls -A apps/api/prisma/migrations 2>/dev/null)" ]; then
  pnpm --filter api exec -- prisma migrate deploy
else
  pnpm --filter api exec -- prisma db push
fi
# Seed (idempotent; requires compiled dist/prisma/seed.js from build)
pnpm --filter api exec -- prisma db seed
exec node apps/api/dist/src/main.js
