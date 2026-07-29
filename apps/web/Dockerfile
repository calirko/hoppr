FROM oven/bun:1.3.14-slim AS builder

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/package.json ./apps/server/package.json

RUN bun install --frozen-lockfile --filter web

COPY apps/web ./apps/web

WORKDIR /app/apps/web

RUN bun run build

FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
