# Agrinext Phase 2 - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Agrinext MVP Phase 2 to production.

---

## Prerequisites

### Required Accounts and Services
- [ ] AWS Account with appropriate permissions
- [ ] Twilio Account (SMS service)
- [ ] OpenAI API Account
- [ ] Hugging Face API Account
- [ ] Roboflow API Account
- [ ] Google Cloud Account (Translation API)
- [ ] Apple Developer Account (iOS deployment)
- [ ] Google Play Console Account (Android deployment)
- [ ] Domain name (optional but recommended)

### Required Tools
- [ ] AWS CLI installed and configured
- [ ] Node.js 18+ installed
- [ ] PostgreSQL client installed
- [ ] Git installed
- [ ] Xcode (for iOS builds)
- [ ] Android Studio (for Android builds)

---

## Phase 1: Infrastructure Setup

### Step 1: Create AWS Resources

#### 1.1 Create VPC and Security Groups

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=agrinext-vpc}]'

# Note the VPC ID from output
export VPC_ID=<vpc-id>

# Create Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=agrinext-igw}]'

export IGW_ID=<igw-id>

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID

# Create Subnets
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=agrinext-public-subnet-1}]'

aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=agrinext-public-subnet-2}]'

# Create Security Group for EC2
aws ec2 create-security-group \
  --group-name agrinext-ec2-sg \
  --description "Security group for Agrinext EC2 instance" \
  --vpc-id $VPC_ID

export EC2_SG_ID=<security-group-id>

# Allow SSH (port 22)
aws ec2 authorize-security-group-ingress \
  --group-id $EC2_SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Allow HTTP (port 80)
aws ec2 authorize-security-group-ingress \
  --group-id $EC2_SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow HTTPS (port 443)
aws ec2 authorize-security-group-ingress \
  --group-id $EC2_SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow Node.js app (port 3000)
aws ec2 authorize-security-group-ingress \
  --group-id $EC2_SG_ID \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0

# Create Security Group for RDS
aws ec2 create-security-group \
  --group-name agrinext-rds-sg \
  --description "Security group for Agrinext RDS instance" \
  --vpc-id $VPC_ID

export RDS_SG_ID=<security-group-id>

# Allow PostgreSQL from EC2 security group
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group $EC2_SG_ID
```

#### 1.2 Create RDS Database

```bash
# Create DB Subnet Group
aws rds create-db-subnet-group \
  --db-subnet-group-name agrinext-db-subnet-group \
  --db-subnet-group-description "Subnet group for Agrinext RDS" \
  --subnet-ids subnet-xxx subnet-yyy

# Create RDS Instance
aws rds create-db-instance \
  --db-instance-identifier agrinext-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username agrinextadmin \
  --master-user-password <SECURE_PASSWORD> \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids $RDS_SG_ID \
  --db-subnet-group-name agrinext-db-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --multi-az \
  --publicly-accessible false \
  --storage-encrypted \
  --enable-cloudwatch-logs-exports '["postgresql"]' \
  --tags Key=Name,Value=agrinext-production-db

# Wait for RDS to be available (takes 5-10 minutes)
aws rds wait db-instance-available --db-instance-identifier agrinext-db

# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier agrinext-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

#### 1.3 Create S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://agrinext-images-production --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket agrinext-images-production \
  --versioning-configuration Status=Enabled

# Configure CORS
cat > cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket agrinext-images-production \
  --cors-configuration file://cors.json

# Configure lifecycle policy (delete old images after 90 days)
cat > lifecycle.json << EOF
{
  "Rules": [
    {
      "Id": "DeleteOldImages",
      "Status": "Enabled",
      "Prefix": "",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket agrinext-images-production \
  --lifecycle-configuration file://lifecycle.json

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket agrinext-images-production \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### 1.4 Create EC2 Instance

```bash
# Create key pair
aws ec2 create-key-pair \
  --key-name agrinext-key \
  --query 'KeyMaterial' \
  --output text > agrinext-key.pem

chmod 400 agrinext-key.pem

# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name agrinext-key \
  --security-group-ids $EC2_SG_ID \
  --subnet-id <subnet-id> \
  --associate-public-ip-address \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=agrinext-backend}]' \
  --user-data file://ec2-user-data.sh

# Get instance public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=agrinext-backend" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

---

## Phase 2: Database Setup

### Step 2: Initialize Database

```bash
# Connect to RDS
export DB_HOST=<rds-endpoint>
export DB_NAME=agrinext
export DB_USER=agrinextadmin
export DB_PASSWORD=<password>

# Create database
psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Run schema
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/schema.sql

# Run migrations
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/migrations/001_add_rate_limit_tables.sql

# Seed data (government schemes)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/seed-data.sql

# Verify tables
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\dt"
```

---

## Phase 3: Backend Deployment

### Step 3: Deploy Backend to EC2

```bash
# SSH into EC2
ssh -i agrinext-key.pem ec2-user@<ec2-public-ip>

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL client
sudo yum install -y postgresql15

# Clone repository (or upload files)
git clone <your-repo-url> /home/ec2-user/agrinext
cd /home/ec2-user/agrinext/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000

# Database
DB_HOST=$DB_HOST
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT
JWT_SECRET=<generate-secure-random-string>
JWT_REFRESH_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# Twilio
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>

# OpenAI
OPENAI_API_KEY=<your-openai-key>

# Hugging Face
HUGGINGFACE_API_KEY=<your-huggingface-key>

# Roboflow
ROBOFLOW_API_KEY=<your-roboflow-key>

# AWS
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=us-east-1
S3_BUCKET=agrinext-images-production

# Google Translate
GOOGLE_TRANSLATE_API_KEY=<your-google-translate-key>

# CORS
CORS_ORIGIN=*
EOF

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name agrinext-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs

# Check status
pm2 status
pm2 logs agrinext-backend
```

### Step 4: Configure Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo yum install -y nginx

# Configure Nginx
sudo tee /etc/nginx/conf.d/agrinext.conf << EOF
server {
    listen 80;
    server_name api.agrinext.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test Nginx configuration
sudo nginx -t
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.agrinext.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Phase 4: Mobile App Deployment

### Step 6: Prepare Mobile App for Production

#### 6.1 Update Configuration

```typescript
// mobile/src/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://api.agrinext.com/api/v1', // Production URL
  TIMEOUT: {
    DEFAULT: 10000,
    DETECTION: 30000,
  },
};
```

#### 6.2 Update App Version

```json
// mobile/app.json
{
  "expo": {
    "name": "Agrinext",
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

### Step 7: Build iOS App

```bash
cd mobile

# Install dependencies
npm install

# Install CocoaPods dependencies
cd ios
pod install
cd ..

# Open Xcode
open ios/AgrinextMobile.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device" as target
# 2. Product > Archive
# 3. Distribute App > App Store Connect
# 4. Upload to App Store Connect
# 5. Submit for review in App Store Connect
```

### Step 8: Build Android App

```bash
cd mobile

# Generate release keystore (first time only)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore agrinext-release.keystore \
  -alias agrinext-key \
  -keyalg RSA -keysize 2048 -validity 10000

# Add to android/gradle.properties
cat >> android/gradle.properties << EOF
AGRINEXT_RELEASE_STORE_FILE=agrinext-release.keystore
AGRINEXT_RELEASE_KEY_ALIAS=agrinext-key
AGRINEXT_RELEASE_STORE_PASSWORD=<your-password>
AGRINEXT_RELEASE_KEY_PASSWORD=<your-password>
EOF

# Build release APK
cd android
./gradlew assembleRelease

# Build release AAB (for Play Store)
./gradlew bundleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
# AAB location: android/app/build/outputs/bundle/release/app-release.aab

# Upload AAB to Google Play Console
# 1. Go to Google Play Console
# 2. Select your app
# 3. Production > Create new release
# 4. Upload app-release.aab
# 5. Fill in release notes
# 6. Review and rollout
```

---

## Phase 5: Monitoring and Logging

### Step 9: Setup CloudWatch

```bash
# Install CloudWatch agent on EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/config.json << EOF
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ec2-user/.pm2/logs/agrinext-backend-out.log",
            "log_group_name": "/agrinext/backend/application",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/home/ec2-user/.pm2/logs/agrinext-backend-error.log",
            "log_group_name": "/agrinext/backend/errors",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "Agrinext",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          {"name": "cpu_usage_idle", "rename": "CPU_IDLE", "unit": "Percent"}
        ],
        "totalcpu": false
      },
      "disk": {
        "measurement": [
          {"name": "used_percent", "rename": "DISK_USED", "unit": "Percent"}
        ]
      },
      "mem": {
        "measurement": [
          {"name": "mem_used_percent", "rename": "MEM_USED", "unit": "Percent"}
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

### Step 10: Create CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name agrinext-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# High memory alarm
aws cloudwatch put-metric-alarm \
  --alarm-name agrinext-high-memory \
  --alarm-description "Alert when memory exceeds 80%" \
  --metric-name MEM_USED \
  --namespace Agrinext \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# RDS CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name agrinext-rds-high-cpu \
  --alarm-description "Alert when RDS CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=DBInstanceIdentifier,Value=agrinext-db
```

---

## Phase 6: Post-Deployment Verification

### Step 11: Smoke Tests

```bash
# Test health endpoint
curl https://api.agrinext.com/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"..."}

# Test API version endpoint
curl https://api.agrinext.com/api/v1

# Test OTP sending (with test number)
curl -X POST https://api.agrinext.com/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9999999999"}'
```

### Step 12: Load Testing

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml

# Monitor during load test
pm2 monit
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database backup taken
- [ ] Rollback plan documented

### Infrastructure
- [ ] VPC and subnets created
- [ ] Security groups configured
- [ ] RDS instance running
- [ ] S3 bucket created
- [ ] EC2 instance running

### Backend
- [ ] Code deployed to EC2
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] PM2 process running
- [ ] Nginx configured
- [ ] SSL certificate installed

### Mobile App
- [ ] Production API URL configured
- [ ] App version updated
- [ ] iOS app built and uploaded
- [ ] Android app built and uploaded
- [ ] App Store submission complete
- [ ] Play Store submission complete

### Monitoring
- [ ] CloudWatch agent installed
- [ ] CloudWatch alarms configured
- [ ] Log aggregation working
- [ ] Metrics being collected

### Verification
- [ ] Health check passing
- [ ] API endpoints responding
- [ ] Mobile app connecting
- [ ] Authentication working
- [ ] Core features functional

---

## Rollback Procedure

If issues are discovered post-deployment:

1. **Stop current version**
   ```bash
   pm2 stop agrinext-backend
   ```

2. **Restore previous version**
   ```bash
   cd /home/ec2-user/agrinext/backend
   git checkout <previous-tag>
   npm install
   npm run build
   pm2 restart agrinext-backend
   ```

3. **Restore database** (if needed)
   ```bash
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
   ```

4. **Verify rollback**
   ```bash
   curl https://api.agrinext.com/health
   ```

---

## Support and Maintenance

### Daily Tasks
- Monitor CloudWatch dashboards
- Review error logs
- Check PM2 status
- Monitor database performance

### Weekly Tasks
- Review user feedback
- Analyze usage metrics
- Check disk space
- Review security logs

### Monthly Tasks
- Database backup verification
- Security updates
- Performance optimization
- Cost analysis

---

## Troubleshooting

### Backend Not Starting
```bash
# Check PM2 logs
pm2 logs agrinext-backend

# Check environment variables
pm2 env 0

# Restart PM2
pm2 restart agrinext-backend
```

### Database Connection Issues
```bash
# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check security group
aws ec2 describe-security-groups --group-ids $RDS_SG_ID
```

### High Memory Usage
```bash
# Check memory
free -h

# Restart PM2
pm2 restart agrinext-backend

# Check for memory leaks
pm2 monit
```

---

## Contact Information

**Technical Support**: tech@agrinext.com  
**Emergency Contact**: +91-XXXXXXXXXX  
**Documentation**: https://docs.agrinext.com

---

**Deployment Status**: ⏳ PENDING  
**Last Updated**: March 2, 2026
