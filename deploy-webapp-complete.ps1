# Complete Web App Deployment to EC2
# Builds, uploads via S3, and starts the web app

$EC2_INSTANCE = "i-004ef74f37ba59da1"
$S3_BUCKET = "agrinext-images-1772367775698"
$TIMESTAMP = Get-Date -Format 'yyyyMMdd-HHmmss'
$DEPLOY_KEY = "deployments/webapp-$TIMESTAMP.tar.gz"

Write-Host "=== AgriNext Web App Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "Step 1: Building web app..." -ForegroundColor Yellow
Set-Location web-app
npm run build
Set-Location ..

# Step 2: Package
Write-Host ""
Write-Host "Step 2: Creating deployment package..." -ForegroundColor Yellow
if (Test-Path webapp-deploy.tar.gz) {
    Remove-Item webapp-deploy.tar.gz
}
tar -czf webapp-deploy.tar.gz -C web-app dist

# Step 3: Upload to S3
Write-Host ""
Write-Host "Step 3: Uploading to S3..." -ForegroundColor Yellow
aws s3 cp webapp-deploy.tar.gz "s3://$S3_BUCKET/$DEPLOY_KEY"

# Step 4: Deploy on EC2
Write-Host ""
Write-Host "Step 4: Deploying on EC2..." -ForegroundColor Yellow

$deployCommands = @"
cd /home/ssm-user/agrinext
mkdir -p web-app
aws s3 cp s3://$S3_BUCKET/$DEPLOY_KEY /tmp/webapp.tar.gz
cd web-app
tar -xzf /tmp/webapp.tar.gz
rm /tmp/webapp.tar.gz
echo 'Web app files deployed'
"@

$commandId = (aws ssm send-command `
    --instance-ids $EC2_INSTANCE `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=['$($deployCommands -replace "`n", "','")']" `
    --output json | ConvertFrom-Json).Command.CommandId

Start-Sleep -Seconds 5

$result = aws ssm get-command-invocation `
    --command-id $commandId `
    --instance-id $EC2_INSTANCE `
    --output json | ConvertFrom-Json

Write-Host "Deployment Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })

# Step 5: Start web app
if ($result.Status -eq "Success") {
    Write-Host ""
    Write-Host "Step 5: Starting web app..." -ForegroundColor Yellow
    
    $startCommands = "pkill -f 'serve.*5173' || true; cd /home/ssm-user/agrinext/web-app && nohup npx serve dist -s -l 5173 > ../webapp.log 2>&1 & echo 'Web app started'"
    
    $startCommandId = (aws ssm send-command `
        --instance-ids $EC2_INSTANCE `
        --document-name "AWS-RunShellScript" `
        --parameters "commands=['$startCommands']" `
        --output json | ConvertFrom-Json).Command.CommandId
    
    Start-Sleep -Seconds 5
    
    $startResult = aws ssm get-command-invocation `
        --command-id $startCommandId `
        --instance-id $EC2_INSTANCE `
        --output json | ConvertFrom-Json
    
    Write-Host "Start Status: $($startResult.Status)" -ForegroundColor $(if ($startResult.Status -eq "Success") { "Green" } else { "Red" })
    Write-Host $startResult.StandardOutputContent
}

# Step 6: Verify
Write-Host ""
Write-Host "Step 6: Verifying web app..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://3.239.184.220:5173" -TimeoutSec 10 -UseBasicParsing
    Write-Host ""
    Write-Host "SUCCESS! Web app is accessible at: http://3.239.184.220:5173" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Web app not yet accessible. Check logs on EC2:" -ForegroundColor Yellow
    Write-Host "  cat /home/ssm-user/agrinext/webapp.log" -ForegroundColor Cyan
}

# Cleanup
Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item webapp-deploy.tar.gz -ErrorAction SilentlyContinue
aws s3 rm "s3://$S3_BUCKET/$DEPLOY_KEY" 2>$null

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
