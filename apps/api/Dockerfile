# API Dockerfile - production
FROM node:20-alpine

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@9.14.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ ./apps/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter api prisma generate
RUN pnpm --filter api build

COPY apps/api/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/docker-entrypoint.sh"]
