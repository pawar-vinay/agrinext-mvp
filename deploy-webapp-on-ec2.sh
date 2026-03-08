#!/bin/bash
set -e

cd /home/ssm-user/agrinext

echo "Downloading web app from S3..."
aws s3 cp s3://agrinext-images-1772367775698/webapp-update.tar.gz .

echo "Extracting web app..."
tar -xzf webapp-update.tar.gz
rm webapp-update.tar.gz

echo "Restarting backend to serve updated web app..."
pkill -f 'node dist/server.js' || true

cd backend
export PATH=/home/ssm-user/.nvm/versions/node/v18.20.8/bin:$PATH
nohup node dist/server.js > ../backend.log 2>&1 &

sleep 3

echo "Deployment complete!"
ps aux | grep 'node dist/server.js' | grep -v grep
