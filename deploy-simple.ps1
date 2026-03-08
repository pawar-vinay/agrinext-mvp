# Simple Backend Deployment Script

Write-Host "Deploying Backend Update..." -ForegroundColor Cyan

# Step 1: Create package
Write-Host "Creating package..." -ForegroundColor Yellow
if (Test-Path "backend-update.zip") { Remove-Item "backend-update.zip" -Force }
Compress-Archive -Path "backend/dist","backend/package.json","backend/package-lock.json" -DestinationPath "backend-update.zip" -Force
Write-Host "Package created" -ForegroundColor Green

# Step 2: Upload to S3
Write-Host "Uploading to S3..." -ForegroundColor Yellow
aws s3 cp backend-update.zip s3://agrinext-images-1772367775698/deployments/backend-update.zip
Write-Host "Uploaded to S3" -ForegroundColor Green

Write-Host "`nNow run these commands on EC2 via AWS Systems Manager:" -ForegroundColor Cyan
Write-Host "1. cd /home/ssm-user/agrinext" -ForegroundColor White
Write-Host "2. aws s3 cp s3://agrinext-images-1772367775698/deployments/backend-update.zip ./" -ForegroundColor White
Write-Host "3. unzip -o backend-update.zip" -ForegroundColor White
Write-Host "4. cd backend && pm2 restart agrinext-api" -ForegroundColor White
