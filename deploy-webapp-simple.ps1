# Simple Web App Deployment to EC2
# Builds locally and uses SSM to start the web app

$EC2_INSTANCE = "i-004ef74f37ba59da1"

Write-Host "Building web app locally..." -ForegroundColor Yellow
Set-Location web-app
npm run build
Set-Location ..

Write-Host ""
Write-Host "Web app built successfully!" -ForegroundColor Green
Write-Host "Build output is in: web-app/dist" -ForegroundColor Green
Write-Host ""
Write-Host "Starting web app on EC2 using existing backend files..." -ForegroundColor Yellow

# Use SSM to start the web app using the backend's web-app folder
$commandId = (aws ssm send-command `
    --instance-ids $EC2_INSTANCE `
    --document-name "AWS-RunShellScript" `
    --parameters 'commands=["cd /home/ssm-user/agrinext","npx serve web-app/dist -s -l 5173 > webapp.log 2>&1 &","echo Web app started on port 5173"]' `
    --output json | ConvertFrom-Json).Command.CommandId

Write-Host "Command ID: $commandId" -ForegroundColor Cyan
Write-Host "Waiting for command to execute..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$result = aws ssm get-command-invocation `
    --command-id $commandId `
    --instance-id $EC2_INSTANCE `
    --output json | ConvertFrom-Json

Write-Host ""
Write-Host "Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host "Output:" -ForegroundColor Cyan
Write-Host $result.StandardOutputContent

if ($result.StandardErrorContent) {
    Write-Host ""
    Write-Host "Errors:" -ForegroundColor Red
    Write-Host $result.StandardErrorContent
}

Write-Host ""
Write-Host "Testing web app accessibility..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://3.239.184.220:5173" -TimeoutSec 10 -UseBasicParsing
    Write-Host "Web app is accessible at: http://3.239.184.220:5173" -ForegroundColor Green
} catch {
    Write-Host "Web app not yet accessible. It may take a moment to start." -ForegroundColor Yellow
    Write-Host "Try accessing: http://3.239.184.220:5173" -ForegroundColor Cyan
}
