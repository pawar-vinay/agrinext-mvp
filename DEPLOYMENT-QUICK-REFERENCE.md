# Phase 2 Deployment - Quick Reference Card

**Print this page and keep it handy during deployment**

---

## Infrastructure Details

| Resource | Value |
|----------|-------|
| **EC2 Instance ID** | i-004ef74f37ba59da1 |
| **EC2 Public IP** | 3.239.184.220 |
| **RDS Endpoint** | agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com |
| **Database Name** | agrinext_mvp |
| **Database User** | postgres |
| **Database Password** | Agrinextow7s74of! |
| **S3 Bucket** | agrinext-images-1772367775698 |
| **Region** | us-east-1 |

---

## Essential Commands

### Connect to EC2
```bash
# Via AWS Console
https://console.aws.amazon.com/ec2
→ Select i-004ef74f37ba59da1
→ Connect → Session Manager → Connect
```

### PM2 Commands
```bash
pm2 status                    # Check status
pm2 logs agrinext-api         # View logs
pm2 restart agrinext-api      # Restart
pm2 stop agrinext-api         # Stop
pm2 monit                     # Monitor resources
```

### Database Commands
```bash
# Connect to database
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres -d agrinext_mvp

# Quick queries
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM government_schemes;
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

### Health Checks
```bash
# Local (on EC2)
curl http://localhost:3000/health
curl http://localhost:3000/api/v1

# Remote (from browser)
http://3.239.184.220:3000/health
http://3.239.184.220:3000/api/v1
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Twilio account created (Account SID, Auth Token, Phone Number)
- [ ] OpenAI API key obtained
- [ ] Hugging Face API key obtained
- [ ] Google Cloud project created (Project ID)
- [ ] Code uploaded to S3
- [ ] IAM role updated for S3 write access

### During Deployment
- [ ] Connected to EC2 via Session Manager
- [ ] Downloaded deployment script
- [ ] Script running (./deploy-phase2.sh)
- [ ] Updated .env file with API keys
- [ ] Script completed successfully

### Post-Deployment
- [ ] Health endpoint returns "healthy"
- [ ] API version endpoint works
- [ ] PM2 shows backend as "online"
- [ ] No errors in logs
- [ ] Database connection verified
- [ ] Test OTP sending
- [ ] Test government schemes endpoint

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1` | GET | API info |
| `/api/v1/auth/send-otp` | POST | Send OTP |
| `/api/v1/auth/verify-otp` | POST | Verify OTP |
| `/api/v1/auth/register` | POST | Register user |
| `/api/v1/auth/refresh-token` | POST | Refresh token |
| `/api/v1/auth/logout` | POST | Logout |
| `/api/v1/users/profile` | GET | Get profile |
| `/api/v1/users/profile` | PUT | Update profile |
| `/api/v1/diseases/detect` | POST | Detect disease |
| `/api/v1/diseases/history` | GET | Detection history |
| `/api/v1/diseases/:id` | GET | Detection detail |
| `/api/v1/advisories/query` | POST | Ask question |
| `/api/v1/advisories/history` | GET | Advisory history |
| `/api/v1/advisories/:id/rate` | PUT | Rate advisory |
| `/api/v1/schemes` | GET | List schemes |
| `/api/v1/schemes/:id` | GET | Scheme detail |

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
pm2 logs agrinext-api --lines 100

# Check port
sudo netstat -tlnp | grep 3000

# Restart
pm2 restart agrinext-api
```

### Database Connection Failed
```bash
# Test connection
psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com \
     -U postgres -d agrinext_mvp -c "SELECT 1;"

# Check .env file
cat ~/agrinext-phase2/backend/.env | grep DB_
```

### S3 Upload Fails
```bash
# Test S3 access
aws s3 ls s3://agrinext-images-1772367775698/

# Check IAM role
aws sts get-caller-identity
```

### External API Fails
```bash
# Check API keys
cat ~/agrinext-phase2/backend/.env | grep -E "TWILIO|OPENAI|HUGGING"

# Test Twilio
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
  -d "From=$TWILIO_PHONE_NUMBER" \
  -d "To=+1234567890" \
  -d "Body=Test"
```

---

## Rollback (Emergency)

```bash
# 1. Stop Phase 2
pm2 stop agrinext-api
pm2 delete agrinext-api

# 2. Find backup
ls -lt ~/agrinext-backups/

# 3. Restore database
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

## External Service URLs

| Service | URL |
|---------|-----|
| **Twilio Console** | https://console.twilio.com |
| **OpenAI Dashboard** | https://platform.openai.com/account/api-keys |
| **Hugging Face** | https://huggingface.co/settings/tokens |
| **Google Cloud Console** | https://console.cloud.google.com |
| **AWS EC2 Console** | https://console.aws.amazon.com/ec2 |
| **AWS RDS Console** | https://console.aws.amazon.com/rds |
| **AWS S3 Console** | https://s3.console.aws.amazon.com |
| **AWS IAM Console** | https://console.aws.amazon.com/iam |

---

## Environment Variables Template

```env
# Server
PORT=3000
NODE_ENV=production
API_VERSION=v1

# Database
DB_HOST=agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=Agrinextow7s74of!
DB_SSL=false
DB_POOL_MIN=10
DB_POOL_MAX=50

# JWT
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=<generate-with-openssl-rand-base64-32>
REFRESH_TOKEN_EXPIRES_IN=30d

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3
AWS_ACCESS_KEY_ID=<from-ec2-iam-role>
AWS_SECRET_ACCESS_KEY=<from-ec2-iam-role>
AWS_REGION=us-east-1
AWS_S3_BUCKET=agrinext-images-1772367775698

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500

# Hugging Face
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=your-model-name

# Google Translate
GOOGLE_PROJECT_ID=agrinext-translation

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OTP
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000,http://3.239.184.220:3000
```

---

## Cost Tracking

### Monthly Costs (First 12 Months)
- AWS: $0 (Free Tier)
- Twilio: ~$5-10
- OpenAI: ~$2-5
- Google Translate: ~$1-3
- **Total**: ~$10-20/month

### After Free Tier (Month 13+)
- AWS: ~$26
- External Services: ~$10-20
- **Total**: ~$36-46/month

---

## Support Contacts

| Issue | Contact |
|-------|---------|
| **AWS Issues** | AWS Support Console |
| **Twilio Issues** | https://support.twilio.com |
| **OpenAI Issues** | https://help.openai.com |
| **Deployment Issues** | Check logs: pm2 logs agrinext-api |

---

## Timeline

| Phase | Duration |
|-------|----------|
| External service setup | 30-60 min |
| Code upload | 5 min |
| IAM role update | 5 min |
| Script execution | 60-90 min |
| Verification | 10 min |
| Testing | 15 min |
| **Total** | **2-3 hours** |

**Downtime**: 5-10 minutes

---

**Print Date**: March 2, 2026  
**Version**: 1.0  
**Status**: Ready for Deployment

