# Multi-stage Dockerfile for Cloud Run container deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies (including devDependencies for building)
RUN npm ci || npm install

# Copy application code
COPY . .

# Build application (Vite client build + esbuild server bundle)
RUN npm run build

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production || npm install --only=production

# Copy build output from builder stage
COPY --from=builder /app/dist ./dist

# EXPOSE port 8080 as requested
EXPOSE 8080

# Default PORT environment variable
ENV PORT=8080

# Start server
CMD ["npm", "start"]
