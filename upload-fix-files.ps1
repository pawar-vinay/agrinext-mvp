# Upload fix files to EC2 via S3
# Run this script in PowerShell

$BUCKET_NAME = "agrinext-images-1772367775698"
$REGION = "us-east-1"

Write-Host "Uploading fix files to S3..." -ForegroundColor Cyan

# Check if AWS CLI is available
try {
    $awsVersion = aws --version 2>&1
    Write-Host "AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Upload ecosystem config
Write-Host "`nUploading ecosystem.config.js..." -ForegroundColor Yellow
aws s3 cp ecosystem.config.js s3://$BUCKET_NAME/deployment/ --region $REGION
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Uploaded ecosystem.config.js" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to upload ecosystem.config.js" -ForegroundColor Red
    exit 1
}

# Upload fix script
Write-Host "Uploading fix-env-and-restart.sh..." -ForegroundColor Yellow
aws s3 cp fix-env-and-restart.sh s3://$BUCKET_NAME/deployment/ --region $REGION
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Uploaded fix-env-and-restart.sh" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to upload fix-env-and-restart.sh" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Files uploaded successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNow connect to EC2 and run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Download the files" -ForegroundColor Gray
Write-Host "cd ~/agrinext-phase2/backend"
Write-Host "aws s3 cp s3://$BUCKET_NAME/deployment/ecosystem.config.js . --region $REGION"
Write-Host "aws s3 cp s3://$BUCKET_NAME/deployment/fix-env-and-restart.sh . --region $REGION"
Write-Host ""
Write-Host "# Make script executable and run it" -ForegroundColor Gray
Write-Host "chmod +x fix-env-and-restart.sh"
Write-Host "./fix-env-and-restart.sh"
Write-Host ""
