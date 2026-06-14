# Step 1: Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies (including devDependencies needed for compiling with Vite & esbuild)
RUN npm install

# Copy source files
COPY . .

# Run production build (compiles react app and bundles Node.js server.ts)
RUN npm run build

# Prune development dependencies to keep the image minimal
RUN npm prune --production

# Step 2: Runtime Stage
FROM node:20-alpine

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Set working directory
WORKDIR /app

# Copy built assets and production runtime dependencies from builder step
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Initialize/copy empty database file or existing database file to prevent read/write issues
COPY --from=builder /app/elite_users_db.json* ./

# Expose server port (3000 is the hardcoded entry point or standard mapping)
EXPOSE 3000

# Command to start the application using production server.cjs
CMD ["npm", "start"]
