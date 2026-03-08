# Agrinext AWS Deployment Script
# Automates the deployment process

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Agrinext AWS Deployment Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if AWS CLI is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if CDK is installed
if (-not (Get-Command cdk -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: AWS CDK not found. Installing..." -ForegroundColor Yellow
    npm install -g aws-cdk
}

Write-Host "✓ Prerequisites check passed`n" -ForegroundColor Green

# Check AWS credentials
Write-Host "Verifying AWS credentials..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: AWS credentials not configured." -ForegroundColor Red
    Write-Host "Please run: aws configure" -ForegroundColor Yellow
    exit 1
}

$accountInfo = $identity | ConvertFrom-Json
Write-Host "✓ Connected to AWS Account: $($accountInfo.Account)" -ForegroundColor Green
Write-Host "  User: $($accountInfo.Arn)`n" -ForegroundColor Gray

# Create EC2 key pair if it doesn't exist
Write-Host "Checking EC2 key pair..." -ForegroundColor Yellow
$keyExists = aws ec2 describe-key-pairs --key-names agrinext-key 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating EC2 key pair 'agrinext-key'..." -ForegroundColor Yellow
    aws ec2 create-key-pair --key-name agrinext-key --query 'KeyMaterial' --output text | Out-File -Encoding ascii agrinext-key.pem
    Write-Host "✓ Key pair created and saved to agrinext-key.pem" -ForegroundColor Green
    Write-Host "  IMPORTANT: Keep this file safe!" -ForegroundColor Yellow
} else {
    Write-Host "✓ Key pair 'agrinext-key' already exists`n" -ForegroundColor Green
}

# Install CDK dependencies
Write-Host "Installing CDK dependencies..." -ForegroundColor Yellow
Set-Location infrastructure/cdk
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install CDK dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ CDK dependencies installed`n" -ForegroundColor Green

# Bootstrap CDK (if needed)
Write-Host "Checking CDK bootstrap..." -ForegroundColor Yellow
$bootstrapCheck = cdk bootstrap 2>&1
Write-Host "✓ CDK bootstrap complete`n" -ForegroundColor Green

# Synthesize CloudFormation templates
Write-Host "Synthesizing CloudFormation templates..." -ForegroundColor Yellow
npm run synth
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to synthesize templates" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Templates synthesized`n" -ForegroundColor Green

# Ask for confirmation
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Ready to Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nThis will create the following resources:" -ForegroundColor Yellow
Write-Host "  • VPC with public subnets"
Write-Host "  • RDS PostgreSQL database (t3.micro)"
Write-Host "  • S3 bucket for images"
Write-Host "  • EC2 instance (t2.micro) with Node.js"
Write-Host "`nEstimated deployment time: 15-20 minutes" -ForegroundColor Gray
Write-Host "Estimated cost: FREE (within Free Tier limits)`n" -ForegroundColor Green

$confirmation = Read-Host "Do you want to proceed with deployment? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "`nDeployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Deploy all stacks
Write-Host "`nStarting deployment..." -ForegroundColor Yellow
Write-Host "This may take 15-20 minutes. Please wait...`n" -ForegroundColor Gray

npm run deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Deployment failed" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    exit 1
}

# Success message
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Deployment Successful!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Note the output values above (Database endpoint, S3 bucket, EC2 IP)"
Write-Host "2. Connect to EC2: ssh -i agrinext-key.pem ec2-user@<INSTANCE_IP>"
Write-Host "3. Follow the post-deployment steps in infrastructure/DEPLOYMENT-GUIDE.md"
Write-Host "`nFor detailed instructions, see: infrastructure/DEPLOYMENT-GUIDE.md`n" -ForegroundColor Cyan

Set-Location ../..
