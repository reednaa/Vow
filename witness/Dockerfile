FROM oven/bun:1.3.5-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.5-alpine AS admin-builder
WORKDIR /app/admin

COPY admin/package.json admin/bun.lock* ./
RUN bun install --frozen-lockfile

COPY admin ./
RUN bun run build

FROM oven/bun:1.3.5-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=3000
ENV HEALTH_PORT=3001

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock tsconfig.json ./
COPY drizzle ./drizzle
COPY src ./src
COPY --from=admin-builder /app/public/admin ./public/admin

EXPOSE 3000
EXPOSE 3001

CMD ["bun", "run", "start:api"]
