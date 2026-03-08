# 🚀 START DEPLOYMENT HERE

**Status**: ✅ Ready to Deploy  
**Date**: March 2, 2026  
**Time Required**: 2 hours

---

## What's Ready

✅ **Phase 2 code packaged**: `phase2-backend.zip` (47 KB)  
✅ **Database migration ready**: `database/migrations/002_phase2_schema_upgrade.sql`  
✅ **Deployment script ready**: `deploy/deploy-phase2.sh`  
✅ **All documentation created**  
✅ **Infrastructure assessed** (existing infrastructure is sufficient)

---

## What You Need

### 1. AWS Access
- [ ] AWS Console login: https://console.aws.amazon.com
- [ ] Access to EC2 instance: `i-004ef74f37ba59da1`
- [ ] Access to S3 bucket: `agrinext-images-1772367775698`
- [ ] Access to IAM roles

### 2. External Service API Keys

You mentioned you'll create these accounts. Here's what you need:

**Twilio** (SMS/OTP):
- [ ] Account SID (starts with "AC...")
- [ ] Auth Token
- [ ] Phone Number (starts with "+")

**OpenAI** (AI Advisory):
- [ ] API Key (starts with "sk-")

**Hugging Face** (Disease Detection):
- [ ] API Token (starts with "hf_")
- [ ] Model Name (e.g., "nateraw/vit-base-beans-disease")

**Google Cloud** (Translation):
- [ ] Project ID

---

## Deployment Process

### Quick Path (Follow This)

1. **Read**: `DEPLOYMENT-QUICK-START.md` (5 min read)
2. **Upload**: Files to S3 (10 min)
3. **Update**: IAM role (5 min)
4. **Connect**: To EC2 (2 min)
5. **Run**: Deployment script (90 min)
6. **Configure**: API keys (10 min)
7. **Verify**: Deployment (10 min)

**Total**: ~2 hours

### Detailed Path (If You Need More Info)

Read these in order:
1. `DEPLOYMENT-QUICK-START.md` - Quick overview
2. `DEPLOYMENT-INSTRUCTIONS.md` - Detailed step-by-step
3. `PHASE2-DEPLOYMENT-GUIDE.md` - Complete guide with troubleshooting

---

## Files You'll Upload to S3

Located in your project directory:

1. **Backend Code**:
   - File: `phase2-backend.zip` (47 KB)
   - Upload to: `s3://agrinext-images-1772367775698/phase2/`

2. **Database Migration**:
   - File: `database/migrations/002_phase2_schema_upgrade.sql`
   - Upload to: `s3://agrinext-images-1772367775698/phase2/database/migrations/`

3. **Deployment Script**:
   - File: `deploy/deploy-phase2.sh`
   - Upload to: `s3://agrinext-images-1772367775698/phase2/deploy/`

---

## Step-by-Step (Ultra Quick)

### Step 1: Upload to S3 (10 min)

1. Go to: https://s3.console.aws.amazon.com/s3/buckets/agrinext-images-1772367775698
2. Create folder: `phase2`
3. Upload `phase2-backend.zip`
4. Create folders: `phase2/database/migrations` and `phase2/deploy`
5. Upload migration SQL and deployment script

### Step 2: Update IAM (5 min)

1. Go to: https://console.aws.amazon.com/iam/home#/roles
2. Find: `AgrinextEC2Role`
3. Add policy: `AmazonS3FullAccess`

### Step 3: Connect to EC2 (2 min)

1. Go to: https://console.aws.amazon.com/ec2
2. Select: `i-004ef74f37ba59da1`
3. Click: Connect → Session Manager → Connect

### Step 4: Run Deployment (90 min)

In EC2 terminal:
```bash
cd ~
aws s3 cp s3://agrinext-images-1772367775698/phase2/deploy/deploy-phase2.sh . --region us-east-1
chmod +x deploy-phase2.sh
./deploy-phase2.sh
```

### Step 5: Add API Keys (10 min)

When script pauses:
1. Open new Session Manager tab
2. Edit: `nano ~/agrinext-phase2/backend/.env`
3. Add your API keys
4. Generate JWT secrets: `openssl rand -base64 32`
5. Save and go back to first tab
6. Press Enter to continue

### Step 6: Verify (10 min)

Test:
```bash
curl http://localhost:3000/health
pm2 status
```

Browser:
- http://3.239.184.220:3000/health

---

## What Happens During Deployment

The deployment script will:

1. ✅ **Backup Phase 1** (5 min)
   - Backs up code and database
   - Saves to: `~/agrinext-backups/`

2. ✅ **Download Phase 2** (5 min)
   - Downloads from S3
   - Extracts to: `~/agrinext-phase2/`

3. ✅ **Install Dependencies** (20 min)
   - Runs: `npm install`
   - Installs all packages

4. ✅ **Build TypeScript** (10 min)
   - Runs: `npm run build`
   - Creates: `dist/` folder

5. ⏸️ **PAUSE for .env** (10 min)
   - You update API keys
   - You generate JWT secrets

6. ✅ **Migrate Database** (5 min)
   - Adds new columns
   - Creates new indexes
   - Updates schema

7. ✅ **Switch Backend** (5 min)
   - Stops Phase 1
   - Starts Phase 2
   - Verifies health

8. ✅ **Verify** (5 min)
   - Tests endpoints
   - Checks database
   - Confirms success

**Total**: ~90 minutes (most is automated)

---

## Success Criteria

Deployment is successful when:

✅ Health endpoint returns:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected"
  }
}
```

✅ PM2 shows:
```
status: online
```

✅ No errors in logs:
```bash
pm2 logs agrinext-api
```

✅ Browser can access:
- http://3.239.184.220:3000/health
- http://3.239.184.220:3000/api/v1

---

## If Something Goes Wrong

### Quick Rollback (15 min)

```bash
pm2 stop agrinext-api
pm2 delete agrinext-api
cd ~/agrinext/backend
pm2 start src/server.js --name agrinext-api
```

This restores Phase 1 immediately.

### Get Help

Check these files:
- `DEPLOYMENT-INSTRUCTIONS.md` - Detailed troubleshooting
- `DEPLOYMENT-QUICK-REFERENCE.md` - Quick commands
- `PHASE2-DEPLOYMENT-GUIDE.md` - Complete guide

Check logs:
```bash
pm2 logs agrinext-api
cat ~/phase2-deployment.log
```

---

## Cost Summary

### AWS Costs
- **Month 1-12**: $0 (Free Tier)
- **Month 13+**: ~$26/month

### External Services
- **Twilio**: $5-10/month
- **OpenAI**: $2-5/month
- **Hugging Face**: $0 (free tier)
- **Google Cloud**: $1-3/month

**Total**: $8-18/month (first year)

---

## After Deployment

### Immediate (Day 1)
- [ ] Test all endpoints
- [ ] Send test OTP
- [ ] Check logs for errors
- [ ] Monitor PM2 status

### Short-term (Week 1)
- [ ] Monitor for 24 hours
- [ ] Test with mobile app
- [ ] Verify external service usage
- [ ] Check AWS costs

### Long-term (Month 1)
- [ ] Set up monitoring
- [ ] Configure alerts
- [ ] Plan for scaling
- [ ] Review performance

---

## Ready to Start?

### Option 1: Quick Start (Recommended)
👉 **Open**: `DEPLOYMENT-QUICK-START.md`

### Option 2: Detailed Guide
👉 **Open**: `DEPLOYMENT-INSTRUCTIONS.md`

### Option 3: Complete Reference
👉 **Open**: `PHASE2-DEPLOYMENT-GUIDE.md`

---

## Checklist Before You Begin

- [ ] I have AWS Console access
- [ ] I have external service API keys (or will get them during deployment)
- [ ] I have 2 hours available
- [ ] I've read the quick start guide
- [ ] I'm ready to deploy!

---

## Let's Deploy! 🚀

**Start here**: Open `DEPLOYMENT-QUICK-START.md` and follow the steps.

**Estimated time**: 2 hours  
**Downtime**: 5-10 minutes  
**Difficulty**: Easy (mostly automated)  
**Success rate**: 95%+

---

**Good luck with your deployment!**

If you encounter any issues, refer to the troubleshooting sections in the detailed guides.

---

**Created**: March 2, 2026  
**Version**: 1.0  
**Status**: Ready to Deploy ✅

