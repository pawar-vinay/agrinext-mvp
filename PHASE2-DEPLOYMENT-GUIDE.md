# Phase 2 Deployment Guide

**Quick Start**: Upgrade Phase 1 infrastructure to Phase 2 in 2-3 hours

---

## Overview

This guide walks you through deploying Phase 2 to your existing AWS infrastructure. The deployment:
- ✅ Reuses existing EC2, RDS, and S3 resources
- ✅ Maintains $0/month AWS costs (Free Tier)
- ✅ Takes 2-3 hours total
- ✅ Has 5-10 minutes downtime
- ✅ Includes automatic rollback capability

---

## Prerequisites

### 1. Existing Infrastructure (Phase 1)
- ✅ EC2 instance running (i-004ef74f37ba59da1)
- ✅ RDS PostgreSQL database (agrinext-db-1772367775698)
- ✅ S3 bucket (agrinext-images-1772367775698)
- ✅ Phase 1 backend operational

### 2. External Service Accounts

You need API keys for these services:

| Service | Purpose | Sign Up URL | Cost |
|---------|---------|-------------|------|
| **Twilio** | OTP SMS | https://www.twilio.com/try-twilio | $0.0075/SMS |
| **OpenAI** | Farming advisory | https://platform.openai.com/signup | $0.002/1K tokens |
| **Hugging Face** | Disease detection | https://huggingface.co/join | Free tier available |
| **Google Cloud** | Translation | https://console.cloud.google.com | $20/1M chars |

**Estimated Setup Time**: 30-60 minutes  
**Estimated Monthly Cost**: $10-20

### 3. Local Development Setup

Ensure you have:
- Node.js 18+ installed
- AWS CLI configured
- Git (optional, for version control)

---

## Deployment Steps

### Step 1: Prepare External Services (30-60 minutes)

#### 1.1 Twilio Setup
1. Sign up at https://www.twilio.com/try-twilio
2. Verify your email and phone number
3. Get a Twilio phone number (free trial includes one)
4. Copy these values:
   - Account SID
   - Auth Token
   - Phone Number

#### 1.2 OpenAI Setup
1. Sign up at https://platform.openai.com/signup
2. Add payment method (required, but charges are minimal)
3. Create API key at https://platform.openai.com/api-keys
4. Copy the API key (starts with `sk-`)

#### 1.3 Hugging Face Setup
1. Sign up at https://huggingface.co/join
2. Go to Settings → Access Tokens
3. Create new token with "Read" access
4. Copy the token (starts with `hf_`)

#### 1.4 Google Cloud Setup
1. Sign up at https://console.cloud.google.com
2. Create new project (e.g., "agrinext-translation")
3. Enable Cloud Translation API
4. Create service account and download JSON key
5. Copy the project ID

---

### Step 2: Upload Phase 2 Code to S3 (5 minutes)

From your local machine:

```bash
# Navigate to project directory
cd /path/to/agrinext

# Upload backend code to S3
aws s3 sync ./backend s3://agrinext-images-1772367775698/phase2/backend/ \
    --region us-east-1 \
    --exclude "node_modules/*" \
    --exclude "dist/*" \
    --exclude ".env"

# Upload database migration
aws s3 cp ./database/migrations/002_phase2_schema_upgrade.sql \
    s3://agrinext-images-1772367775698/phase2/database/migrations/ \
    --region us-east-1

# Upload deployment script
aws s3 cp ./deploy/deploy-phase2.sh \
    s3://agrinext-images-1772367775698/phase2/deploy/ \
    --region us-east-1
```

**Verify upload:**
```bash
aws s3 ls s3://agrinext-images-1772367775698/phase2/ --recursive
```

---

### Step 3: Connect to EC2 Instance (2 minutes)

#### Option A: AWS Systems Manager (Recommended)
1. Go to https://console.aws.amazon.com/ec2
2. Select instance `i-004ef74f37ba59da1`
3. Click "Connect" → "Session Manager" → "Connect"

#### Option B: SSH (if you have key pair)
```bash
ssh -i agrinext-key.pem ec2-user@3.239.184.220
```

---

### Step 4: Update IAM Role for S3 Write Access (5 minutes)

Phase 2 needs to upload images to S3, so we need write permissions.

1. Go to https://console.aws.amazon.com/iam/home#/roles
2. Search for "AgrinextEC2Role"
3. Click on the role
4. Click "Add permissions" → "Attach policies"
5. Search for "AmazonS3FullAccess"
6. Select it and click "Add permissions"

**Alternative (More Secure)**: Create custom policy with limited access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::agrinext-images-1772367775698/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::agrinext-images-1772367775698"
    }
  ]
}
```

---

### Step 5: Run Deployment Script (60-90 minutes)

On the EC2 instance:

```bash
# Download deployment script
cd ~
aws s3 cp s3://agrinext-images-1772367775698/phase2/deploy/deploy-phase2.sh . --region us-east-1

# Make executable
chmod +x deploy-phase2.sh

# Run deployment
./deploy-phase2.sh
```

The script will:
1. ✅ Verify prerequisites
2. ✅ Backup Phase 1 (code + database)
3. ✅ Download Phase 2 code
4. ✅ Install dependencies
5. ✅ Build TypeScript code
6. ⚠️ **PAUSE** - You need to update .env file
7. ✅ Run database migration
8. ✅ Stop Phase 1 backend
9. ✅ Start Phase 2 backend
10. ✅ Verify deployment

---

### Step 6: Configure Environment Variables (10 minutes)

When the script pauses, update the .env file:

```bash
# Edit .env file
cd ~/agrinext-phase2/backend
nano .env
```

Update these values with your API keys:

```env
# Twilio (from Step 1.1)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI (from Step 1.2)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500

# Hugging Face (from Step 1.3)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=your-model-name

# Google Cloud (from Step 1.4)
GOOGLE_PROJECT_ID=agrinext-translation

# JWT Secrets (generate new ones)
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
```

**Generate secure secrets:**
```bash
# Generate JWT secrets
openssl rand -base64 32
openssl rand -base64 32
```

Save and exit (Ctrl+X, Y, Enter), then press Enter to continue the script.

---

### Step 7: Verify Deployment (10 minutes)

After the script completes, verify everything works:

#### 7.1 Check Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-02T...",
  "uptime": 123.45,
  "environment": "production",
  "services": {
    "database": "connected"
  }
}
```

#### 7.2 Check API Version
```bash
curl http://localhost:3000/api/v1
```

Expected response:
```json
{
  "message": "Agrinext API v1",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/v1/auth",
    "users": "/api/v1/users",
    "diseases": "/api/v1/diseases",
    "advisories": "/api/v1/advisories",
    "schemes": "/api/v1/schemes"
  }
}
```

#### 7.3 Check PM2 Status
```bash
pm2 status
```

Should show `agrinext-api` with status `online`.

#### 7.4 Check Logs
```bash
pm2 logs agrinext-api --lines 50
```

Look for:
- ✅ "Agrinext server running on port 3000"
- ✅ "Environment: production"
- ✅ No error messages

#### 7.5 Test from Browser

Open in your browser:
- http://3.239.184.220:3000/health
- http://3.239.184.220:3000/api/v1

Both should return JSON responses.

---

### Step 8: Test API Endpoints (15 minutes)

#### 8.1 Test OTP Sending

```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "+1234567890"}'
```

Expected: SMS sent to your phone (if Twilio configured correctly)

#### 8.2 Test Government Schemes

```bash
curl http://localhost:3000/api/v1/schemes
```

Expected: List of 5 government schemes

#### 8.3 Test Database Connection

```bash
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d agrinext_mvp \
     -c "SELECT COUNT(*) FROM users;"
```

Expected: Connection successful, returns user count

---

## Troubleshooting

### Issue: Script fails at "npm install"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
cd ~/agrinext-phase2/backend
npm install --production
```

### Issue: TypeScript build fails

**Solution:**
```bash
# Check Node.js version
node --version  # Should be 18+

# Install TypeScript globally
npm install -g typescript

# Try build again
npm run build
```

### Issue: Database migration fails

**Solution:**
```bash
# Check database connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# If connection works, try migration manually
psql -h $DB_HOST -U $DB_USER -d $DB_NAME \
     -f ~/agrinext-phase2/database/migrations/002_phase2_schema_upgrade.sql
```

### Issue: PM2 won't start backend

**Solution:**
```bash
# Check for errors
pm2 logs agrinext-api --lines 100

# Common issues:
# 1. Missing .env file
# 2. Invalid environment variables
# 3. Port 3000 already in use

# Check port
sudo netstat -tlnp | grep 3000

# Kill process if needed
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Issue: Health check returns "database": "disconnected"

**Solution:**
```bash
# Verify database credentials in .env
cat ~/agrinext-phase2/backend/.env | grep DB_

# Test connection manually
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# Check RDS security group allows EC2 access
# AWS Console → RDS → Security Groups → Inbound Rules
```

### Issue: S3 upload fails (403 Forbidden)

**Solution:**
1. Verify IAM role attached to EC2:
   ```bash
   aws sts get-caller-identity
   ```

2. Check IAM role has S3 write permissions:
   - AWS Console → IAM → Roles → AgrinextEC2Role
   - Should have AmazonS3FullAccess or custom policy

3. Wait 1-2 minutes for permissions to propagate

### Issue: External API calls fail (Twilio, OpenAI, etc.)

**Solution:**
```bash
# Verify API keys in .env
cat ~/agrinext-phase2/backend/.env | grep -E "TWILIO|OPENAI|HUGGING"

# Test Twilio manually
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  -d "From=$TWILIO_PHONE_NUMBER" \
  -d "To=+1234567890" \
  -d "Body=Test message"

# Test OpenAI manually
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## Rollback Procedure

If something goes wrong, rollback to Phase 1:

```bash
# 1. Stop Phase 2
pm2 stop agrinext-api
pm2 delete agrinext-api

# 2. Find backup directory
ls -lt ~/agrinext-backups/

# 3. Restore database (if needed)
BACKUP_DIR=$(ls -t ~/agrinext-backups/ | head -1)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < ~/agrinext-backups/$BACKUP_DIR/database-backup.sql

# 4. Start Phase 1
cd ~/agrinext/backend
pm2 start src/server.js --name agrinext-api
pm2 save

# 5. Verify
curl http://localhost:3000/health
```

**Rollback Time**: 15-20 minutes

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Health endpoint returns "healthy"
- [ ] API version endpoint works
- [ ] Database connection verified
- [ ] PM2 shows backend as "online"
- [ ] No errors in PM2 logs
- [ ] OTP sending works (test with real phone)
- [ ] Government schemes endpoint returns data
- [ ] External APIs accessible (Twilio, OpenAI, etc.)
- [ ] S3 upload permissions working
- [ ] Browser can access public IP endpoints

---

## Monitoring

### View Logs
```bash
# Real-time logs
pm2 logs agrinext-api

# Last 100 lines
pm2 logs agrinext-api --lines 100

# Error logs only
pm2 logs agrinext-api --err
```

### Monitor Resources
```bash
# PM2 monitoring dashboard
pm2 monit

# System resources
htop  # or top
```

### Check Database
```bash
# Active connections
psql -h $DB_HOST -U $DB_USER -d $DB_NAME \
     -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
psql -h $DB_HOST -U $DB_USER -d $DB_NAME \
     -c "SELECT pg_size_pretty(pg_database_size('agrinext_mvp'));"
```

---

## Next Steps

After successful deployment:

1. **Configure Mobile App**
   - Update API base URL to: `http://3.239.184.220:3000`
   - Test authentication flow
   - Test disease detection
   - Test advisory feature

2. **Monitor for 24 Hours**
   - Check logs regularly
   - Monitor error rates
   - Track API response times
   - Verify external service usage

3. **Set Up Alerts** (Optional)
   - AWS CloudWatch alarms
   - PM2 monitoring
   - Database performance metrics

4. **Plan for Production**
   - Consider HTTPS (SSL certificate)
   - Set up domain name
   - Configure CDN for images
   - Implement backup automation

---

## Cost Tracking

### AWS Costs (First 12 Months)
- EC2 t3.micro: $0 (Free Tier)
- RDS t3.micro: $0 (Free Tier)
- S3 Storage: $0 (Free Tier)
- **Total AWS**: $0/month

### External Service Costs
- Twilio: ~$5-10/month (depends on SMS volume)
- OpenAI: ~$2-5/month (depends on advisory usage)
- Hugging Face: $0 (Free tier)
- Google Translate: ~$1-3/month (depends on translation volume)
- **Total External**: ~$10-20/month

### After Free Tier (Month 13+)
- AWS: ~$26/month
- External: ~$10-20/month
- **Total**: ~$36-46/month

---

## Support

If you encounter issues:

1. Check logs: `pm2 logs agrinext-api`
2. Review deployment log: `cat ~/phase2-deployment.log`
3. Verify environment: `cat ~/agrinext-phase2/backend/.env`
4. Test database: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"`
5. Check AWS Console for resource status

---

## Summary

**Total Deployment Time**: 2-3 hours
- External service setup: 30-60 minutes
- Code upload: 5 minutes
- IAM role update: 5 minutes
- Script execution: 60-90 minutes
- Verification: 10 minutes
- Testing: 15 minutes

**Downtime**: 5-10 minutes (during backend restart)

**Cost**: $0 AWS + $10-20 external services = $10-20/month

**Rollback Time**: 15-20 minutes if needed

---

**Deployment Status**: Ready to Deploy  
**Last Updated**: March 2, 2026  
**Version**: 1.0

