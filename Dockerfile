# Frontend Dockerfile - React build & serve
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files only (layer caching)
COPY package*.json ./

# Install dependencies with legacy peer deps support
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Production stage - minimal base
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Install serve globally
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder --chown=nextjs:nodejs /app/build ./build
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Switch to non-root user
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]
