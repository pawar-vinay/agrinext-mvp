# Deploy Web App to EC2
# Simple deployment script for Windows

$EC2_HOST = "3.239.184.220"
$EC2_KEY = "Aws Resoucres/agrinext-key.pem"

Write-Host "Building web app..." -ForegroundColor Yellow
Set-Location web-app
npm run build
Set-Location ..

Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path webapp-deploy.tar.gz) {
    Remove-Item webapp-deploy.tar.gz
}
tar -czf webapp-deploy.tar.gz web-app/dist

Write-Host "Uploading to EC2..." -ForegroundColor Yellow
scp -i "$EC2_KEY" webapp-deploy.tar.gz "ssm-user@${EC2_HOST}:/tmp/"

Write-Host "Deploying on EC2..." -ForegroundColor Yellow
ssh -i "$EC2_KEY" "ssm-user@${EC2_HOST}" @"
cd /home/ssm-user/agrinext
mkdir -p web-app
cd web-app
tar -xzf /tmp/webapp-deploy.tar.gz
rm /tmp/webapp-deploy.tar.gz
echo 'Web app extracted successfully'
"@

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Web app files are at: /home/ssm-user/agrinext/web-app/dist" -ForegroundColor Green
Write-Host ""
Write-Host "To start the web app on EC2, run:" -ForegroundColor Cyan
Write-Host "ssh -i '$EC2_KEY' ssm-user@$EC2_HOST" -ForegroundColor Cyan
Write-Host "cd /home/ssm-user/agrinext/web-app" -ForegroundColor Cyan
Write-Host "npx serve dist -s -l 5173" -ForegroundColor Cyan

Remove-Item webapp-deploy.tar.gz
