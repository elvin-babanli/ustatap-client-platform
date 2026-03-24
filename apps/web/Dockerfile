# Web Dockerfile - production
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.14.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ ./apps/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter web build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "--filter", "web", "start"]
