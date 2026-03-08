# Simple AWS Deployment Guide (No CLI Required)

## Prerequisites

1. AWS Account with credentials (Access Key ID and Secret Access Key)
2. Kiro with AWS MCP tools configured (already done ✓)

## Step 1: Set Up AWS Credentials

Run this command in PowerShell:

```powershell
./setup-aws-env.ps1
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key  
- AWS Region (press Enter for default: us-east-1)

## Step 2: Restart Kiro

After setting credentials, restart Kiro so the MCP tools can access them.

## Step 3: Deploy Resources

Once Kiro restarts, tell me "ready to deploy" and I will:

### Phase 1: Create S3 Bucket
- Create bucket for crop disease images
- Enable versioning
- Configure public access settings

### Phase 2: Create RDS Database
- Launch PostgreSQL database (t3.micro - Free Tier)
- Configure security groups
- Set up database credentials

### Phase 3: Create EC2 Instance
- Launch t2.micro instance (Free Tier)
- Install Node.js and dependencies
- Configure security groups for HTTP/SSH access

### Phase 4: Initialize Application
- Upload backend code to EC2
- Set up environment variables
- Initialize database schema
- Start the server

## Estimated Time

- S3 Bucket: 1-2 minutes
- RDS Database: 10-15 minutes
- EC2 Instance: 5-10 minutes
- Application Setup: 5 minutes

**Total: ~25-30 minutes**

## Cost

All resources use AWS Free Tier:
- **Total Cost: $0** (within Free Tier limits)

## What You'll Get

After deployment:
- ✅ S3 bucket for image storage
- ✅ PostgreSQL database with schema
- ✅ EC2 instance running Node.js backend
- ✅ Health check endpoint: http://[EC2-IP]:3000/health
- ✅ API endpoint: http://[EC2-IP]:3000/api/v1

## Next Steps After Deployment

1. I'll provide you with:
   - S3 bucket name
   - Database endpoint and credentials
   - EC2 instance public IP
   - SSH command to connect

2. You can then:
   - Test the health endpoint
   - Access the API
   - Upload crop disease images to S3
   - Connect mobile app to the backend

## Ready?

Once you've completed Steps 1 & 2 above, just say "ready to deploy" and I'll start the deployment process!
