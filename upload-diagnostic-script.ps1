# Upload diagnostic script to S3 and run on EC2
# This script helps diagnose the RDS connectivity issue

$ErrorActionPreference = "Stop"

# Set AWS credentials
$env:AWS_ACCESS_KEY_ID = ""
$env:AWS_SECRET_ACCESS_KEY = ""
$env:AWS_DEFAULT_REGION = ""

$S3_BUCKET = ""
$SCRIPT_FILE = ""

Write-Host "📤 Uploading diagnostic script to S3..." -ForegroundColor Cyan

# Upload the script
aws s3 cp $SCRIPT_FILE s3://$S3_BUCKET/scripts/$SCRIPT_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Script uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps - Run these commands on EC2:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# Download the diagnostic script" -ForegroundColor Gray
    Write-Host "aws s3 cp s3://$S3_BUCKET/scripts/$SCRIPT_FILE ~/diagnose-ec2-rds.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "# Make it executable" -ForegroundColor Gray
    Write-Host "chmod +x ~/diagnose-ec2-rds.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "# Run the diagnostic" -ForegroundColor Gray
    Write-Host "~/diagnose-ec2-rds.sh" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}
