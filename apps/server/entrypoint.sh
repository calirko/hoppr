#!/bin/sh
set -e

cd /app/apps/server

echo "Running database migrations..."
bunx prisma migrate deploy

SEED_MARKER=/tmp/.seeded
if [ ! -f "$SEED_MARKER" ]; then
  echo "Running database seed..."
  bun run dist/seed.js
  touch "$SEED_MARKER"
else
  echo "Database already seeded this container lifetime, skipping."
fi

echo "Starting server..."
bun run dist/index.js
