# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production

# Copy compiled code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]