# Quick AWS Credentials Setup for MCP
# This script helps set credentials that MCP tools can access

Write-Host "`nAWS Credentials Setup for Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if credentials are already in environment
if ($env:AWS_ACCESS_KEY_ID -and $env:AWS_SECRET_ACCESS_KEY) {
    Write-Host "`nCredentials found in current session:" -ForegroundColor Green
    Write-Host "  Access Key: $($env:AWS_ACCESS_KEY_ID.Substring(0,8))..." -ForegroundColor Gray
    Write-Host "  Region: $($env:AWS_REGION)" -ForegroundColor Gray
    
    $confirm = Read-Host "`nDo you want to use these credentials? (yes/no)"
    if ($confirm -eq "yes") {
        Write-Host "`nGreat! Your credentials are set." -ForegroundColor Green
        Write-Host "You can now proceed with deployment." -ForegroundColor Green
        exit 0
    }
}

Write-Host "`nPlease enter your AWS credentials:" -ForegroundColor Yellow
$accessKey = Read-Host "AWS Access Key ID"
$secretKey = Read-Host "AWS Secret Access Key"
$region = Read-Host "AWS Region (default: us-east-1)"

if ([string]::IsNullOrWhiteSpace($region)) {
    $region = "us-east-1"
}

# Set for current session
$env:AWS_ACCESS_KEY_ID = $accessKey
$env:AWS_SECRET_ACCESS_KEY = $secretKey
$env:AWS_REGION = $region

# Set as user environment variables (permanent)
[System.Environment]::SetEnvironmentVariable("AWS_ACCESS_KEY_ID", $accessKey, "User")
[System.Environment]::SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", $secretKey, "User")
[System.Environment]::SetEnvironmentVariable("AWS_REGION", $region, "User")

Write-Host "`nCredentials set successfully!" -ForegroundColor Green
Write-Host "  Access Key: $($accessKey.Substring(0,8))..." -ForegroundColor Gray
Write-Host "  Region: $region" -ForegroundColor Gray
Write-Host "`nNote: You may need to restart Kiro for MCP tools to pick up the credentials." -ForegroundColor Yellow
