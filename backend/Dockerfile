# ── Backend Dockerfile ──────────────────────────────────────
# Production Node.js image for the Express API

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
