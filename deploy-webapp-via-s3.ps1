# Deploy Web App to EC2 via S3
# Uses S3 as intermediate storage to avoid SSH issues

$EC2_INSTANCE = "i-004ef74f37ba59da1"
$S3_BUCKET = "agrinext-images-1772367775698"
$DEPLOY_KEY = "deployments/webapp-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz"

Write-Host "Building web app..." -ForegroundColor Yellow
Set-Location web-app
npm run build
Set-Location ..

Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path webapp-deploy.tar.gz) {
    Remove-Item webapp-deploy.tar.gz
}
tar -czf webapp-deploy.tar.gz web-app/dist

Write-Host "Uploading to S3..." -ForegroundColor Yellow
aws s3 cp webapp-deploy.tar.gz "s3://$S3_BUCKET/$DEPLOY_KEY"

Write-Host "Deploying on EC2 via SSM..." -ForegroundColor Yellow
$commandId = (aws ssm send-command `
    --instance-ids $EC2_INSTANCE `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=[
        'cd /home/ssm-user/agrinext',
        'mkdir -p web-app',
        'aws s3 cp s3://$S3_BUCKET/$DEPLOY_KEY /tmp/webapp-deploy.tar.gz',
        'cd web-app',
        'tar -xzf /tmp/webapp-deploy.tar.gz',
        'rm /tmp/webapp-deploy.tar.gz',
        'echo Web app deployed successfully'
    ]" `
    --output json | ConvertFrom-Json).Command.CommandId

Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$result = aws ssm get-command-invocation `
    --command-id $commandId `
    --instance-id $EC2_INSTANCE `
    --output json | ConvertFrom-Json

Write-Host ""
Write-Host "Deployment Status: $($result.Status)" -ForegroundColor $(if ($result.Status -eq "Success") { "Green" } else { "Red" })
Write-Host "Output:" -ForegroundColor Cyan
Write-Host $result.StandardOutputContent

if ($result.StandardErrorContent) {
    Write-Host "Errors:" -ForegroundColor Red
    Write-Host $result.StandardErrorContent
}

# Cleanup
Remove-Item webapp-deploy.tar.gz
aws s3 rm "s3://$S3_BUCKET/$DEPLOY_KEY"

Write-Host ""
Write-Host "Web app deployed to: /home/ssm-user/agrinext/web-app/dist" -ForegroundColor Green
Write-Host ""
Write-Host "To start the web app, run this command on EC2:" -ForegroundColor Cyan
Write-Host "npx serve /home/ssm-user/agrinext/web-app/dist -s -l 5173" -ForegroundColor Yellow
