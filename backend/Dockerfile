# Backend Dockerfile - Node.js TypeScript API
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps && cd backend && npm ci --legacy-peer-deps && cd ..

# Copy source code
COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/
COPY backend/tsconfig.build.json ./backend/

# Build TypeScript
WORKDIR /app/backend
RUN npm run build

# Production stage - minimal runtime
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files
COPY --chown=nodejs:nodejs package.json ./
COPY --chown=nodejs:nodejs backend/package*.json ./backend/

# Install production dependencies only using npm install
RUN npm install --legacy-peer-deps --omit=dev && cd backend && npm install --legacy-peer-deps --omit=dev && cd ..

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist

# Switch to non-root user
USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["node", "backend/dist/server.js"]
