# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies using npm
RUN npm ci --prefer-offline --no-audit 2>/dev/null || npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --prefer-offline --no-audit --omit=dev 2>/dev/null || npm install --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Run with dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
