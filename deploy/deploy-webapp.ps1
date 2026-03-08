# Web App Deployment Script for Windows
# Run this script to deploy web app to EC2

param(
    [string]$EC2_HOST = "3.239.184.220",
    [string]$EC2_USER = "ec2-user",
    [string]$EC2_KEY = "Aws Resoucres/agrinext-key.pem"
)

$ErrorActionPreference = "Stop"
$APP_DIR = "/home/ec2-user/agrinext"

Write-Host "Starting web app deployment to $EC2_HOST" -ForegroundColor Green

# Step 1: Build locally
Write-Host ""
Write-Host "Step 1: Building web app locally..." -ForegroundColor Yellow
Set-Location web-app
npm install
npm run build
Set-Location ..

# Step 2: Create deployment package
Write-Host ""
Write-Host "Step 2: Creating deployment package..." -ForegroundColor Yellow
if (Test-Path webapp-deploy.tar.gz) {
    Remove-Item webapp-deploy.tar.gz
}
tar -czf webapp-deploy.tar.gz web-app/dist

# Step 3: Upload to EC2
Write-Host ""
Write-Host "Step 3: Uploading to EC2..." -ForegroundColor Yellow
scp -i "$EC2_KEY" webapp-deploy.tar.gz "${EC2_USER}@${EC2_HOST}:${APP_DIR}/"

# Step 4: Deploy on EC2
Write-Host ""
Write-Host "Step 4: Deploying on EC2..." -ForegroundColor Yellow
$deployScript = @'
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
'@

ssh -i "$EC2_KEY" "${EC2_USER}@${EC2_HOST}" $deployScript

# Step 5: Verify deployment
Write-Host ""
Write-Host "Step 5: Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://${EC2_HOST}:5173" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host ""
        Write-Host "Deployment successful! Web app is accessible." -ForegroundColor Green
        Write-Host "Web app URL: http://${EC2_HOST}:5173" -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host "Deployment may have issues. Could not verify web app." -ForegroundColor Red
}

# Cleanup
Remove-Item webapp-deploy.tar.gz

Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green
