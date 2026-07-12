# ==========================================
# Stage 1: Build stage (compile TypeScript)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package configuration files
COPY package*.json ./

# Install all dependencies (including devDependencies for compiling)
RUN npm ci

# Copy TypeScript configs and source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript (dist/)
RUN npm run build

# ==========================================
# Stage 2: Production runner stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set node env to production
ENV NODE_ENV=production

# Copy package configuration files
COPY package*.json ./

# Install only production dependencies (excluding devDependencies)
RUN npm ci --omit=dev

# Copy the compiled build from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the service port (should match env PORT)
EXPOSE 3000

# Start the application
CMD ["node", "dist/app.js"]
