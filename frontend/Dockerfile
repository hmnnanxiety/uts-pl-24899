# syntax=docker/dockerfile:1

# Stage 1: Build Vue application
FROM node:22.16.0-alpine3.21 AS builder

WORKDIR /app

# Cache dependencies separately
COPY package.json package-lock.json ./

RUN npm ci

# Copy application source
COPY . .

# Same-origin API configuration
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build


# Stage 2: Serve with Nginx
FROM nginx:1.28.0-alpine AS runner

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]