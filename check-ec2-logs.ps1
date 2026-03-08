# PowerShell script to check EC2 logs and Twilio config

Write-Host "Connecting to EC2 and checking backend logs..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$keyPath = "aws-tests/agrinext-key.pem"
$ec2Host = "ubuntu@3.239.184.220"

# Check if key file exists
if (-not (Test-Path $keyPath)) {
    Write-Host "ERROR: Key file not found at $keyPath" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "Please run this script from the project root (J:\Aws_hackathon)" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Checking PM2 Status..." -ForegroundColor Yellow
ssh -i $keyPath $ec2Host "pm2 status"
Write-Host ""

Write-Host "2. Checking Recent Error Logs..." -ForegroundColor Yellow
ssh -i $keyPath $ec2Host "pm2 logs agrinext-backend --err --lines 30 --nostream"
Write-Host ""

Write-Host "3. Checking Twilio Configuration (masked)..." -ForegroundColor Yellow
ssh -i $keyPath $ec2Host "cd agrinext/backend && cat .env | grep TWILIO | sed 's/=\(.\{4\}\).*/=\1***/'"
Write-Host ""

Write-Host "4. Testing OTP Endpoint Locally on EC2..." -ForegroundColor Yellow
ssh -i $keyPath $ec2Host "curl -X POST http://localhost:3000/api/v1/auth/send-otp -H 'Content-Type: application/json' -d '{\"mobileNumber\":\"9876543210\"}' 2>&1"
Write-Host ""

Write-Host "5. Checking if .env file exists..." -ForegroundColor Yellow
ssh -i $keyPath $ec2Host "ls -la agrinext/backend/.env 2>&1"
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Diagnostic Complete" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Review the error logs above" -ForegroundColor White
Write-Host "2. Check if Twilio credentials are set" -ForegroundColor White
Write-Host "3. If credentials are missing, add them to .env file" -ForegroundColor White
Write-Host "4. Restart backend: ssh -i $keyPath $ec2Host 'pm2 restart agrinext-backend'" -ForegroundColor White
