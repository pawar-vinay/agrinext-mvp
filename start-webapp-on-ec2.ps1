# Start Web App on EC2
# Uses SSM to install serve and start the web app

$EC2_INSTANCE = "i-004ef74f37ba59da1"

Write-Host "Installing serve globally on EC2..." -ForegroundColor Yellow

$installCommandId = (aws ssm send-command `
    --instance-ids $EC2_INSTANCE `
    --document-name "AWS-RunShellScript" `
    --parameters 'commands=["export PATH=/home/ssm-user/.nvm/versions/node/v18.20.8/bin:$PATH","npm install -g serve","which serve"]' `
    --output json | ConvertFrom-Json).Command.CommandId

Start-Sleep -Seconds 10

$installResult = aws ssm get-command-invocation `
    --command-id $installCommandId `
    --instance-id $EC2_INSTANCE `
    --output json | ConvertFrom-Json

Write-Host "Install Status: $($installResult.Status)" -ForegroundColor $(if ($installResult.Status -eq "Success") { "Green" } else { "Red" })
Write-Host $installResult.StandardOutputContent

if ($installResult.StandardErrorContent) {
    Write-Host "Errors:" -ForegroundColor Red
    Write-Host $installResult.StandardErrorContent
}

Write-Host ""
Write-Host "Starting web app on port 5173..." -ForegroundColor Yellow

$startCommandId = (aws ssm send-command `
    --instance-ids $EC2_INSTANCE `
    --document-name "AWS-RunShellScript" `
    --parameters 'commands=["export PATH=/home/ssm-user/.nvm/versions/node/v18.20.8/bin:$PATH","cd /home/ssm-user/agrinext","pkill -f serve || true","nohup serve backend/src -s -l 5173 > webapp.log 2>&1 &","sleep 2","ps aux | grep serve"]' `
    --output json | ConvertFrom-Json).Command.CommandId

Start-Sleep -Seconds 5

$startResult = aws ssm get-command-invocation `
    --command-id $startCommandId `
    --instance-id $EC2_INSTANCE `
    --output json | ConvertFrom-Json

Write-Host "Start Status: $($startResult.Status)" -ForegroundColor $(if ($startResult.Status -eq "Success") { "Green" } else { "Red" })
Write-Host $startResult.StandardOutputContent

Write-Host ""
Write-Host "Testing accessibility..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://3.239.184.220:5173" -TimeoutSec 10 -UseBasicParsing
    Write-Host ""
    Write-Host "SUCCESS! Web app is accessible at: http://3.239.184.220:5173" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Web app not accessible yet. Error: $($_.Exception.Message)" -ForegroundColor Yellow
}
