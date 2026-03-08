# Complete Upload and Deployment Guide

**Follow these steps exactly. I'll guide you through each one.**

---

## 📦 Files Ready for Upload

Located in `J:\Aws_hackathon\`:

✅ `phase2-backend.zip` (47 KB) - Backend code  
✅ `database/migrations/002_phase2_schema_upgrade.sql` - Database migration  
✅ `deploy/deploy-phase2.sh` - Deployment script  

---

## STEP 1: Upload Files to S3 (10 minutes)

### 1.1 Open S3 Bucket

**Action:** Click this link (or copy-paste into browser):
```
https://s3.console.aws.amazon.com/s3/buckets/agrinext-images-1772367775698?region=us-east-1&tab=objects
```

**What you'll see:**
- Your S3 bucket page with existing files/folders
- You should see folders like `backend/`, `database/`, etc. from Phase 1

---

### 1.2 Create `phase2` Folder

**Action:**
1. Click the orange **"Create folder"** button (top right area)
2. In the popup:
   - Folder name: Type `phase2`
   - Leave encryption settings as default
3. Click orange **"Create folder"** button at bottom
4. You'll see a green success message

**Verification:** You should now see a folder named `phase2` in the list

---

### 1.3 Enter the `phase2` Folder

**Action:**
1. Click on the **`phase2`** folder name (blue link)
2. You'll enter an empty folder

**What you'll see:**
- The breadcrumb at top shows: `agrinext-images-1772367775698 > phase2`
- The folder is empty (no objects)

---

### 1.4 Upload Backend ZIP File

**Action:**
1. Click the orange **"Upload"** button
2. In the upload page, click **"Add files"** button
3. A file browser will open
4. Navigate to: `J:\Aws_hackathon\`
5. Select: `phase2-backend.zip`
6. Click **"Open"**
7. You'll see the file listed under "Files and folders"
8. Scroll down and click orange **"Upload"** button at bottom
9. Wait for upload (should take 10-30 seconds)
10. When you see "Upload succeeded" with green checkmark, click **"Close"** button

**Verification:** 
- You should see `phase2-backend.zip` in the `phase2` folder
- Size should show ~47 KB

---

### 1.5 Create `database` Folder Structure

**Action:**
1. Make sure you're still in the `phase2` folder (check breadcrumb)
2. Click **"Create folder"** button
3. Folder name: Type `database`
4. Click **"Create folder"**
5. Click on the **`database`** folder to enter it
6. Click **"Create folder"** again
7. Folder name: Type `migrations`
8. Click **"Create folder"**
9. Click on the **`migrations`** folder to enter it

**Verification:** 
- Breadcrumb should show: `agrinext-images-1772367775698 > phase2 > database > migrations`

---

### 1.6 Upload Database Migration File

**Action:**
1. You should be inside the `migrations` folder
2. Click **"Upload"** button
3. Click **"Add files"**
4. Navigate to: `J:\Aws_hackathon\database\migrations\`
5. Select: `002_phase2_schema_upgrade.sql`
6. Click **"Open"**
7. Click **"Upload"** button at bottom
8. Wait for upload
9. Click **"Close"** when done

**Verification:**
- You should see `002_phase2_schema_upgrade.sql` in the migrations folder

---

### 1.7 Go Back and Create `deploy` Folder

**Action:**
1. Click on **`phase2`** in the breadcrumb (to go back to phase2 folder)
2. Click **"Create folder"**
3. Folder name: Type `deploy`
4. Click **"Create folder"**
5. Click on the **`deploy`** folder to enter it

**Verification:**
- Breadcrumb shows: `agrinext-images-1772367775698 > phase2 > deploy`

---

### 1.8 Upload Deployment Script

**Action:**
1. You should be inside the `deploy` folder
2. Click **"Upload"** button
3. Click **"Add files"**
4. Navigate to: `J:\Aws_hackathon\deploy\`
5. Select: `deploy-phase2.sh`
6. Click **"Open"**
7. Click **"Upload"** button at bottom
8. Wait for upload
9. Click **"Close"** when done

**Verification:**
- You should see `deploy-phase2.sh` in the deploy folder

---

### ✅ STEP 1 COMPLETE - Verify All Uploads

**Action:** Click on **`phase2`** in the breadcrumb to go back to the phase2 folder

**You should see:**
```
phase2/
├── phase2-backend.zip (47 KB)
├── database/ (folder)
└── deploy/ (folder)
```

**Double-check:**
1. Click on `database` folder → Click on `migrations` folder → See `002_phase2_schema_upgrade.sql` ✅
2. Go back to `phase2` folder
3. Click on `deploy` folder → See `deploy-phase2.sh` ✅

**If all files are there, proceed to Step 2!**

---

## STEP 2: Update IAM Role (5 minutes)

### 2.1 Open IAM Roles Page

**Action:** Click this link (or copy-paste):
```
https://console.aws.amazon.com/iam/home?region=us-east-1#/roles
```

**What you'll see:**
- A list of IAM roles
- A search box at the top

---

### 2.2 Find AgrinextEC2Role

**Action:**
1. In the search box, type: `AgrinextEC2Role`
2. Press Enter or click the search icon
3. You should see **AgrinextEC2Role** in the filtered results
4. Click on **AgrinextEC2Role** (the role name is a blue link)

**What you'll see:**
- Role details page
- Tabs: Permissions, Trust relationships, Tags, etc.
- Under Permissions tab, you'll see existing policies (like AmazonS3ReadOnlyAccess)

---

### 2.3 Add S3 Full Access Policy

**Action:**
1. Make sure you're on the **Permissions** tab
2. Click the **"Add permissions"** button (it's a dropdown)
3. Select **"Attach policies"** from the dropdown
4. You'll see a page with a search box and list of policies
5. In the search box, type: `AmazonS3FullAccess`
6. You'll see **AmazonS3FullAccess** policy appear
7. Check the checkbox next to **AmazonS3FullAccess**
8. Scroll down and click orange **"Add permissions"** button

**What you'll see:**
- A green success message: "Successfully attached policies to AgrinextEC2Role"
- The policy list now shows both:
  - AmazonS3ReadOnlyAccess (old)
  - AmazonS3FullAccess (new)

---

### 2.4 (Optional) Remove Old ReadOnly Policy

**Action:**
1. Find **AmazonS3ReadOnlyAccess** in the policy list
2. Check the checkbox next to it
3. Click **"Remove"** button
4. Confirm removal

**Note:** This is optional. Having both policies is fine, but we only need FullAccess.

---

### ✅ STEP 2 COMPLETE

**Verification:**
- AgrinextEC2Role should have **AmazonS3FullAccess** policy attached
- This allows EC2 to upload images to S3

**Proceed to Step 3!**

---

## STEP 3: Connect to EC2 Instance (2 minutes)

### 3.1 Open EC2 Instances Page

**Action:** Click this link:
```
https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:
```

**What you'll see:**
- List of EC2 instances
- You should see your instance with ID: `i-004ef74f37ba59da1`
- Instance state should be: **Running** (green dot)

---

### 3.2 Select Your Instance

**Action:**
1. Find the instance with ID: `i-004ef74f37ba59da1`
2. Click the checkbox to the left of the instance ID
3. The row will be highlighted in blue

**What you'll see:**
- Instance details appear at the bottom
- Public IPv4 address: `3.239.184.220`
- Instance state: Running

---

### 3.3 Connect via Session Manager

**Action:**
1. With the instance selected, click the **"Connect"** button at the top
2. A new page opens with connection options
3. You'll see 4 tabs: EC2 Instance Connect, Session Manager, SSH client, EC2 serial console
4. Click the **"Session Manager"** tab
5. You'll see a message about Session Manager
6. Click the orange **"Connect"** button at the bottom

**What happens:**
- A new browser tab/window opens
- You'll see a black terminal screen
- After a few seconds, you'll see a command prompt like:
  ```
  sh-4.2$
  ```
  or
  ```
  [ssm-user@ip-xxx-xxx-xxx-xxx ~]$
  ```

---

### 3.4 Verify Connection

**Action:** Type this command and press Enter:
```bash
whoami
```

**Expected output:**
```
ssm-user
```
or
```
ec2-user
```

**Action:** Type this command:
```bash
pwd
```

**Expected output:**
```
/home/ssm-user
```
or
```
/home/ec2-user
```

---

### ✅ STEP 3 COMPLETE

**Verification:**
- You have a terminal open in your browser
- You can type commands
- You're logged in as `ssm-user` or `ec2-user`

**Keep this terminal tab open! Proceed to Step 4!**

---

## STEP 4: Download and Run Deployment Script (90 minutes)

### 4.1 Download Deployment Script from S3

**Action:** In the EC2 terminal, copy and paste these commands (one at a time):

```bash
cd ~
```
Press Enter. (This takes you to home directory)

```bash
aws s3 cp s3://agrinext-images-1772367775698/phase2/deploy/deploy-phase2.sh . --region us-east-1
```
Press Enter.

**Expected output:**
```
download: s3://agrinext-images-1772367775698/phase2/deploy/deploy-phase2.sh to ./deploy-phase2.sh
```

---

### 4.2 Make Script Executable

**Action:** Run this command:
```bash
chmod +x deploy-phase2.sh
```
Press Enter. (No output is normal)

---

### 4.3 Verify Download

**Action:** Run this command:
```bash
ls -lh deploy-phase2.sh
```

**Expected output:**
```
-rwxr-xr-x 1 ssm-user ssm-user 12K Mar  2 10:00 deploy-phase2.sh
```

The `x` in permissions means it's executable ✅

---

### 4.4 Run the Deployment Script

**Action:** Run this command:
```bash
./deploy-phase2.sh
```
Press Enter.

**What happens:**
The script will start running and show progress messages.

---

### 4.5 Watch the Deployment Progress

You'll see output like this (this will take about 30-40 minutes before it pauses):

```
[2026-03-02 10:00:00] Starting Phase 2 deployment...
[2026-03-02 10:00:01] Performing pre-deployment checks...
✓ Pre-deployment checks passed

[2026-03-02 10:00:05] Creating backup of Phase 1...
[2026-03-02 10:00:10] Backing up Phase 1 code...
[2026-03-02 10:00:15] Backing up database...
✓ Backup completed: /home/ssm-user/agrinext-backups/20260302_100005

[2026-03-02 10:00:20] Downloading Phase 2 code from S3...
✓ Phase 2 code downloaded

[2026-03-02 10:00:25] Installing Phase 2 dependencies...
[2026-03-02 10:00:30] Running npm install...
```

**This will continue for 20-30 minutes with npm install output.**

Then:
```
[2026-03-02 10:20:00] Building TypeScript code...
```

**This will take 5-10 minutes.**

Then:
```
✓ Dependencies installed and code built

[2026-03-02 10:30:00] Configuring environment variables...
✓ Copied existing .env file

⚠️ Please update .env file with your API keys before continuing.

Required: TWILIO_*, OPENAI_API_KEY, HUGGINGFACE_API_KEY, GOOGLE_PROJECT_ID

Press Enter after updating .env file...
```

---

### 🛑 SCRIPT PAUSED - DO NOT PRESS ENTER YET!

The script is now waiting for you to add your API keys.

**Keep this terminal tab open and proceed to Step 5!**

---

## STEP 5: Add Your API Keys (10 minutes)

### 5.1 Open a Second EC2 Terminal

**Action:**
1. Go back to the AWS EC2 Console tab (don't close the terminal!)
2. The instance `i-004ef74f37ba59da1` should still be selected
3. Click **"Connect"** button again
4. Click **"Session Manager"** tab
5. Click **"Connect"** button
6. A **NEW** terminal tab will open

**Now you have TWO terminal tabs:**
- Tab 1: Deployment script waiting (don't touch this!)
- Tab 2: New terminal for editing .env file (use this one)

---

### 5.2 Navigate to .env File

**Action:** In the **NEW** terminal tab (Tab 2), run:

```bash
cd ~/agrinext-phase2/backend
```

```bash
ls -lh .env
```

**Expected output:**
```
-rw-r--r-- 1 ssm-user ssm-user 2.1K Mar  2 10:30 .env
```

The .env file exists ✅

---

### 5.3 Open .env File in Editor

**Action:** Run this command:
```bash
nano .env
```

**What you'll see:**
- The nano text editor opens
- You'll see the .env file content with many lines
- Use arrow keys to navigate
- You can edit text directly

---

### 5.4 Find and Update Twilio Keys

**Action:**
1. Use arrow keys to scroll down
2. Find the section that says:
   ```env
   # Twilio
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Replace the `xxx` values with your actual Twilio credentials:
   - Move cursor to the `A` in `ACxxx...`
   - Delete the placeholder text
   - Type your actual Account SID
   - Do the same for Auth Token and Phone Number

**Your Twilio values should look like:**
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef
TWILIO_PHONE_NUMBER=+15551234567
```

---

### 5.5 Find and Update OpenAI Key

**Action:**
1. Scroll down to find:
   ```env
   # OpenAI
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
2. Replace the `sk-xxx...` with your actual OpenAI API key

**Should look like:**
```env
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP
```

---

### 5.6 Find and Update Hugging Face Key

**Action:**
1. Scroll down to find:
   ```env
   # Hugging Face
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   HUGGINGFACE_MODEL=nateraw/vit-base-beans-disease
   ```
2. Replace `hf_xxx...` with your actual Hugging Face token
3. Update the model name if you chose a different one

**Should look like:**
```env
HUGGINGFACE_API_KEY=hf_abcdefghijklmnopqrstuvwxyz1234567890
HUGGINGFACE_MODEL=nateraw/vit-base-beans-disease
```

---

### 5.7 Find and Update Google Cloud Project ID

**Action:**
1. Scroll down to find:
   ```env
   # Google Translate
   GOOGLE_PROJECT_ID=agrinext-translation-123456
   ```
2. Replace with your actual Google Cloud project ID

**Should look like:**
```env
GOOGLE_PROJECT_ID=agrinext-translation-123456
```

---

### 5.8 Generate and Add JWT Secrets

**Action:**
1. Press `Ctrl + X` to exit nano (don't save yet!)
2. Press `N` (for No, don't save)
3. You're back at the command prompt

**Run these commands to generate secrets:**

```bash
openssl rand -base64 32
```

**Copy the output** (it will look like: `xK9mP2vL8nQ4wR7tY3uI6oP1aS5dF0gH2jK4lZ8xC9vB3nM6qW1eR5tY8uI0oP3a`)

```bash
openssl rand -base64 32
```

**Copy this output too** (different from the first one)

---

### 5.9 Add JWT Secrets to .env

**Action:**
1. Open nano again:
   ```bash
   nano .env
   ```
2. Scroll down to find:
   ```env
   # JWT
   JWT_SECRET=GENERATE_NEW_SECRET_HERE
   REFRESH_TOKEN_SECRET=GENERATE_NEW_SECRET_HERE
   ```
3. Replace `GENERATE_NEW_SECRET_HERE` with the first secret you generated
4. Replace the second one with the second secret

**Should look like:**
```env
JWT_SECRET=xK9mP2vL8nQ4wR7tY3uI6oP1aS5dF0gH2jK4lZ8xC9vB3nM6qW1eR5tY8uI0oP3a
REFRESH_TOKEN_SECRET=aS5dF0gH2jK4lZ8xC9vB3nM6qW1eR5tY8uI0oP3axK9mP2vL8nQ4wR7tY3uI6oP1
```

---

### 5.10 Save the .env File

**Action:**
1. Press `Ctrl + X` (to exit)
2. Press `Y` (to confirm save)
3. Press `Enter` (to confirm filename)

**You'll see:**
```
File Name to Write: .env
```
Just press Enter.

You're back at the command prompt ✅

---

### 5.11 Verify Your Changes

**Action:** Run this command:
```bash
cat .env | grep -E "TWILIO_ACCOUNT_SID|OPENAI_API_KEY|HUGGINGFACE_API_KEY|GOOGLE_PROJECT_ID|JWT_SECRET="
```

**Expected output:**
You should see your actual API keys (not the xxx placeholders):
```
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz...
HUGGINGFACE_API_KEY=hf_abcdefghijklmnopqrstuvwxyz...
GOOGLE_PROJECT_ID=agrinext-translation-123456
JWT_SECRET=xK9mP2vL8nQ4wR7tY3uI6oP1aS5dF0gH...
```

If you see your actual keys, you're good! ✅

---

### 5.12 Go Back to First Terminal Tab

**Action:**
1. Switch back to the **FIRST** terminal tab (where the deployment script is waiting)
2. You should still see:
   ```
   Press Enter after updating .env file...
   ```

---

### 5.13 Continue Deployment

**Action:** Press **Enter**

The script will now continue automatically!

---

### 4.6 Watch Remaining Deployment Steps

You'll see:

```
[2026-03-02 10:40:00] Running database migration...
[2026-03-02 10:40:05] Applying schema changes...
```

**This takes 5 minutes.**

```
✓ Database migration completed

[2026-03-02 10:45:00] Checking IAM role permissions...
✓ S3 write access confirmed

[2026-03-02 10:45:05] Stopping Phase 1 backend...
✓ Phase 1 backend stopped

[2026-03-02 10:45:10] Starting Phase 2 backend...
✓ Phase 2 backend started successfully

[2026-03-02 10:45:15] Waiting for server to start...
✓ Phase 2 backend started successfully

[2026-03-02 10:45:20] Verifying deployment...
[2026-03-02 10:45:25] Testing health endpoint...
✓ Health check passed
[2026-03-02 10:45:30] Testing API version endpoint...
✓ API version check passed
[2026-03-02 10:45:35] Testing database connection...
✓ Database connection verified
```

---

### 4.7 Deployment Complete!

You'll see the final summary:

```
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

Next Steps:
  1. Test all API endpoints
  2. Configure mobile app with new endpoints
  3. Monitor logs for 24 hours
  4. Set up external service accounts (Twilio, OpenAI, etc.)

============================================
```

---

### ✅ STEP 4 & 5 COMPLETE!

**Proceed to Step 6 for verification!**

---

## STEP 6: Verify Deployment (10 minutes)

### 6.1 Test Health Endpoint (Local)

**Action:** In the EC2 terminal, run:
```bash
curl http://localhost:3000/health
```

**Expected output:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-02T10:45:40.123Z",
  "uptime": 123.45,
  "environment": "production",
  "services": {
    "database": "connected"
  }
}
```

**Check:**
- ✅ `"status": "healthy"`
- ✅ `"database": "connected"`

---

### 6.2 Test API Version Endpoint

**Action:** Run:
```bash
curl http://localhost:3000/api/v1
```

**Expected output:**
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

**Check:**
- ✅ Shows all endpoints

---

### 6.3 Check PM2 Status

**Action:** Run:
```bash
pm2 status
```

**Expected output:**
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name             │ mode    │ ↺      │ status   │ cpu    │
├─────┼──────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ agrinext-api     │ fork    │ 0       │ online   │ 0%     │
└─────┴──────────────────┴─────────┴─────────┴──────────┴────────┘
```

**Check:**
- ✅ status: **online** (not stopped or errored)

---

### 6.4 Check Logs for Errors

**Action:** Run:
```bash
pm2 logs agrinext-api --lines 20
```

**Look for:**
- ✅ "🚀 Agrinext server running on port 3000"
- ✅ "Environment: production"
- ✅ "API Version: v1"
- ❌ No error messages (no lines with "ERROR" or "Error:")

---

### 6.5 Test Government Schemes Endpoint

**Action:** Run:
```bash
curl http://localhost:3000/api/v1/schemes
```

**Expected output:**
A JSON array with 5 government schemes (PM-KISAN, PMFBY, KCC, etc.)

**Check:**
- ✅ Returns JSON array
- ✅ Has 5 schemes

---

### 6.6 Test from Your Browser (Public Access)

**Action:** Open these URLs in your web browser:

1. http://3.239.184.220:3000/health
2. http://3.239.184.220:3000/api/v1

**Expected:**
- Both URLs return JSON responses
- No connection errors

---

### 6.7 Test Database Connection

**Action:** In EC2 terminal, run:
```bash
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com -U postgres -d agrinext_mvp -c "SELECT COUNT(*) FROM users;"
```

**Expected output:**
```
 count 
-------
     0
(1 row)
```

**Check:**
- ✅ Connection successful
- ✅ Returns a count (even if 0)

---

### ✅ STEP 6 COMPLETE - Deployment Verified!

**All checks passed? Congratulations! 🎉**

Your Phase 2 deployment is successful!

---

## 🎉 DEPLOYMENT COMPLETE!

### What's Working:

✅ Phase 2 backend running on EC2  
✅ Database migrated to Phase 2 schema  
✅ All API endpoints available  
✅ External services configured (Twilio, OpenAI, Hugging Face, Google Cloud)  
✅ S3 write permissions enabled  
✅ Health check passing  
✅ Database connected  

### Next Steps:

1. **Monitor for 24 hours**
   - Check logs: `pm2 logs agrinext-api`
   - Monitor errors
   - Track API usage

2. **Test with Mobile App**
   - Update API URL to: `http://3.239.184.220:3000`
   - Test authentication (OTP)
   - Test disease detection
   - Test advisory feature

3. **Monitor Costs**
   - AWS: $0/month (Free Tier)
   - Twilio: Check usage dashboard
   - OpenAI: Check usage dashboard
   - Google Cloud: Check billing

4. **Set Up Monitoring** (Optional)
   - CloudWatch alarms
   - PM2 monitoring
   - Database metrics

---

## 📊 Deployment Summary

**Time Taken:** ~2 hours  
**Downtime:** 5-10 minutes  
**Files Uploaded:** 3  
**Database Tables:** 8 (migrated)  
**API Endpoints:** 15+  
**Cost:** $0 AWS + $8-18/month external services  

---

## 🆘 Troubleshooting

If something went wrong, check:

1. **Logs:** `pm2 logs agrinext-api --lines 100`
2. **Deployment log:** `cat ~/phase2-deployment.log`
3. **PM2 status:** `pm2 status`
4. **Database:** Test connection with psql command above

**Need to rollback?**
```bash
pm2 stop agrinext-api
pm2 delete agrinext-api
cd ~/agrinext/backend
pm2 start src/server.js --name agrinext-api
```

---

**Congratulations on completing the deployment! 🚀**

