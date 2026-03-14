# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy source
COPY . .

# Build-time environment variables injected by CI/CD — never baked into image
ARG VITE_API_BASE_URL
ARG VITE_APP_VERSION
ARG VITE_APP_ENV=production

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_APP_ENV=$VITE_APP_ENV

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy hardened nginx config
COPY nginx.conf /etc/nginx/conf.d/hinsight.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Run as non-root for security


EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
