#!/bin/bash
# Backend Deployment Script
# Run this script on your local machine to deploy backend to EC2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ec2-user}"
EC2_KEY="${EC2_KEY:-agrinext-key.pem}"
APP_DIR="/home/ec2-user/agrinext"

# Check if EC2_HOST is set
if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}Error: EC2_HOST environment variable is not set${NC}"
    echo "Usage: EC2_HOST=<ec2-ip> ./deploy-backend.sh"
    exit 1
fi

echo -e "${GREEN}Starting deployment to $EC2_HOST${NC}"

# Step 1: Build locally
echo -e "${YELLOW}Step 1: Building application locally...${NC}"
cd backend
npm install
npm run build
cd ..

# Step 2: Create deployment package
echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
tar -czf backend-deploy.tar.gz \
    backend/dist \
    backend/package.json \
    backend/package-lock.json \
    backend/.env.production

# Step 3: Upload to EC2
echo -e "${YELLOW}Step 3: Uploading to EC2...${NC}"
scp -i "$EC2_KEY" backend-deploy.tar.gz "$EC2_USER@$EC2_HOST:$APP_DIR/"

# Step 4: Deploy on EC2
echo -e "${YELLOW}Step 4: Deploying on EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

APP_DIR="/home/ec2-user/agrinext"
cd $APP_DIR

# Backup current version
if [ -d "backend" ]; then
    echo "Backing up current version..."
    tar -czf "backup-$(date +%Y%m%d-%H%M%S).tar.gz" backend
fi

# Extract new version
echo "Extracting new version..."
tar -xzf backend-deploy.tar.gz
rm backend-deploy.tar.gz

# Install dependencies
cd backend
npm ci --production

# Copy environment file
if [ -f ".env.production" ]; then
    cp .env.production .env
fi

# Restart PM2
echo "Restarting application..."
pm2 restart agrinext-backend || pm2 start dist/server.js --name agrinext-backend

# Save PM2 configuration
pm2 save

echo "Deployment complete!"
ENDSSH

# Step 5: Verify deployment
echo -e "${YELLOW}Step 5: Verifying deployment...${NC}"
sleep 5

HEALTH_CHECK=$(curl -s "http://$EC2_HOST/health" || echo "failed")
if [[ $HEALTH_CHECK == *"healthy"* ]]; then
    echo -e "${GREEN}✓ Deployment successful! Health check passed.${NC}"
else
    echo -e "${RED}✗ Deployment may have issues. Health check failed.${NC}"
    echo "Response: $HEALTH_CHECK"
    exit 1
fi

# Cleanup
rm backend-deploy.tar.gz

echo -e "${GREEN}Deployment completed successfully!${NC}"
