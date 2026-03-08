#!/bin/bash
# Start backend with environment variables explicitly loaded

cd /home/ssm-user/agrinext-phase2/backend || exit 1

echo "Loading environment variables from .env..."
set -a
source .env
set +a

echo "Starting backend server..."
exec npx tsx src/server.ts
