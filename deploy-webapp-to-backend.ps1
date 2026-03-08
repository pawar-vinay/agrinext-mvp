# Deploy Web App to EC2 (served by backend on port 3000)
# This script deploys the web app to be served by the backend server

$ErrorActionPreference = "Stop"

$EC2_HOST = "3.239.184.220"
$S3_BUCKET = "agrinext-images-1772367775698"
$APP_DIR = "/home/ssm-user/agrinext"
$INSTANCE_ID = "i-004ef74f37ba59da1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AgriNext Web App Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build web app locally
Write-Host "[1/5] Building web app..." -ForegroundColor Yellow
Push-Location web-app
npm run build
Pop-Location

# Step 2: Package web app
Write-Host "[2/5] Packaging web app..." -ForegroundColor Yellow
if (Test-Path webapp-update.tar.gz) {
    Remove-Item webapp-update.tar.gz
}
tar -czf webapp-update.tar.gz -C web-app dist

# Step 3: Upload to S3
Write-Host "[3/5] Uploading to S3..." -ForegroundColor Yellow
aws s3 cp webapp-update.tar.gz s3://$S3_BUCKET/webapp-update.tar.gz

# Step 4: Deploy on EC2 via SSM
Write-Host "[4/5] Deploying on EC2..." -ForegroundColor Green

$deployScript = @'
cd /home/ssm-user/agrinext
echo 'Downloading web app from S3...'
aws s3 cp s3://agrinext-images-1772367775698/webapp-update.tar.gz .
echo 'Extracting web app...'
tar -xzf webapp-update.tar.gz
rm webapp-update.tar.gz
echo 'Restarting backend to serve updated web app...'
pkill -f 'node dist/server.js'
cd backend
export PATH=/home/ssm-user/.nvm/versions/node/v18.20.8/bin:$PATH
nohup node dist/server.js > ../backend.log 2>&1 &
sleep 3
echo 'Deployment complete!'
ps aux | grep 'node dist/server.js' | grep -v grep
'@

$commandId = aws ssm send-command `
    --instance-ids $INSTANCE_ID `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=[$deployScript]" `
    --output text `
    --query "Command.CommandId"

Write-Host "Command ID: $commandId" -ForegroundColor Cyan
Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Verify deployment
Write-Host "[5/5] Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://${EC2_HOST}:3000" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Success! Web app is accessible at http://${EC2_HOST}:3000" -ForegroundColor Green
    }
}
catch {
    Write-Host "Web app verification failed: $_" -ForegroundColor Red
    Write-Host "Check backend logs with: aws ssm start-session --target $INSTANCE_ID" -ForegroundColor Yellow
}

# Cleanup
Remove-Item webapp-update.tar.gz -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Web App URL: http://${EC2_HOST}:3000" -ForegroundColor White
Write-Host "Backend API: http://${EC2_HOST}:3000/api/v1" -ForegroundColor White
Write-Host "Health Check: http://${EC2_HOST}:3000/health" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
