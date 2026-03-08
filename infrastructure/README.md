# Agrinext Infrastructure

AWS infrastructure for Agrinext MVP using AWS CDK.

## Quick Start

### Option 1: Automated Deployment (Recommended)

Run the deployment script from the project root:

```powershell
.\deploy.ps1
```

This script will:
- Check prerequisites (AWS CLI, Node.js, CDK)
- Verify AWS credentials
- Create EC2 key pair
- Install dependencies
- Bootstrap CDK
- Deploy all stacks

### Option 2: Manual Deployment

1. **Install dependencies:**
   ```bash
   cd infrastructure/cdk
   npm install
   ```

2. **Create EC2 key pair:**
   ```bash
   aws ec2 create-key-pair --key-name agrinext-key --query 'KeyMaterial' --output text > agrinext-key.pem
   ```

3. **Bootstrap CDK:**
   ```bash
   cdk bootstrap
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## Infrastructure Components

### 1. Database Stack
- **Resource:** RDS PostgreSQL 14
- **Instance:** t3.micro (Free Tier)
- **Storage:** 20GB
- **Network:** Public subnet with security group
- **Credentials:** Stored in AWS Secrets Manager

### 2. Storage Stack
- **Resource:** S3 Bucket
- **Purpose:** Crop disease image storage
- **Features:**
  - Server-side encryption
  - CORS enabled
  - Lifecycle rules (90-day expiration)
  - Transition to IA after 30 days

### 3. Backend Stack
- **Resource:** EC2 Instance
- **Instance:** t2.micro (Free Tier)
- **OS:** Amazon Linux 2
- **Software:** Node.js 18, PM2
- **Network:** Public subnet with security group
- **Ports:** 22 (SSH), 80 (HTTP), 3000 (Node.js)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                         VPC                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Public Subnet (AZ-1)                 │  │
│  │  ┌──────────────┐         ┌──────────────┐      │  │
│  │  │  EC2 Instance│         │ RDS PostgreSQL│      │  │
│  │  │  (t2.micro)  │────────▶│  (t3.micro)   │      │  │
│  │  │  Node.js API │         │               │      │  │
│  │  └──────┬───────┘         └───────────────┘      │  │
│  │         │                                          │  │
│  │         │                                          │  │
│  │         ▼                                          │  │
│  │  ┌──────────────┐                                 │  │
│  │  │  S3 Bucket   │                                 │  │
│  │  │  (Images)    │                                 │  │
│  │  └──────────────┘                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## CDK Commands

- `npm run synth` - Synthesize CloudFormation templates
- `npm run deploy` - Deploy all stacks
- `npm run destroy` - Delete all stacks
- `npm run diff` - Compare deployed stack with current state

## Cost Estimate

### Free Tier (First 12 months)
- EC2 t2.micro: 750 hours/month FREE
- RDS t3.micro: 750 hours/month FREE
- S3: 5GB storage FREE
- Data Transfer: 15GB/month FREE

### After Free Tier
- EC2 t2.micro: ~$8/month
- RDS t3.micro: ~$12/month
- S3: ~$0.50/month (for 20GB)
- **Total:** ~$20-25/month

## Security

### Network Security
- VPC with public subnets
- Security groups restrict access:
  - EC2: Ports 22, 80, 3000
  - RDS: Port 5432 (from EC2 only in production)

### Data Security
- Database credentials in AWS Secrets Manager
- S3 bucket encryption enabled
- IAM roles with least privilege

### Recommendations for Production
1. Use private subnets for RDS
2. Add NAT Gateway for outbound traffic
3. Implement Application Load Balancer
4. Enable CloudWatch monitoring
5. Set up automated backups
6. Use AWS WAF for API protection

## Monitoring

### CloudWatch Metrics
- EC2 CPU utilization
- RDS connections
- S3 bucket size
- Network traffic

### Logs
- Application logs: PM2 on EC2
- Database logs: CloudWatch Logs
- Access logs: S3 bucket logs

## Troubleshooting

### Deployment Issues

**Issue:** CDK bootstrap fails
```bash
# Solution: Check AWS credentials
aws sts get-caller-identity
```

**Issue:** Stack creation fails
```bash
# Solution: Check CloudFormation events
aws cloudformation describe-stack-events --stack-name AgrinextDatabaseStack
```

### Runtime Issues

**Issue:** Cannot connect to EC2
```bash
# Solution: Check security group
aws ec2 describe-security-groups --group-ids <SG_ID>
```

**Issue:** Database connection timeout
```bash
# Solution: Verify RDS endpoint and security group
aws rds describe-db-instances --db-instance-identifier <DB_ID>
```

## Cleanup

To delete all resources:

```bash
cd infrastructure/cdk
npm run destroy
```

**Warning:** This will permanently delete:
- All data in the database
- All images in S3
- The EC2 instance

## Support

For detailed deployment instructions, see [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

For issues:
1. Check CloudWatch logs
2. Review CDK deployment logs
3. Consult AWS documentation
