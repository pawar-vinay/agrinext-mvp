# Deploy Full Update (Backend + Web App) to EC2
# Creates a complete deployment package

$EC2_INSTANCE = "i-004ef74f37ba59da1"

Write-Host "=== AgriNext Full Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build backend
Write-Host "Step 1: Building backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..

# Step 2: Build web app
Write-Host ""
Write-Host "Step 2: Building web app..." -ForegroundColor Yellow
Set-Location web-app
npm run build
Set-Location ..

# Step 3: Create deployment package
Write-Host ""
Write-Host "Step 3: Creating deployment package..." -ForegroundColor Yellow
if (Test-Path full-deploy.tar.gz) {
    Remove-Item full-deploy.tar.gz
}

# Create a temporary directory structure
$tempDir = "temp-deploy"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path "$tempDir/backend/dist" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir/web-app/dist" -Force | Out-Null

# Copy backend files
Copy-Item -Path "backend/dist/*" -Destination "$tempDir/backend/dist/" -Recurse
Copy-Item -Path "backend/package.json" -Destination "$tempDir/backend/"
Copy-Item -Path "backend/package-lock.json" -Destination "$tempDir/backend/"
Copy-Item -Path "backend/.env.production" -Destination "$tempDir/backend/.env"

# Copy web app files
Copy-Item -Path "web-app/dist/*" -Destination "$tempDir/web-app/dist/" -Recurse

# Create tar
tar -czf full-deploy.tar.gz -C $tempDir .

# Cleanup temp
Remove-Item $tempDir -Recurse -Force

Write-Host "Package created: full-deploy.tar.gz" -ForegroundColor Green

Write-Host ""
Write-Host "Deployment package ready!" -ForegroundColor Green
Write-Host "Size: $((Get-Item full-deploy.tar.gz).Length / 1MB) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "To deploy, you need to:" -ForegroundColor Yellow
Write-Host "1. Upload full-deploy.tar.gz to EC2 (via AWS Console file upload or S3)" -ForegroundColor White
Write-Host "2. Extract on EC2: tar -xzf full-deploy.tar.gz -C /home/ssm-user/agrinext" -ForegroundColor White
Write-Host "3. Install dependencies: cd /home/ssm-user/agrinext/backend && npm ci --production" -ForegroundColor White
Write-Host "4. Restart backend: pm2 restart all or pm2 restart agrinext-api" -ForegroundColor White
Write-Host ""
Write-Host "The backend will serve both API (port 3000) and web app (same port)" -ForegroundColor Cyan
