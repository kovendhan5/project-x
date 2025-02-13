# Use Node.js LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install production dependencies first
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R node:node logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER node

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start the server
CMD ["node", "server.js"]