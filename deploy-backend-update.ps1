# Deploy Backend Update to EC2
# This script uploads the compiled backend and restarts the service

Write-Host "🚀 Deploying Backend Update to EC2..." -ForegroundColor Cyan

# Configuration
$EC2_IP = "3.239.184.220"
$S3_BUCKET = "agrinext-images-1772367775698"
$BACKEND_PATH = "/home/ssm-user/agrinext/backend"

# Step 1: Create deployment package
Write-Host "`n📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "backend-update.zip") {
    Remove-Item "backend-update.zip" -Force
}

# Compress only necessary files
Compress-Archive -Path @(
    "backend/dist",
    "backend/package.json",
    "backend/package-lock.json"
) -DestinationPath "backend-update.zip" -Force

Write-Host "✅ Package created: backend-update.zip" -ForegroundColor Green

# Step 2: Upload to S3
Write-Host "`n☁️  Uploading to S3..." -ForegroundColor Yellow
aws s3 cp backend-update.zip "s3://$S3_BUCKET/deployments/backend-update.zip"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Uploaded to S3" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to upload to S3" -ForegroundColor Red
    exit 1
}

# Step 3: Create deployment script for EC2
$deployScript = @"
#!/bin/bash
set -e

echo "🔄 Downloading update from S3..."
cd /home/ssm-user/agrinext
aws s3 cp s3://$S3_BUCKET/deployments/backend-update.zip ./backend-update.zip

echo "📦 Extracting update..."
unzip -o backend-update.zip -d ./

echo "🔄 Restarting backend service..."
cd backend
pm2 restart agrinext-api || pm2 start dist/server.js --name agrinext-api

echo "✅ Backend updated successfully!"
pm2 status
"@

$deployScript | Out-File -FilePath "deploy-on-ec2.sh" -Encoding UTF8 -NoNewline

# Step 4: Upload deployment script to S3
Write-Host "`n📤 Uploading deployment script..." -ForegroundColor Yellow
aws s3 cp deploy-on-ec2.sh "s3://$S3_BUCKET/deployments/deploy-on-ec2.sh"

# Step 5: Execute deployment on EC2 via SSM
Write-Host "`n🚀 Executing deployment on EC2..." -ForegroundColor Yellow
$instanceId = "i-004ef74f37ba59da1"

$ssmCommand = "cd /home/ssm-user/agrinext && aws s3 cp s3://$S3_BUCKET/deployments/deploy-on-ec2.sh ./deploy-on-ec2.sh && chmod +x deploy-on-ec2.sh && ./deploy-on-ec2.sh"

$commandId = aws ssm send-command --instance-ids $instanceId --document-name "AWS-RunShellScript" --parameters "commands=[$ssmCommand]" --output text --query "Command.CommandId"

Write-Host "✅ Deployment command sent: $commandId" -ForegroundColor Green
Write-Host "⏳ Waiting 15 seconds for deployment to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 6: Test the deployment
Write-Host "`n🧪 Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$EC2_IP:3000/health" -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Uptime: $([math]::Round($health.uptime / 60, 2)) minutes" -ForegroundColor White
    Write-Host "   Database: $($health.services.database)" -ForegroundColor White
} catch {
    Write-Host "⚠️  Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Backend URL: http://$EC2_IP:3000" -ForegroundColor Cyan
