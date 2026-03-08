# AWS Environment Variables Setup Script
# Run this script to set your AWS credentials as environment variables

Write-Host "AWS Credentials Setup" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Prompt for credentials
$accessKeyId = Read-Host "Enter your AWS Access Key ID"
$secretAccessKey = Read-Host "Enter your AWS Secret Access Key" -AsSecureString
$region = Read-Host "Enter your AWS Region (default: us-east-1)"

# Set default region if not provided
if ([string]::IsNullOrWhiteSpace($region)) {
    $region = "us-east-1"
}

# Convert SecureString to plain text for environment variable
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretAccessKey)
$secretAccessKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Yellow

# Set user environment variables (permanent)
[System.Environment]::SetEnvironmentVariable("AWS_ACCESS_KEY_ID", $accessKeyId, "User")
[System.Environment]::SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", $secretAccessKeyPlain, "User")
[System.Environment]::SetEnvironmentVariable("AWS_REGION", $region, "User")

# Also set for current session
$env:AWS_ACCESS_KEY_ID = $accessKeyId
$env:AWS_SECRET_ACCESS_KEY = $secretAccessKeyPlain
$env:AWS_REGION = $region

Write-Host ""
Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Variables set:" -ForegroundColor Cyan
Write-Host "  AWS_ACCESS_KEY_ID: $accessKeyId"
Write-Host "  AWS_SECRET_ACCESS_KEY: ********** (hidden)"
Write-Host "  AWS_REGION: $region"
Write-Host ""
Write-Host "Note: You may need to restart Kiro for changes to take effect." -ForegroundColor Yellow
Write-Host ""

# Clean up
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
