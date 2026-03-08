# Phase 2 Deployment Instructions - Step by Step

**Status**: Ready to Deploy  
**Date**: March 2, 2026  
**Estimated Time**: 2-3 hours

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] AWS Console access (https://console.aws.amazon.com)
- [ ] External service accounts created (or in progress):
  - [ ] Twilio (Account SID, Auth Token, Phone Number)
  - [ ] OpenAI (API Key)
  - [ ] Hugging Face (API Token, Model Name)
  - [ ] Google Cloud (Project ID)
- [ ] Phase 1 infrastructure running (EC2, RDS, S3)

---

## Deployment Overview

We'll deploy Phase 2 in these steps:

1. **Upload Code to S3** (10 min) - Manual upload via AWS Console
2. **Update IAM Role** (5 min) - Add S3 write permissions
3. **Connect to EC2** (2 min) - Via AWS Systems Manager
4. **Run Deployment Script** (90 min) - Automated deployment
5. **Configure Environment** (10 min) - Add API keys
6. **Verify Deployment** (10 min) - Test all endpoints

**Total Time**: ~2 hours

---

## Step 1: Upload Phase 2 Code to S3 (10 minutes)

Since AWS CLI is not installed locally, we'll upload via AWS Console.

### Option A: Upload via AWS Console (Recommended)

**1.1 Create a ZIP file of the backend code**

On your local machine:
```powershell
# Navigate to project directory
cd J:\Aws_hackathon

# Create a ZIP file (excluding node_modules and dist)
Compress-Archive -Path backend\* -DestinationPath phase2-backend.zip -Force
```

**1.2 Upload to S3**

1. Go to: https://s3.console.aws.amazon.com/s3/buckets/agrinext-images-1772367775698
2. Click "Create folder"
3. Folder name: `phase2`
4. Click "Create folder"
5. Open the `phase2` folder
6. Click "Upload"
7. Click "Add files"
8. Select `phase2-backend.zip`
9. Click "Upload"
10. Wait for upload to complete

**1.3 Upload Database Migration**

1. In the same `phase2` folder, click "Create folder"
2. Folder name: `database`
3. Open the `database` folder
4. Click "Create folder"
5. Folder name: `migrations`
6. Open the `migrations` folder
7. Click "Upload"
8. Select `database/migrations/002_phase2_schema_upgrade.sql`
9. Click "Upload"

**1.4 Upload Deployment Script**

1. Go back to `phase2` folder
2. Click "Create folder"
3. Folder name: `deploy`
4. Open the `deploy` folder
5. Click "Upload"
6. Select `deploy/deploy-phase2.sh`
7. Click "Upload"

### Option B: Install AWS CLI and Upload (Alternative)

If you want to install AWS CLI:

```powershell
# Install AWS CLI via MSI installer
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
# Run the installer

# After installation, configure AWS CLI
aws configure
# Enter:
# - AWS Access Key ID: (from your AWS account)
# - AWS Secret Access Key: (from your AWS account)
# - Default region: us-east-1
# - Default output format: json

# Then upload
aws s3 sync ./backend s3://agrinext-images-1772367775698/phase2/backend/ --region us-east-1 --exclude "node_modules/*" --exclude "dist/*" --exclude ".env"
aws s3 cp ./database/migrations/002_phase2_schema_upgrade.sql s3://agrinext-images-1772367775698/phase2/database/migrations/ --region us-east-1
aws s3 cp ./deploy/deploy-phase2.sh s3://agrinext-images-1772367775698/phase2/deploy/ --region us-east-1
```

---

## Step 2: Update IAM Role for S3 Write Access (5 minutes)

Phase 2 needs to upload images to S3, so we need write permissions.

**2.1 Open IAM Console**
1. Go to: https://console.aws.amazon.com/iam/home#/roles
2. Search for: `AgrinextEC2Role`
3. Click on the role

**2.2 Add S3 Full Access Policy**
1. Click "Add permissions" → "Attach policies"
2. Search for: `AmazonS3FullAccess`
3. Check the box next to it
4. Click "Add permissions"

**2.3 Verify Permissions**
1. Go to "Permissions" tab
2. You should see:
   - AmazonS3ReadOnlyAccess (old)
   - AmazonS3FullAccess (new)
3. You can remove the ReadOnlyAccess policy (optional)

**Alternative (More Secure): Custom Policy**

Instead of AmazonS3FullAccess, create a custom policy:

1. Click "Add permissions" → "Create inline policy"
2. Click "JSON" tab
3. Paste this:

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

4. Click "Review policy"
5. Name: `AgrinextS3Access`
6. Click "Create policy"

---

## Step 3: Connect to EC2 Instance (2 minutes)

**3.1 Open EC2 Console**
1. Go to: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:
2. Find instance: `i-004ef74f37ba59da1`
3. Check the box next to it

**3.2 Connect via Session Manager**
1. Click "Connect" button (top right)
2. Click "Session Manager" tab
3. Click "Connect" button
4. A new browser tab will open with a terminal

**3.3 Verify Connection**
In the terminal, run:
```bash
whoami
# Should show: ssm-user or ec2-user

pwd
# Should show: /home/ssm-user or /home/ec2-user

node --version
# Should show: v18.x.x
```

---

## Step 4: Download and Run Deployment Script (90 minutes)

Now we're on the EC2 instance. Let's download and run the deployment script.

**4.1 Download Deployment Script**

```bash
# Navigate to home directory
cd ~

# Download deployment script from S3
aws s3 cp s3://agrinext-images-1772367775698/phase2/deploy/deploy-phase2.sh . --region us-east-1

# Make it executable
chmod +x deploy-phase2.sh

# Verify download
ls -lh deploy-phase2.sh
```

**4.2 Run Deployment Script**

```bash
# Run the script
./deploy-phase2.sh
```

**What the script does:**
1. ✅ Verifies prerequisites (Node.js, PostgreSQL client, etc.)
2. ✅ Creates backup of Phase 1 (code + database)
3. ✅ Downloads Phase 2 code from S3
4. ✅ Installs dependencies (npm install)
5. ✅ Builds TypeScript code (npm run build)
6. ⏸️ **PAUSES** - Waits for you to update .env file
7. ✅ Runs database migration
8. ✅ Stops Phase 1 backend
9. ✅ Starts Phase 2 backend
10. ✅ Verifies deployment

**Expected Output:**
```
[2026-03-02 10:00:00] Starting Phase 2 deployment...
[2026-03-02 10:00:01] Performing pre-deployment checks...
✓ Pre-deployment checks passed
[2026-03-02 10:00:05] Creating backup of Phase 1...
✓ Backup completed: /home/ssm-user/agrinext-backups/20260302_100005
[2026-03-02 10:00:10] Downloading Phase 2 code from S3...
✓ Phase 2 code downloaded
[2026-03-02 10:00:15] Installing Phase 2 dependencies...
... (npm install output)
✓ Dependencies installed and code built
[2026-03-02 10:01:30] Configuring environment variables...
```

**4.3 Script Will Pause Here**

The script will pause and show:
```
⚠️ Please update .env file with your API keys before continuing.
Press Enter after updating .env file...
```

**DO NOT PRESS ENTER YET!** Continue to Step 5.

---

## Step 5: Configure Environment Variables (10 minutes)

The script has paused. Now we need to update the .env file with your API keys.

**5.1 Open Another Terminal Tab**

Keep the deployment script running in the first tab. Open a new Session Manager connection:
1. Go back to EC2 Console
2. Click "Connect" again
3. Open Session Manager in a new tab

**5.2 Edit .env File**

In the new terminal tab:
```bash
# Navigate to Phase 2 backend directory
cd ~/agrinext-phase2/backend

# Edit .env file
nano .env
```

**5.3 Update These Values**

Find and update these lines with your actual API keys:

```env
# Twilio (from your Twilio account)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI (from your OpenAI account)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500

# Hugging Face (from your Hugging Face account)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=nateraw/vit-base-beans-disease

# Google Cloud (from your Google Cloud account)
GOOGLE_PROJECT_ID=agrinext-translation-123456

# JWT Secrets (generate new ones)
JWT_SECRET=<GENERATE_NEW_SECRET>
REFRESH_TOKEN_SECRET=<GENERATE_NEW_SECRET>
```

**5.4 Generate JWT Secrets**

In the same terminal (or open another tab):
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate refresh token secret
openssl rand -base64 32
```

Copy these values and paste them into the .env file.

**5.5 Save and Exit**

In nano:
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

**5.6 Verify .env File**

```bash
# Check that all required variables are set
cat .env | grep -E "TWILIO|OPENAI|HUGGING|GOOGLE|JWT"
```

You should see all your API keys (partially masked).

**5.7 Go Back to Deployment Script**

Switch back to the first terminal tab where the deployment script is waiting.

**5.8 Continue Deployment**

Press `Enter` to continue the deployment script.

The script will now:
1. ✅ Run database migration
2. ✅ Stop Phase 1 backend
3. ✅ Start Phase 2 backend
4. ✅ Verify deployment

**Expected Output:**
```
[2026-03-02 10:15:00] Running database migration...
✓ Database migration completed
[2026-03-02 10:15:30] Stopping Phase 1 backend...
✓ Phase 1 backend stopped
[2026-03-02 10:15:35] Starting Phase 2 backend...
✓ Phase 2 backend started successfully
[2026-03-02 10:15:40] Verifying deployment...
✓ Health check passed
✓ API version check passed
✓ Database connection verified

============================================
Phase 2 Deployment Complete!
============================================

Deployment Summary:
  - Phase 1 backup: /home/ssm-user/agrinext-backups/20260302_100005
  - Phase 2 location: /home/ssm-user/agrinext-phase2
  - Log file: /home/ssm-user/phase2-deployment.log

Service Status:
  - Backend API: http://3.239.184.220:3000
  - Health Check: http://3.239.184.220:3000/health
  - API Version: http://3.239.184.220:3000/api/v1

Useful Commands:
  - View logs: pm2 logs agrinext-api
  - Restart: pm2 restart agrinext-api
  - Status: pm2 status
  - Monitor: pm2 monit
```

---

## Step 6: Verify Deployment (10 minutes)

Let's verify that everything is working correctly.

**6.1 Check Health Endpoint**

In the EC2 terminal:
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

**6.2 Check API Version**

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

**6.3 Check PM2 Status**

```bash
pm2 status
```

Expected output:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name             │ mode    │ ↺      │ status   │ cpu    │
├─────┼──────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ agrinext-api     │ fork    │ 0       │ online   │ 0%     │
└─────┴──────────────────┴─────────┴─────────┴──────────┴────────┘
```

**6.4 Check Logs**

```bash
pm2 logs agrinext-api --lines 50
```

Look for:
- ✅ "Agrinext server running on port 3000"
- ✅ "Environment: production"
- ✅ "API Version: v1"
- ❌ No error messages

**6.5 Test from Browser**

Open these URLs in your browser:
- http://3.239.184.220:3000/health
- http://3.239.184.220:3000/api/v1

Both should return JSON responses.

**6.6 Test Government Schemes Endpoint**

```bash
curl http://localhost:3000/api/v1/schemes
```

Should return a list of 5 government schemes.

**6.7 Test Database Connection**

```bash
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d agrinext_mvp \
     -c "SELECT COUNT(*) FROM users;"
```

Should connect successfully and return a count.

---

## Step 7: Test API Endpoints (Optional, 15 minutes)

Let's test the new Phase 2 endpoints.

**7.1 Test OTP Sending**

```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "+1234567890"}'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2026-03-02T10:25:00Z"
}
```

**Check your phone** - You should receive an SMS with a 6-digit OTP code.

**7.2 Test Government Schemes**

```bash
curl http://localhost:3000/api/v1/schemes
```

Should return 5 schemes with full details.

**7.3 Test Health Check (Public)**

From your local machine browser:
- http://3.239.184.220:3000/health

Should return healthy status.

---

## Troubleshooting

### Issue: Script fails at "npm install"

**Solution:**
```bash
# Clear npm cache
cd ~/agrinext-phase2/backend
npm cache clean --force

# Try again
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
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres -d agrinext_mvp -c "SELECT 1;"

# If connection works, try migration manually
cd ~/agrinext-phase2
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres -d agrinext_mvp \
     -f database/migrations/002_phase2_schema_upgrade.sql
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

# Restart
cd ~/agrinext-phase2/backend
pm2 restart agrinext-api
```

### Issue: Health check returns "database": "disconnected"

**Solution:**
```bash
# Verify database credentials in .env
cat ~/agrinext-phase2/backend/.env | grep DB_

# Test connection manually
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres -d agrinext_mvp -c "SELECT 1;"

# Check RDS security group allows EC2 access
# AWS Console → RDS → Security Groups → Inbound Rules
```

### Issue: Twilio OTP not sending

**Solution:**
```bash
# Verify Twilio credentials
cat ~/agrinext-phase2/backend/.env | grep TWILIO

# Test Twilio manually
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  -d "From=$TWILIO_PHONE_NUMBER" \
  -d "To=+1234567890" \
  -d "Body=Test message"
```

---

## Rollback Procedure (If Needed)

If something goes wrong, you can rollback to Phase 1:

```bash
# 1. Stop Phase 2
pm2 stop agrinext-api
pm2 delete agrinext-api

# 2. Find backup directory
ls -lt ~/agrinext-backups/

# 3. Restore database (if needed)
BACKUP_DIR=$(ls -t ~/agrinext-backups/ | head -1)
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres -d agrinext_mvp \
     < ~/agrinext-backups/$BACKUP_DIR/database-backup.sql

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
- [ ] Browser can access public IP endpoints
- [ ] All external APIs accessible (Twilio, OpenAI, etc.)
- [ ] S3 upload permissions working

---

## Next Steps

After successful deployment:

1. **Monitor for 24 Hours**
   - Check logs regularly: `pm2 logs agrinext-api`
   - Monitor error rates
   - Track API response times
   - Verify external service usage

2. **Configure Mobile App**
   - Update API base URL to: `http://3.239.184.220:3000`
   - Test authentication flow
   - Test disease detection
   - Test advisory feature

3. **Set Up Monitoring** (Optional)
   - AWS CloudWatch alarms
   - PM2 monitoring
   - Database performance metrics

4. **Plan for Production**
   - Consider HTTPS (SSL certificate)
   - Set up domain name
   - Configure CDN for images
   - Implement backup automation

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

**Deployment Steps:**
1. ✅ Upload code to S3 (10 min)
2. ✅ Update IAM role (5 min)
3. ✅ Connect to EC2 (2 min)
4. ✅ Run deployment script (90 min)
5. ✅ Configure environment (10 min)
6. ✅ Verify deployment (10 min)

**Total Time**: ~2 hours  
**Downtime**: 5-10 minutes  
**Cost**: $0 AWS + $8-18 external services

---

**Deployment Status**: Ready to Start  
**Last Updated**: March 2, 2026  
**Version**: 1.0

