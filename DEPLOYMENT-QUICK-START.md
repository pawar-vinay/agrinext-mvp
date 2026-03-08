# Phase 2 Deployment - Quick Start Guide

**Ready to deploy!** Follow these steps in order.

---

## ✅ Pre-Deployment Checklist

Before you start:
- [ ] I have AWS Console access
- [ ] Phase 1 infrastructure is running (EC2, RDS, S3)
- [ ] I'm creating external service accounts (Twilio, OpenAI, etc.)
- [ ] I have `phase2-backend.zip` file ready

---

## 🚀 Deployment Steps (2 hours)

### Step 1: Upload Code to S3 (10 min)

**What to do:**
1. Go to: https://s3.console.aws.amazon.com/s3/buckets/agrinext-images-1772367775698
2. Create folder: `phase2`
3. Upload `phase2-backend.zip` to the `phase2` folder
4. Create folder: `phase2/database/migrations`
5. Upload `database/migrations/002_phase2_schema_upgrade.sql`
6. Create folder: `phase2/deploy`
7. Upload `deploy/deploy-phase2.sh`

**Files to upload:**
- ✅ `phase2-backend.zip` → `s3://agrinext-images-1772367775698/phase2/`
- ✅ `002_phase2_schema_upgrade.sql` → `s3://agrinext-images-1772367775698/phase2/database/migrations/`
- ✅ `deploy-phase2.sh` → `s3://agrinext-images-1772367775698/phase2/deploy/`

---

### Step 2: Update IAM Role (5 min)

**What to do:**
1. Go to: https://console.aws.amazon.com/iam/home#/roles
2. Search: `AgrinextEC2Role`
3. Click "Add permissions" → "Attach policies"
4. Search: `AmazonS3FullAccess`
5. Check the box and click "Add permissions"

**Why:** Phase 2 needs to upload images to S3

---

### Step 3: Connect to EC2 (2 min)

**What to do:**
1. Go to: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:
2. Select instance: `i-004ef74f37ba59da1`
3. Click "Connect" → "Session Manager" → "Connect"
4. A terminal will open in your browser

---

### Step 4: Download and Run Deployment Script (90 min)

**In the EC2 terminal, run these commands:**

```bash
# Download deployment script
cd ~
aws s3 cp s3://agrinext-images-1772367775698/phase2/deploy/deploy-phase2.sh . --region us-east-1

# Make it executable
chmod +x deploy-phase2.sh

# Run it
./deploy-phase2.sh
```

**The script will:**
1. ✅ Check prerequisites
2. ✅ Backup Phase 1
3. ✅ Download Phase 2 code
4. ✅ Install dependencies
5. ✅ Build TypeScript
6. ⏸️ **PAUSE** - Wait for you to update .env file
7. ✅ Run database migration
8. ✅ Stop Phase 1
9. ✅ Start Phase 2
10. ✅ Verify deployment

---

### Step 5: Configure Environment (10 min)

**When the script pauses, it will say:**
```
⚠️ Please update .env file with your API keys before continuing.
Press Enter after updating .env file...
```

**DO NOT PRESS ENTER YET!**

**Open a NEW Session Manager tab** (keep the first one open):
1. Go back to EC2 Console
2. Click "Connect" again
3. Open Session Manager in a new tab

**In the NEW tab, run:**
```bash
# Edit .env file
cd ~/agrinext-phase2/backend
nano .env
```

**Update these values with your API keys:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=nateraw/vit-base-beans-disease

GOOGLE_PROJECT_ID=agrinext-translation-123456
```

**Generate JWT secrets:**
```bash
# Generate two secrets
openssl rand -base64 32
openssl rand -base64 32
```

**Add them to .env:**
```env
JWT_SECRET=<paste-first-secret-here>
REFRESH_TOKEN_SECRET=<paste-second-secret-here>
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

**Go back to the FIRST tab** (where deployment script is waiting)

**Press Enter** to continue deployment

---

### Step 6: Verify Deployment (10 min)

**After deployment completes, test these:**

**In EC2 terminal:**
```bash
# Test health
curl http://localhost:3000/health

# Test API
curl http://localhost:3000/api/v1

# Check PM2
pm2 status

# Check logs
pm2 logs agrinext-api --lines 20
```

**In your browser:**
- http://3.239.184.220:3000/health
- http://3.239.184.220:3000/api/v1

**Both should return JSON responses.**

---

## ✅ Success Indicators

Deployment is successful if:
- [ ] Health endpoint returns `"status": "healthy"`
- [ ] Database shows `"database": "connected"`
- [ ] PM2 shows `status: online`
- [ ] No errors in logs
- [ ] Browser can access endpoints

---

## 🆘 Quick Troubleshooting

### Script fails at npm install
```bash
cd ~/agrinext-phase2/backend
npm cache clean --force
npm install --production
```

### PM2 won't start
```bash
pm2 logs agrinext-api --lines 100
# Check for errors in .env file
```

### Database connection fails
```bash
# Test connection
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres -d agrinext_mvp -c "SELECT 1;"
```

### Need to rollback
```bash
pm2 stop agrinext-api
pm2 delete agrinext-api
cd ~/agrinext/backend
pm2 start src/server.js --name agrinext-api
```

---

## 📞 Need Help?

**Check these files:**
- Full instructions: `DEPLOYMENT-INSTRUCTIONS.md`
- Deployment guide: `PHASE2-DEPLOYMENT-GUIDE.md`
- Quick reference: `DEPLOYMENT-QUICK-REFERENCE.md`

**Check logs:**
```bash
pm2 logs agrinext-api
cat ~/phase2-deployment.log
```

---

## 🎉 After Successful Deployment

1. **Monitor for 24 hours**
   - Check logs regularly
   - Monitor error rates
   - Verify external service usage

2. **Test with mobile app**
   - Update API URL to: `http://3.239.184.220:3000`
   - Test authentication
   - Test disease detection
   - Test advisory

3. **Set up monitoring** (optional)
   - CloudWatch alarms
   - PM2 monitoring
   - Database metrics

---

**Total Time**: ~2 hours  
**Downtime**: 5-10 minutes  
**Cost**: $0 AWS + $8-18/month external services

**Ready? Let's deploy! 🚀**

