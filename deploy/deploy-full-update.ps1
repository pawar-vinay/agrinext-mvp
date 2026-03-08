# Full Deployment Script - Backend + Web App
# Deploys both backend API changes and web app to EC2

param(
    [string]$EC2_HOST = "3.239.184.220",
    [string]$EC2_USER = "ec2-user",
    [string]$EC2_KEY = "Aws Resoucres/agrinext-key.pem"
)

$ErrorActionPreference = "Stop"
$APP_DIR = "/home/ec2-user/agrinext"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AgriNext Full Deployment to EC2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Target: $EC2_HOST" -ForegroundColor Cyan
Write-Host ""

# PART 1: BUILD BACKEND
Write-Host "`n[BACKEND] Building backend locally..." -ForegroundColor Yellow
Push-Location backend
npm install
npm run build
Pop-Location

Write-Host "`n[BACKEND] Creating backend package..." -ForegroundColor Yellow
if (Test-Path backend-deploy.tar.gz) {
    Remove-Item backend-deploy.tar.gz
}
tar -czf backend-deploy.tar.gz backend/dist backend/package.json backend/package-lock.json backend/.env.production

Write-Host "`n[BACKEND] Uploading backend to EC2..." -ForegroundColor Yellow
scp -i "$EC2_KEY" backend-deploy.tar.gz "${EC2_USER}@${EC2_HOST}:${APP_DIR}/"

# PART 2: BUILD WEB APP
Write-Host "`n[WEB APP] Building web app locally..." -ForegroundColor Yellow
Push-Location web-app
npm install
npm run build
Pop-Location

Write-Host "`n[WEB APP] Creating web app package..." -ForegroundColor Yellow
if (Test-Path webapp-deploy.tar.gz) {
    Remove-Item webapp-deploy.tar.gz
}
tar -czf webapp-deploy.tar.gz web-app/dist

Write-Host "`n[WEB APP] Uploading web app to EC2..." -ForegroundColor Yellow
scp -i "$EC2_KEY" webapp-deploy.tar.gz "${EC2_USER}@${EC2_HOST}:${APP_DIR}/"

# PART 3: DEPLOY ON EC2
Write-Host "`n[EC2] Deploying on EC2..." -ForegroundColor Green

$deployScript = @'
set -e
APP_DIR="/home/ec2-user/agrinext"
cd $APP_DIR
echo "Deploying Backend..."
if [ -d "backend" ]; then
    tar -czf "backend-backup-$(date +%Y%m%d-%H%M%S).tar.gz" backend
fi
tar -xzf backend-deploy.tar.gz
rm backend-deploy.tar.gz
cd backend
npm ci --production
if [ -f ".env.production" ]; then
    cp .env.production .env
fi
pm2 restart agrinext-backend || pm2 start dist/server.js --name agrinext-backend
cd ..
echo "Deploying Web App..."
if [ -d "web-app/dist" ]; then
    tar -czf "webapp-backup-$(date +%Y%m%d-%H%M%S).tar.gz" web-app/dist
fi
tar -xzf webapp-deploy.tar.gz
rm webapp-deploy.tar.gz
if ! command -v serve &> /dev/null; then
    npm install -g serve
fi
pm2 delete agrinext-webapp || true
pm2 start serve --name agrinext-webapp -- web-app/dist -s -l 5173
pm2 save
pm2 status
'@

ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" $deployScript

# VERIFY
Write-Host "`n[VERIFY] Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`nChecking backend..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "http://${EC2_HOST}:3000/health" -TimeoutSec 10
    Write-Host "✓ Backend is healthy" -ForegroundColor Green
}
catch {
    Write-Host "✗ Backend health check failed" -ForegroundColor Red
}

Write-Host "`nChecking web app..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://${EC2_HOST}:5173" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✓ Web app is accessible" -ForegroundColor Green
}
catch {
    Write-Host "✗ Web app check failed" -ForegroundColor Red
}

Remove-Item backend-deploy.tar.gz -ErrorAction SilentlyContinue
Remove-Item webapp-deploy.tar.gz -ErrorAction SilentlyContinue

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend API: http://${EC2_HOST}:3000" -ForegroundColor White
Write-Host "Web App: http://${EC2_HOST}:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nDeployment completed!" -ForegroundColor Green
