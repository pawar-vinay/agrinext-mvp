# Manual AWS Deployment Steps

Since we're having issues with automated deployment, here's a step-by-step manual approach using the AWS Console.

## Option 1: AWS Console Deployment (Easiest)

### Step 1: Create S3 Bucket
1. Go to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `agrinext-images-[your-name]` (must be globally unique)
4. Region: us-east-1
5. Uncheck "Block all public access" (we'll configure this later)
6. Click "Create bucket"

### Step 2: Create RDS Database
1. Go to AWS Console → RDS
2. Click "Create database"
3. Choose "PostgreSQL"
4. Template: "Free tier"
5. Settings:
   - DB instance identifier: `agrinext-db`
   - Master username: `postgres`
   - Master password: (create a strong password and save it!)
6. Instance configuration: db.t3.micro
7. Storage: 20 GB
8. Connectivity:
   - Public access: Yes
   - VPC security group: Create new → `agrinext-db-sg`
9. Additional configuration:
   - Initial database name: `agrinext_mvp`
10. Click "Create database"
11. Wait 10-15 minutes for creation

### Step 3: Create EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch instance"
3. Name: `agrinext-backend`
4. AMI: Amazon Linux 2023
5. Instance type: t2.micro (Free tier)
6. Key pair: Create new → `agrinext-key` → Download .pem file
7. Network settings:
   - Create security group
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 3000) from anywhere
8. Click "Launch instance"

### Step 4: Configure EC2 Instance
1. Wait for instance to be running
2. Note the Public IPv4 address
3. Connect via SSH:
   ```bash
   ssh -i agrinext-key.pem ec2-user@[EC2-PUBLIC-IP]
   ```

4. Install Node.js:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   ```

5. Install PostgreSQL client:
   ```bash
   sudo yum install -y postgresql15
   ```

6. Install PM2:
   ```bash
   npm install -g pm2
   ```

### Step 5: Deploy Backend Code
1. On your local machine, zip the backend folder
2. Upload to EC2:
   ```bash
   scp -i agrinext-key.pem backend.zip ec2-user@[EC2-PUBLIC-IP]:~/
   ```

3. On EC2, extract and setup:
   ```bash
   unzip backend.zip
   cd backend
   npm install
   ```

4. Create .env file:
   ```bash
   nano .env
   ```
   
   Add:
   ```
   DB_HOST=[RDS-ENDPOINT]
   DB_PORT=5432
   DB_NAME=agrinext_mvp
   DB_USER=postgres
   DB_PASSWORD=[YOUR-DB-PASSWORD]
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=[YOUR-S3-BUCKET-NAME]
   PORT=3000
   NODE_ENV=production
   ```

### Step 6: Initialize Database
1. Get RDS endpoint from AWS Console → RDS → Databases → agrinext-db
2. Run schema:
   ```bash
   psql -h [RDS-ENDPOINT] -U postgres -d agrinext_mvp -f ../database/schema.sql
   ```
3. Run seed data:
   ```bash
   psql -h [RDS-ENDPOINT] -U postgres -d agrinext_mvp -f ../database/seed-data.sql
   ```

### Step 7: Start Backend Server
```bash
cd ~/backend
pm2 start src/server.js --name agrinext-api
pm2 save
pm2 startup
```

### Step 8: Test Deployment
```bash
curl http://localhost:3000/health
```

From your browser:
```
http://[EC2-PUBLIC-IP]:3000/health
```

## Option 2: Quick Test Deployment

If you just want to test locally first:

1. Install PostgreSQL locally
2. Run database setup:
   ```bash
   cd database
   ./setup.ps1
   ```
3. Start backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
4. Test: http://localhost:3000/health

## What You'll Have After Deployment

✅ S3 bucket for image storage
✅ PostgreSQL database with schema and seed data
✅ EC2 instance running Node.js backend
✅ Health endpoint: http://[EC2-IP]:3000/health
✅ API endpoint: http://[EC2-IP]:3000/api/v1

## Estimated Costs

- All resources: FREE (within Free Tier limits)
- After Free Tier: ~$10-15/month

## Need Help?

If you prefer automated deployment, we can:
1. Install AWS CLI on your machine
2. Use the deploy.ps1 script
3. Or I can guide you through AWS CloudFormation

Which approach would you like to take?
