#!/bin/bash
# Web App Deployment Script
# Run this script on your local machine to deploy web app to EC2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="${EC2_HOST:-3.239.184.220}"
EC2_USER="${EC2_USER:-ec2-user}"
EC2_KEY="${EC2_KEY:-Aws Resoucres/agrinext-key.pem}"
APP_DIR="/home/ec2-user/agrinext"

echo -e "${GREEN}Starting web app deployment to $EC2_HOST${NC}"

# Step 1: Build locally
echo -e "${YELLOW}Step 1: Building web app locally...${NC}"
cd web-app
npm install
npm run build
cd ..

# Step 2: Create deployment package
echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
tar -czf webapp-deploy.tar.gz web-app/dist

# Step 3: Upload to EC2
echo -e "${YELLOW}Step 3: Uploading to EC2...${NC}"
scp -i "$EC2_KEY" webapp-deploy.tar.gz "$EC2_USER@$EC2_HOST:$APP_DIR/"

# Step 4: Deploy on EC2
echo -e "${YELLOW}Step 4: Deploying on EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

APP_DIR="/home/ec2-user/agrinext"
cd $APP_DIR

# Backup current version
if [ -d "web-app/dist" ]; then
    echo "Backing up current version..."
    tar -czf "webapp-backup-$(date +%Y%m%d-%H%M%S).tar.gz" web-app/dist
fi

# Extract new version
echo "Extracting new version..."
tar -xzf webapp-deploy.tar.gz
rm webapp-deploy.tar.gz

# Install/update serve if not present
if ! command -v serve &> /dev/null; then
    echo "Installing serve..."
    npm install -g serve
fi

# Restart web app with PM2
echo "Restarting web app..."
pm2 delete agrinext-webapp || true
pm2 start serve --name agrinext-webapp -- web-app/dist -s -l 5173

# Save PM2 configuration
pm2 save

echo "Web app deployment complete!"
ENDSSH

# Step 5: Verify deployment
echo -e "${YELLOW}Step 5: Verifying deployment...${NC}"
sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$EC2_HOST:5173" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Deployment successful! Web app is accessible.${NC}"
    echo -e "${GREEN}Web app URL: http://$EC2_HOST:5173${NC}"
else
    echo -e "${RED}✗ Deployment may have issues. HTTP code: $HTTP_CODE${NC}"
fi

# Cleanup
rm webapp-deploy.tar.gz

echo -e "${GREEN}Deployment completed!${NC}"
