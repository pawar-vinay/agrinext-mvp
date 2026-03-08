# Agrinext Deployment - Quick Start Checklist

## Pre-Deployment (1-2 days)

### Day 1: Account Setup
- [ ] Create AWS account
- [ ] Create Twilio account and get phone number
- [ ] Create OpenAI account and get API key
- [ ] Create Hugging Face account and get API token
- [ ] Create Roboflow account and get API key
- [ ] Create Google Cloud account and enable Translation API
- [ ] Create Apple Developer account ($99/year)
- [ ] Create Google Play Console account ($25 one-time)

**Estimated Time**: 4-6 hours  
**Cost**: ~$124 (one-time) + monthly service costs

### Day 2: Infrastructure Setup
- [ ] Set up AWS VPC and security groups
- [ ] Create RDS PostgreSQL instance
- [ ] Create S3 bucket for images
- [ ] Launch EC2 instance
- [ ] Configure domain name (optional)
- [ ] Set up SSL certificate

**Estimated Time**: 3-4 hours  
**Cost**: Infrastructure starts running (~$92/month)

---

## Deployment Day

### Morning: Backend Deployment (3-4 hours)

#### Step 1: Database Setup (30 minutes)
```bash
# Set environment variables
export DB_HOST=your-rds-endpoint.rds.amazonaws.com
export DB_PASSWORD=your-secure-password

# Run setup script
cd deploy
chmod +x setup-database.sh
./setup-database.sh
```

**Verification**:
- [ ] Database created
- [ ] All tables created (7 tables)
- [ ] Migrations applied
- [ ] Seed data loaded

#### Step 2: Backend Deployment (1 hour)
```bash
# Create .env.production file
cp backend/.env.production.example backend/.env.production
# Edit backend/.env.production with your values

# Deploy to EC2
export EC2_HOST=your-ec2-public-ip
chmod +x deploy/deploy-backend.sh
./deploy/deploy-backend.sh
```

**Verification**:
- [ ] Application deployed to EC2
- [ ] PM2 process running
- [ ] Health check passing: `curl http://your-ec2-ip/health`
- [ ] API responding: `curl http://your-ec2-ip/api/v1`

#### Step 3: SSL Setup (30 minutes)
```bash
# SSH into EC2
ssh -i agrinext-key.pem ec2-user@your-ec2-ip

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.agrinext.com
```

**Verification**:
- [ ] SSL certificate installed
- [ ] HTTPS working: `curl https://api.agrinext.com/health`
- [ ] Auto-renewal configured

#### Step 4: Monitoring Setup (30 minutes)
```bash
# Install CloudWatch agent (on EC2)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure and start agent
# (See DEPLOYMENT-GUIDE.md Phase 5, Step 9)
```

**Verification**:
- [ ] CloudWatch agent running
- [ ] Logs appearing in CloudWatch
- [ ] Metrics being collected

#### Step 5: Backend Testing (1 hour)
```bash
# Run smoke tests
curl https://api.agrinext.com/health
curl https://api.agrinext.com/api/v1

# Test OTP sending
curl -X POST https://api.agrinext.com/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9999999999"}'

# Run load test
artillery run load-test.yml
```

**Verification**:
- [ ] All endpoints responding
- [ ] OTP sending works
- [ ] Load test passes
- [ ] No errors in logs

---

### Afternoon: Mobile App Deployment (4-6 hours)

#### Step 6: iOS Build (2-3 hours)
```bash
cd mobile

# Update production config
cp .env.production.example .env.production
# Edit with production API URL

# Install dependencies
npm install
cd ios && pod install && cd ..

# Open in Xcode
open ios/AgrinextMobile.xcworkspace
```

**In Xcode**:
- [ ] Update version to 1.0.0
- [ ] Update build number to 1
- [ ] Select "Any iOS Device"
- [ ] Product > Archive
- [ ] Distribute App > App Store Connect
- [ ] Upload to App Store Connect

**In App Store Connect**:
- [ ] Fill in app information
- [ ] Upload screenshots
- [ ] Set pricing (Free)
- [ ] Submit for review

**Estimated Review Time**: 1-3 days

#### Step 7: Android Build (2-3 hours)
```bash
cd mobile

# Generate release keystore (first time only)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore agrinext-release.keystore \
  -alias agrinext-key \
  -keyalg RSA -keysize 2048 -validity 10000

# Build release
cd android
./gradlew bundleRelease

# AAB location: android/app/build/outputs/bundle/release/app-release.aab
```

**In Google Play Console**:
- [ ] Create new app
- [ ] Fill in store listing
- [ ] Upload screenshots
- [ ] Set content rating
- [ ] Upload AAB file
- [ ] Submit for review

**Estimated Review Time**: 1-3 days

---

## Post-Deployment (Ongoing)

### Day 1 After Launch
- [ ] Monitor CloudWatch dashboards
- [ ] Check error logs every 2 hours
- [ ] Monitor user registrations
- [ ] Check API response times
- [ ] Verify SMS delivery
- [ ] Monitor costs

### Week 1 After Launch
- [ ] Daily log review
- [ ] Daily performance check
- [ ] User feedback collection
- [ ] Bug tracking and fixes
- [ ] Database backup verification

### Month 1 After Launch
- [ ] Weekly performance reports
- [ ] Weekly user analytics
- [ ] Monthly cost analysis
- [ ] Security audit
- [ ] Performance optimization

---

## Emergency Contacts

### Technical Issues
- **Backend Issues**: Check PM2 logs, restart if needed
- **Database Issues**: Check RDS status, verify connections
- **API Issues**: Check CloudWatch logs, verify SSL

### Rollback Procedure
```bash
# Stop current version
ssh -i agrinext-key.pem ec2-user@your-ec2-ip
pm2 stop agrinext-backend

# Restore previous version
cd /home/ec2-user/agrinext/backend
git checkout <previous-tag>
npm install
npm run build
pm2 restart agrinext-backend

# Verify
curl https://api.agrinext.com/health
```

---

## Success Criteria

### Technical Success
- [ ] Backend health check passing
- [ ] All API endpoints responding
- [ ] Database queries < 200ms
- [ ] API response times < targets
- [ ] No critical errors in logs
- [ ] SSL certificate valid
- [ ] Monitoring active

### Business Success
- [ ] iOS app approved and live
- [ ] Android app approved and live
- [ ] Users can register
- [ ] Users can detect diseases
- [ ] Users can get advisory
- [ ] Users can view schemes
- [ ] No critical user complaints

---

## Quick Reference

### Important URLs
- **API**: https://api.agrinext.com
- **Health Check**: https://api.agrinext.com/health
- **AWS Console**: https://console.aws.amazon.com
- **App Store Connect**: https://appstoreconnect.apple.com
- **Play Console**: https://play.google.com/console

### Important Commands
```bash
# Check backend status
pm2 status

# View logs
pm2 logs agrinext-backend

# Restart backend
pm2 restart agrinext-backend

# Database backup
./deploy/backup-database.sh

# Deploy new version
./deploy/deploy-backend.sh
```

### Support
- **Email**: tech@agrinext.com
- **Documentation**: See DEPLOYMENT-GUIDE.md
- **Emergency**: Follow rollback procedure

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Account Setup | 1 day | None |
| Infrastructure Setup | 1 day | AWS account |
| Backend Deployment | 4 hours | Infrastructure |
| Mobile App Build | 6 hours | Backend live |
| App Store Review | 1-3 days | App submission |
| **Total** | **3-5 days** | - |

---

## Estimated Costs

### One-Time Costs
- Apple Developer: $99/year
- Google Play: $25 one-time
- **Total**: $124

### Monthly Costs
- AWS Infrastructure: ~$60
- Twilio SMS: ~$10
- OpenAI API: ~$20
- Other APIs: ~$5
- **Total**: ~$95/month

### First Year Total
- One-time: $124
- Monthly: $95 × 12 = $1,140
- **Total**: ~$1,264

---

**Status**: Ready for deployment  
**Last Updated**: March 2, 2026  
**Version**: 1.0.0
