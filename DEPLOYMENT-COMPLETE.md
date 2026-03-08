# 🎉 Agrinext AWS Deployment - COMPLETE

## ✅ Successfully Deployed Resources

### 1. S3 Bucket (Image Storage)
- **Bucket Name**: `agrinext-images-1772367775698`
- **Region**: us-east-1
- **Versioning**: Enabled
- **Status**: ✅ Active

### 2. RDS PostgreSQL Database
- **Instance ID**: `agrinext-db-1772367775698`
- **Database Name**: `agrinext_mvp`
- **Username**: `postgres`
- **Password**: `Agrinextow7s74of!` ⚠️ **SAVE THIS PASSWORD!**
- **Status**: 🔄 Creating (10-15 minutes)
- **Endpoint**: Will be available once creation completes

To get the endpoint:
```bash
# Check RDS status in AWS Console
# Or wait and check: AWS Console → RDS → Databases → agrinext-db-1772367775698
```

### 3. EC2 Instance (Backend Server)
- **Instance ID**: `i-004ef74f37ba59da1`
- **Instance Type**: t3.micro (Free Tier)
- **Public IP**: `3.239.184.220`
- **AMI**: Amazon Linux 2023
- **Status**: ✅ Running

### 4. Security Group
- **ID**: `sg-01402410c86b50f62`
- **Inbound Rules**:
  - Port 22 (SSH) - from anywhere
  - Port 3000 (HTTP) - from anywhere

---

## ⚠️ SSH Access Issue - Solution

The EC2 instance was launched without a key pair. Here are your options:

### Option A: Use AWS Systems Manager (No SSH Key Needed) ✅ RECOMMENDED

1. Go to AWS Console → EC2 → Instances
2. Select instance `i-004ef74f37ba59da1`
3. Click "Connect" button
4. Choose "Session Manager" tab
5. Click "Connect"

This opens a browser-based terminal - no SSH key needed!

### Option B: Create New Instance with Key Pair

If you need SSH access, we can:
1. Create a new key pair
2. Launch a new EC2 instance with that key pair
3. Terminate the old instance

Would you like me to do this?

---

## 📝 Next Steps (Using Systems Manager)

### Step 1: Connect to EC2 via Systems Manager

1. AWS Console → EC2 → Instances
2. Select `i-004ef74f37ba59da1`
3. Click "Connect" → "Session Manager" → "Connect"

### Step 2: Install Node.js (if not auto-installed)

```bash
# Check if Node.js is installed
node --version

# If not installed, run:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
npm install -g pm2
```

### Step 3: Upload Backend Code

Since we can't use SCP without SSH, use one of these methods:

**Method 1: Git Clone (if you have a repo)**
```bash
cd ~
git clone <your-repo-url>
cd <repo-name>/backend
```

**Method 2: Create files manually**
```bash
mkdir -p ~/agrinext/backend
cd ~/agrinext/backend
# Then copy-paste your code files
```

**Method 3: Use S3 to transfer files**
```bash
# On your local machine, upload to S3:
# aws s3 cp backend/ s3://agrinext-images-1772367775698/backend/ --recursive

# On EC2, download from S3:
aws s3 cp s3://agrinext-images-1772367775698/backend/ ~/agrinext/backend/ --recursive
```

### Step 4: Configure Environment Variables

```bash
cd ~/agrinext/backend
nano .env
```

Add this content (update RDS endpoint when available):
```env
# Database (update endpoint when RDS is ready)
DB_HOST=<RDS-ENDPOINT>.rds.amazonaws.com
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=Agrinextow7s74of!

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=agrinext-images-1772367775698

# Server
PORT=3000
NODE_ENV=production
```

### Step 5: Get RDS Endpoint

Wait 10-15 minutes, then:
1. AWS Console → RDS → Databases
2. Click on `agrinext-db-1772367775698`
3. Copy the "Endpoint" value
4. Update the `DB_HOST` in your .env file

### Step 6: Initialize Database

```bash
# Install PostgreSQL client
sudo yum install -y postgresql15

# Run schema (replace <RDS-ENDPOINT> with actual endpoint)
psql -h <RDS-ENDPOINT> -U postgres -d agrinext_mvp -f ~/agrinext/database/schema.sql

# Run seed data
psql -h <RDS-ENDPOINT> -U postgres -d agrinext_mvp -f ~/agrinext/database/seed-data.sql
```

### Step 7: Install Dependencies and Start Server

```bash
cd ~/agrinext/backend
npm install
pm2 start src/server.js --name agrinext-api
pm2 save
pm2 startup
```

### Step 8: Test the Deployment

```bash
# Test locally
curl http://localhost:3000/health

# Test from browser
# Open: http://3.239.184.220:3000/health
```

---

## 💰 Cost Summary

All resources are within AWS Free Tier:
- **S3**: Free (5GB storage)
- **RDS**: Free (750 hours/month)
- **EC2**: Free (750 hours/month)
- **Total**: $0/month (for first 12 months)

---

## 🔧 Troubleshooting

### Can't connect to RDS?
- Check security group allows port 5432
- Ensure RDS is "Available" status
- Verify endpoint is correct

### Can't access health endpoint from browser?
- Check security group allows port 3000
- Ensure server is running: `pm2 status`
- Check logs: `pm2 logs agrinext-api`

### Need to restart server?
```bash
pm2 restart agrinext-api
```

---

## 📊 Deployment Summary

✅ S3 Bucket created
✅ RDS Database creating (10-15 min)
✅ EC2 Instance running
✅ Security Groups configured
⏳ Waiting for RDS endpoint
⏳ Backend code deployment pending

**Next Action**: Use AWS Systems Manager to connect to EC2 and deploy backend code!
