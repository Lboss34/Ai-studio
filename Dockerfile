# Use Node.js 20 base image
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for building)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the frontend and backend assets
RUN npm run build

# Remove development dependencies to keep the image slim
RUN npm prune --production

# Start second stage for a clean production container
FROM node:20-alpine

# Set node environment
ENV NODE_ENV=production
ENV PORT=3000

# Set the working directory
WORKDIR /app

# Copy production node_modules and built assets from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/elite_users_db.json ./elite_users_db.json

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
