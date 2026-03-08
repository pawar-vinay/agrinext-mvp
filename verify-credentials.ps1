# Verify AWS Credentials
Write-Host "`nAWS Credentials Verification" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

Write-Host "`nChecking environment variables..." -ForegroundColor Yellow

if ($env:AWS_ACCESS_KEY_ID) {
    Write-Host "✓ AWS_ACCESS_KEY_ID is set" -ForegroundColor Green
    Write-Host "  Value: $($env:AWS_ACCESS_KEY_ID.Substring(0, [Math]::Min(8, $env:AWS_ACCESS_KEY_ID.Length)))..." -ForegroundColor Gray
    Write-Host "  Length: $($env:AWS_ACCESS_KEY_ID.Length) characters" -ForegroundColor Gray
} else {
    Write-Host "✗ AWS_ACCESS_KEY_ID is NOT set" -ForegroundColor Red
}

if ($env:AWS_SECRET_ACCESS_KEY) {
    Write-Host "✓ AWS_SECRET_ACCESS_KEY is set" -ForegroundColor Green
    Write-Host "  Length: $($env:AWS_SECRET_ACCESS_KEY.Length) characters" -ForegroundColor Gray
    
    # Check for common issues
    if ($env:AWS_SECRET_ACCESS_KEY.Contains(" ")) {
        Write-Host "  ⚠ WARNING: Secret key contains spaces!" -ForegroundColor Yellow
    }
    if ($env:AWS_SECRET_ACCESS_KEY.StartsWith(" ") -or $env:AWS_SECRET_ACCESS_KEY.EndsWith(" ")) {
        Write-Host "  ⚠ WARNING: Secret key has leading/trailing spaces!" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ AWS_SECRET_ACCESS_KEY is NOT set" -ForegroundColor Red
}

if ($env:AWS_REGION) {
    Write-Host "✓ AWS_REGION is set: $env:AWS_REGION" -ForegroundColor Green
} else {
    Write-Host "✗ AWS_REGION is NOT set (will default to us-east-1)" -ForegroundColor Yellow
}

Write-Host "`nTo set credentials, run:" -ForegroundColor Cyan
Write-Host '  $env:AWS_ACCESS_KEY_ID = "your-key"' -ForegroundColor Gray
Write-Host '  $env:AWS_SECRET_ACCESS_KEY = "your-secret"' -ForegroundColor Gray
Write-Host '  $env:AWS_REGION = "us-east-1"' -ForegroundColor Gray
