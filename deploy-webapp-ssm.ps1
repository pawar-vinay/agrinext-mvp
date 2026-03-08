# Deploy Web App using SSM Document Store
# Workaround for SSH/S3 credential issues

$EC2_INSTANCE = "i-004ef74f37ba59da1"

Write-Host "=== AgriNext Web App Deployment via SSM ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build web app
Write-Host "Step 1: Building web app..." -ForegroundColor Yellow
Set-Location web-app
npm run build
Set-Location ..

# Step 2: Create web app directory on EC2
Write-Host ""
Write-Host "Step 2: Creating web app directory on EC2..." -ForegroundColor Yellow

$createDirCmd = (aws ssm send-command `
    --instance-ids $EC2_INSTANCE `
    --document-name "AWS-RunShellScript" `
    --parameters 'commands=["mkdir -p /home/ssm-user/agrinext/web-app/dist","echo Directory created"]' `
    --output json | ConvertFrom-Json).Command.CommandId

Start-Sleep -Seconds 3
$result = aws ssm get-command-invocation --command-id $createDirCmd --instance-id $EC2_INSTANCE --output json | ConvertFrom-Json
Write-Host "Status: $($result.Status)" -ForegroundColor Green

# Step 3: Copy server script
Write-Host ""
Write-Host "Step 3: Creating server script on EC2..." -ForegroundColor Yellow

$serverScript = Get-Content webapp-server.js -Raw
$serverScriptEscaped = $serverScript -replace '"', '\"' -replace "`n", "\n" -replace "`r", ""

$createServerCmd = (aws ssm send-command `
    --instance-ids $EC2_INSTANCE `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=['cat > /home/ssm-user/agrinext/web-app/server.js << ''EOF''','$serverScriptEscaped','EOF','echo Server script created']" `
    --output json | ConvertFrom-Json).Command.CommandId

Start-Sleep -Seconds 3
$result = aws ssm get-command-invocation --command-id $createServerCmd --instance-id $EC2_INSTANCE --output json | ConvertFrom-Json
Write-Host "Status: $($result.Status)" -ForegroundColor Green

Write-Host ""
Write-Host "Web app server script created on EC2" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload web-app/dist files to EC2 manually or via S3" -ForegroundColor White
Write-Host "2. Run on EC2: cd /home/ssm-user/agrinext/web-app && node server.js" -ForegroundColor White
Write-Host ""
Write-Host "Or use the AWS Console to upload files via Session Manager" -ForegroundColor Yellow
