# PowerShell script to test backend OTP endpoint

Write-Host "Testing Agrinext Backend OTP Endpoint" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://3.239.184.220:3000/api/v1"
$testMobileNumber = "9876543210"

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://3.239.184.220:3000/health" -Method Get -ErrorAction Stop
    Write-Host "✓ Backend is running" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend health check failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "  - Backend server is not running" -ForegroundColor Yellow
    Write-Host "  - Firewall blocking connection" -ForegroundColor Yellow
    Write-Host "  - Network connectivity issues" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Send OTP
Write-Host "Test 2: Send OTP to $testMobileNumber" -ForegroundColor Yellow
try {
    $body = @{
        mobileNumber = $testMobileNumber
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$backendUrl/auth/send-otp" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "✓ OTP sent successfully" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Check your phone for the OTP SMS" -ForegroundColor Cyan
    Write-Host "  2. Use the OTP to test verify-otp endpoint" -ForegroundColor Cyan

} catch {
    Write-Host "✗ Send OTP failed" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
            Write-Host "Error Details:" -ForegroundColor Red
            Write-Host ($errorBody | ConvertTo-Json -Depth 5) -ForegroundColor Red
        } catch {
            Write-Host "Could not parse error response" -ForegroundColor Red
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Common causes:" -ForegroundColor Yellow
    Write-Host "  - Twilio credentials not configured" -ForegroundColor Yellow
    Write-Host "  - Twilio account issues (balance, verification)" -ForegroundColor Yellow
    Write-Host "  - Database connection issues" -ForegroundColor Yellow
    Write-Host "  - Rate limiting (too many requests)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To diagnose further:" -ForegroundColor Cyan
    Write-Host "  1. SSH into EC2: ssh -i aws-tests/agrinext-key.pem ubuntu@3.239.184.220" -ForegroundColor Cyan
    Write-Host "  2. Check logs: pm2 logs agrinext-backend --lines 50" -ForegroundColor Cyan
    Write-Host "  3. Check .env file: cd /home/ubuntu/agrinext/backend && grep TWILIO .env" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
