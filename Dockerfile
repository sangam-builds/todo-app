# Stage 1: Build & Generate Prisma Client
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# Stage 2: Production Runtime
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma Client and binaries from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy application source code
COPY prisma ./prisma
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm start"]