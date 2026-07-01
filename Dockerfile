# Build stage (Debian-based to ease native builds)
FROM node:20-bullseye-slim AS builder
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package-lock.json ./

# Install build deps for native modules (better-sqlite3)
RUN apt-get update && \
    apt-get install -y python3 make g++ libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

RUN npm ci --unsafe-perm
COPY . .
RUN npm run build

# Production image
FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://localhost:3000/api/health || exit 1

CMD ["node","dist/server.cjs"]
