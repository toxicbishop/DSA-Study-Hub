# Stage 1: Build the backend dependencies
FROM node:22-alpine AS builder
WORKDIR /app

# Copy the server's package files and lockfile
COPY server/package.json server/pnpm-lock.yaml server/.pnpmfile.cjs server/pnpm-workspace.yaml ./server/
RUN corepack enable && corepack prepare pnpm@11.5.0 --activate \
    && cd server \
    && pnpm install --prod --frozen-lockfile

# Stage 2: Final Runtime Image
FROM node:22-alpine
WORKDIR /app

# Install compilers and runtimes for code execution (C, C++, Python, Java)
# We need these for the /api/execute endpoint to work
RUN apk add --no-cache build-base python3 openjdk21

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy node_modules from the builder stage
COPY --from=builder /app/server/node_modules ./server/node_modules

# Copy the server source code
COPY server/ ./server/

# Set environment to production
ENV NODE_ENV=production
ENV PORT=5000

# Set the working directory to the server folder
WORKDIR /app/server

# Ensure the nodejs user owns the app directory
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# Expose the API port (as defined in your docker-compose.yml)
EXPOSE 5000

# Health check to ensure the API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# Start the Express server
CMD ["node", "index.js"]
