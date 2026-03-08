#!/bin/bash

echo "============================================"
echo "Checking Phase 1 Deployment Status"
echo "============================================"
echo ""

# Check if PM2 is installed
echo "1. Checking PM2 installation..."
if command -v pm2 &> /dev/null; then
    echo "   ✓ PM2 is installed"
    PM2_VERSION=$(pm2 --version)
    echo "   Version: $PM2_VERSION"
else
    echo "   ✗ PM2 is NOT installed"
fi
echo ""

# Check if Node.js is installed
echo "2. Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js is installed"
    NODE_VERSION=$(node --version)
    echo "   Version: $NODE_VERSION"
else
    echo "   ✗ Node.js is NOT installed"
fi
echo ""

# Check if npm is installed
echo "3. Checking npm installation..."
if command -v npm &> /dev/null; then
    echo "   ✓ npm is installed"
    NPM_VERSION=$(npm --version)
    echo "   Version: $NPM_VERSION"
else
    echo "   ✗ npm is NOT installed"
fi
echo ""

# Check for Phase 1 directory
echo "4. Checking for Phase 1 directory..."
if [ -d "$HOME/agrinext" ]; then
    echo "   ✓ Phase 1 directory exists: $HOME/agrinext"
    if [ -d "$HOME/agrinext/backend" ]; then
        echo "   ✓ Backend directory exists"
    else
        echo "   ✗ Backend directory NOT found"
    fi
else
    echo "   ✗ Phase 1 directory NOT found"
fi
echo ""

# Check PM2 processes
echo "5. Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo "   PM2 not installed, skipping..."
fi
echo ""

# Check if backend is running on port 3000
echo "6. Checking if backend is running on port 3000..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✓ Backend is responding on port 3000"
    echo "   Response:"
    curl -s http://localhost:3000/health | head -5
else
    echo "   ✗ Backend is NOT responding on port 3000"
fi
echo ""

echo "============================================"
echo "Status Check Complete"
echo "============================================"
