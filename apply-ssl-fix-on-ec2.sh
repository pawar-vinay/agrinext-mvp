#!/bin/bash

echo "Downloading fixed database.ts from S3..."
aws s3 cp s3://agrinext-images-1772367775698/scripts/database.ts ~/agrinext-phase2/backend/src/config/database.ts

echo ""
echo "✅ File downloaded and replaced"
echo ""
echo "Stopping PM2..."
pm2 stop all
pm2 delete all
pm2 kill

echo ""
echo "Testing with NODE_ENV=production..."
cd ~/agrinext-phase2/backend
NODE_ENV=production tsx src/server.ts
