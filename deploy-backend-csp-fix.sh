#!/bin/bash
set -e

cd /home/ssm-user/agrinext/backend

echo "Stopping backend..."
pkill -f 'node dist/server.js' || true

echo "Updating server.ts CSP configuration..."
# Update the imgSrc line to include blob:
sed -i 's/imgSrc: \["'"'"'self'"'"'", "data:", "https:"\]/imgSrc: ["'"'"'self'"'"'", "data:", "https:", "blob:"]/' dist/server.js

echo "Starting backend..."
export PATH=/home/ssm-user/.nvm/versions/node/v18.20.8/bin:$PATH
nohup node dist/server.js > ../backend.log 2>&1 &

sleep 3

echo "Backend restarted with CSP fix!"
ps aux | grep 'node dist/server.js' | grep -v grep
