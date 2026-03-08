#!/bin/bash

# Fix environment variables and restart Phase 2 backend
# This script adds the missing REFRESH_TOKEN_SECRET and restarts PM2

set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Fixing environment variables and restarting backend..."

# Navigate to backend directory
cd ~/agrinext-phase2/backend

# Check if JWT_REFRESH_SECRET exists in .env
if grep -q "JWT_REFRESH_SECRET=" .env; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Found JWT_REFRESH_SECRET in .env"
    
    # Extract the value
    JWT_REFRESH_VALUE=$(grep "JWT_REFRESH_SECRET=" .env | cut -d '=' -f2)
    
    # Check if REFRESH_TOKEN_SECRET already exists
    if grep -q "REFRESH_TOKEN_SECRET=" .env; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] REFRESH_TOKEN_SECRET already exists"
    else
        # Add REFRESH_TOKEN_SECRET with the same value as JWT_REFRESH_SECRET
        echo "" >> .env
        echo "# Added for compatibility" >> .env
        echo "REFRESH_TOKEN_SECRET=$JWT_REFRESH_VALUE" >> .env
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Added REFRESH_TOKEN_SECRET to .env"
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: JWT_REFRESH_SECRET not found in .env"
    exit 1
fi

# Verify the variable was added
if grep -q "REFRESH_TOKEN_SECRET=" .env; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ REFRESH_TOKEN_SECRET verified in .env"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to add REFRESH_TOKEN_SECRET"
    exit 1
fi

# Stop any existing PM2 processes
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Stopping existing PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# Start the application with ecosystem config
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Wait for application to start
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for application to start..."
sleep 5

# Check PM2 status
echo "[$(date '+%Y-%m-%d %H:%M:%S')] PM2 Status:"
pm2 status

# Check if application is running
if pm2 list | grep -q "online"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Application is running"
    
    # Test health endpoint
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Testing health endpoint..."
    sleep 2
    
    if curl -f http://localhost:3000/health 2>/dev/null; then
        echo ""
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Health check passed!"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Phase 2 backend is running successfully"
    else
        echo ""
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠ Health check failed, checking logs..."
        pm2 logs agrinext-api --lines 30 --nostream
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✗ Application failed to start"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking logs..."
    pm2 logs agrinext-api --lines 30 --nostream
    exit 1
fi
