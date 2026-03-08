# Agrinext AWS Deployment Guide

## Overview

This guide walks you through deploying the Agrinext MVP to AWS using AWS CDK (Cloud Development Kit).

## Prerequisites

1. **AWS Account** with credentials configured
2. **Node.js 18+** installed
3. **AWS CLI** installed and configured
4. **AWS CDK** installed globally: `npm install -g aws-cdk`

## Architecture

The deployment creates three stacks:

1. **DatabaseStack** - PostgreSQL RDS instance (t3.micro, Free Tier)
2. **StorageStack** - S3 bucket for crop disease images
3. **BackendStack** - EC2 instance (t2.micro, Free Tier) running Node.js

## Step-by-Step Deployment

### 1. Configure AWS Credentials

Ensure your AWS credentials are set:

```bash
aws configure
```

Or use environment variables (already set from previous steps):
```bash
$env:AWS_ACCESS_KEY_ID="your_access_key"
$env:AWS_SECRET_ACCESS_KEY="your_secret_key"
$env:AWS_REGION="us-east-1"
```

### 2. Create EC2 Key Pair

Create a key pair for SSH access to the EC2 instance:

```bash
aws ec2 create-key-pair --key-name agrinext-key --query 'KeyMaterial' --output text > agrinext-key.pem
```

On Windows PowerShell:
```powershell
aws ec2 create-key-pair --key-name agrinext-key --query 'KeyMaterial' --output text | Out-File -Encoding ascii agrinext-key.pem
```

Set permissions (Linux/Mac):
```bash
chmod 400 agrinext-key.pem
```

### 3. Install CDK Dependencies

```bash
cd infrastructure/cdk
npm install
```

### 4. Bootstrap CDK (First Time Only)

```bash
cdk bootstrap aws://ACCOUNT-ID/us-east-1
```

Replace `ACCOUNT-ID` with your AWS account ID, or use:
```bash
cdk bootstrap
```

### 5. Review Infrastructure

Preview what will be created:

```bash
npm run synth
```

Or see the differences:
```bash
npm run diff
```

### 6. Deploy All Stacks

Deploy all three stacks:

```bash
npm run deploy
```

This will:
- Create VPC and networking
- Launch RDS PostgreSQL database
- Create S3 bucket for images
- Launch EC2 instance with Node.js

**Deployment time:** ~15-20 minutes

### 7. Get Deployment Outputs

After deployment, CDK will output important values:

```
Outputs:
AgrinextDatabaseStack.DatabaseEndpoint = xxx.rds.amazonaws.com
AgrinextDatabaseStack.DatabasePort = 5432
AgrinextDatabaseStack.DatabaseSecretArn = arn:aws:secretsmanager:...
AgrinextStorageStack.BucketName = agrinext-images-123456789
AgrinextBackendStack.InstancePublicIP = 54.123.45.67
AgrinextBackendStack.SSHCommand = ssh -i agrinext-key.pem ec2-user@...
```

**Save these values!** You'll need them for configuration.

## Post-Deployment Setup

### 1. Connect to EC2 Instance

```bash
ssh -i agrinext-key.pem ec2-user@<INSTANCE_PUBLIC_IP>
```

### 2. Clone Your Repository

```bash
cd /home/ec2-user/agrinext
git clone <your-repo-url> .
```

Or upload files using SCP:
```bash
scp -i agrinext-key.pem -r backend/* ec2-user@<INSTANCE_PUBLIC_IP>:/home/ec2-user/agrinext/
```

### 3. Get Database Credentials

Retrieve database password from AWS Secrets Manager:

```bash
aws secretsmanager get-secret-value --secret-id <DATABASE_SECRET_ARN> --query SecretString --output text
```

### 4. Configure Environment Variables

On the EC2 instance, create `.env` file:

```bash
cd /home/ec2-user/agrinext
nano .env
```

Add:
```env
# Database
DB_HOST=<DATABASE_ENDPOINT>
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=<FROM_SECRETS_MANAGER>

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=<BUCKET_NAME>

# Server
PORT=3000
NODE_ENV=production
```

### 5. Set Up Database Schema

```bash
# Install PostgreSQL client
sudo yum install -y postgresql

# Run schema
psql -h <DATABASE_ENDPOINT> -U postgres -d agrinext_mvp -f database/schema.sql

# Run seed data
psql -h <DATABASE_ENDPOINT> -U postgres -d agrinext_mvp -f database/seed-data.sql
```

### 6. Install Dependencies and Start Server

```bash
cd /home/ec2-user/agrinext
npm install
pm2 start src/server.js --name agrinext-api
pm2 save
pm2 startup
```

### 7. Test the Deployment

```bash
curl http://<INSTANCE_PUBLIC_IP>:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-01T...",
  "uptime": 123.45,
  "environment": "production"
}
```

## Monitoring and Logs

### View Application Logs

```bash
pm2 logs agrinext-api
```

### Monitor Application

```bash
pm2 monit
```

### Restart Application

```bash
pm2 restart agrinext-api
```

## Cost Optimization

All resources are Free Tier eligible:

- **EC2 t2.micro:** 750 hours/month free
- **RDS t3.micro:** 750 hours/month free
- **S3:** 5GB storage free
- **Data Transfer:** 15GB/month free

**Estimated cost after Free Tier:** $10-15/month

## Cleanup

To delete all resources:

```bash
cd infrastructure/cdk
npm run destroy
```

**Warning:** This will delete:
- EC2 instance
- RDS database (all data will be lost)
- S3 bucket (all images will be deleted)

## Troubleshooting

### Issue: CDK Bootstrap Failed

**Solution:** Ensure AWS credentials are configured correctly:
```bash
aws sts get-caller-identity
```

### Issue: EC2 Instance Not Accessible

**Solution:** Check security group allows port 3000:
```bash
aws ec2 describe-security-groups --group-ids <SG_ID>
```

### Issue: Database Connection Failed

**Solution:** 
1. Check security group allows port 5432
2. Verify database endpoint and credentials
3. Ensure EC2 instance can reach RDS (same VPC)

### Issue: S3 Access Denied

**Solution:** Verify EC2 instance role has S3 permissions:
```bash
aws iam get-role --role-name <ROLE_NAME>
```

## Next Steps

1. ✅ Deploy infrastructure
2. ✅ Set up database
3. ✅ Start backend server
4. 🔨 Configure domain name (Route 53)
5. 🔨 Set up SSL certificate (ACM)
6. 🔨 Configure load balancer (ALB)
7. 🔨 Set up CI/CD pipeline (CodePipeline)

## Support

For issues or questions:
- Check AWS CloudWatch logs
- Review CDK deployment logs
- Contact: support@agrinext.com
