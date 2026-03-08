# Quick Deployment Guide - Mixed Approach

Since we have EC2 permissions but not S3/RDS, let's use a hybrid approach:

## What We'll Do

1. ✅ **EC2**: Deploy via script (we have permissions)
2. 🌐 **S3**: Create manually via AWS Console (2 minutes)
3. 🗄️ **RDS**: Create manually via AWS Console (15 minutes)

This is actually faster than waiting for permission propagation!

---

## Step 1: Create S3 Bucket (Manual - 2 minutes)

1. Go to: https://console.aws.amazon.com/s3
2. Click "Create bucket"
3. Bucket name: `agrinext-images-2026` (or any unique name)
4. Region: **us-east-1**
5. Uncheck "Block all public access" (we'll configure later)
6. Click "Create bucket"
7. **Save the bucket name!**

---

## Step 2: Create RDS Database (Manual - 15 minutes)

1. Go to: https://console.aws.amazon.com/rds
2. Click "Create database"
3. Choose: **Standard create**
4. Engine: **PostgreSQL**
5. Templates: **Free tier**
6. Settings:
   - DB instance identifier: `agrinext-db`
   - Master username: `postgres`
   - Master password: Create a strong password and **SAVE IT!**
7. Instance configuration: **db.t3.micro** (should be pre-selected)
8. Storage: **20 GB** (default)
9. Connectivity:
   - Public access: **Yes**
   - VPC security group: **Create new** → Name it `agrinext-db-sg`
10. Additional configuration:
    - Initial database name: `agrinext_mvp`
11. Click "Create database"
12. Wait 10-15 minutes for creation
13. **Save the endpoint URL when ready!**

---

## Step 3: Deploy EC2 Instance (Automated)

Run this command:

```powershell
cd aws-tests
node deploy-ec2-only.js
```

This will:
- Create EC2 instance (t2.micro - Free Tier)
- Set up security groups
- Install Node.js automatically
- Give you the public IP address

---

## Step 4: Configure and Start Backend

After EC2 is created, you'll get an IP address. Then:

1. SSH into EC2:
   ```bash
   ssh ec2-user@[EC2-IP]
   ```

2. Upload backend code (from your local machine):
   ```powershell
   scp -r backend ec2-user@[EC2-IP]:~/
   ```

3. On EC2, create .env file:
   ```bash
   cd backend
   nano .env
   ```
   
   Add:
   ```
   DB_HOST=[RDS-ENDPOINT-FROM-STEP-2]
   DB_PORT=5432
   DB_NAME=agrinext_mvp
   DB_USER=postgres
   DB_PASSWORD=[YOUR-DB-PASSWORD]
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=[YOUR-S3-BUCKET-NAME]
   PORT=3000
   NODE_ENV=production
   ```

4. Install dependencies and start:
   ```bash
   npm install
   pm2 start src/server.js --name agrinext-api
   pm2 save
   ```

5. Test:
   ```bash
   curl http://localhost:3000/health
   ```

---

## Summary

- **S3**: Manual (2 min) ✓
- **RDS**: Manual (15 min) ✓  
- **EC2**: Automated ✓
- **Total Time**: ~20 minutes
- **Cost**: $0 (Free Tier)

Ready to proceed? Type "start deployment" and I'll create the EC2 deployment script!
