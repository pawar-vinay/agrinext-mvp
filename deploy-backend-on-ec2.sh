#!/bin/bash
set -e

cd /home/ssm-user/agrinext

echo "Downloading backend from S3..."
aws s3 cp s3://agrinext-images-1772367775698/backend-update.tar.gz .

echo "Extracting backend..."
rm -rf backend/dist
tar -xzf backend-update.tar.gz -C backend
rm backend-update.tar.gz

echo "Restarting backend..."
pkill -f 'node dist/server.js' || true

cd backend
export PATH=/home/ssm-user/.nvm/versions/node/v18.20.8/bin:$PATH
nohup node dist/server.js > ../backend.log 2>&1 &

sleep 3

echo "Backend deployment complete!"
ps aux | grep 'node dist/server.js' | grep -v grep
