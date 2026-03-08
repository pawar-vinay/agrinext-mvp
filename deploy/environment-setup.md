# Environment Setup Guide

## Overview

This guide helps you set up all required environment variables and external service accounts for the Agrinext deployment.

---

## 1. AWS Account Setup

### Create IAM User

1. Go to AWS Console > IAM > Users
2. Click "Add users"
3. User name: `agrinext-backend`
4. Access type: Programmatic access
5. Attach policies:
   - AmazonS3FullAccess
   - AmazonRDSFullAccess
   - AmazonEC2FullAccess
   - CloudWatchFullAccess
6. Save Access Key ID and Secret Access Key

### Create S3 Bucket

```bash
aws s3 mb s3://agrinext-images-production --region us-east-1
```

### Create RDS Instance

See DEPLOYMENT-GUIDE.md Phase 1, Step 1.2

---

## 2. Twilio Account Setup

### Sign Up

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number

### Get Credentials

1. Go to Console Dashboard
2. Copy Account SID
3. Copy Auth Token
4. Get a phone number:
   - Go to Phone Numbers > Manage > Buy a number
   - Select a number with SMS capability
   - Purchase the number

### Test SMS

```bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \
  --data-urlencode "Body=Test message" \
  --data-urlencode "From=$TWILIO_PHONE_NUMBER" \
  --data-urlencode "To=+919999999999" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

---

## 3. OpenAI Account Setup

### Sign Up

1. Go to https://platform.openai.com/signup
2. Create an account
3. Add payment method (required for API access)

### Get API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name: "Agrinext Production"
4. Copy the API key (shown only once!)

### Set Usage Limits

1. Go to Settings > Limits
2. Set monthly budget limit (e.g., $100)
3. Enable email notifications

### Test API

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 4. Hugging Face Account Setup

### Sign Up

1. Go to https://huggingface.co/join
2. Create an account
3. Verify your email

### Get API Token

1. Go to Settings > Access Tokens
2. Click "New token"
3. Name: "Agrinext Production"
4. Role: Read
5. Copy the token

### Test API

```bash
curl https://api-inference.huggingface.co/models/google/vit-base-patch16-224 \
  -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
  -X POST \
  --data-binary '@test-image.jpg'
```

---

## 5. Roboflow Account Setup

### Sign Up

1. Go to https://roboflow.com/
2. Sign up for an account
3. Create a workspace

### Get API Key

1. Go to Settings > Roboflow API
2. Copy your API key

### Upload Model (if custom)

1. Create a new project
2. Upload training images
3. Annotate images
4. Train model
5. Deploy model

### Test API

```bash
curl -X POST "https://detect.roboflow.com/your-model/1?api_key=$ROBOFLOW_API_KEY" \
  -F "file=@test-image.jpg"
```

---

## 6. Google Cloud Account Setup

### Create Project

1. Go to https://console.cloud.google.com/
2. Create a new project: "Agrinext"
3. Enable billing

### Enable Translation API

1. Go to APIs & Services > Library
2. Search for "Cloud Translation API"
3. Click Enable

### Create API Key

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > API Key
3. Restrict key:
   - API restrictions: Cloud Translation API
   - Application restrictions: None (or IP addresses)
4. Copy the API key

### Test API

```bash
curl "https://translation.googleapis.com/language/translate/v2?key=$GOOGLE_TRANSLATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "Hello",
    "target": "hi"
  }'
```

---

## 7. Apple Developer Account Setup (iOS)

### Enroll

1. Go to https://developer.apple.com/programs/enroll/
2. Enroll in Apple Developer Program ($99/year)
3. Complete enrollment process

### Create App ID

1. Go to Certificates, Identifiers & Profiles
2. Click Identifiers > App IDs
3. Click "+" to create new App ID
4. Description: "Agrinext"
5. Bundle ID: com.agrinext.mobile
6. Capabilities: Push Notifications (if needed)

### Create Provisioning Profile

1. Go to Profiles
2. Click "+" to create new profile
3. Type: App Store
4. Select App ID: Agrinext
5. Select Certificate
6. Download profile

### Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com/
2. My Apps > "+" > New App
3. Platform: iOS
4. Name: Agrinext
5. Bundle ID: com.agrinext.mobile
6. SKU: AGRINEXT001
7. Fill in app information

---

## 8. Google Play Console Setup (Android)

### Create Account

1. Go to https://play.google.com/console/signup
2. Pay one-time $25 registration fee
3. Complete account setup

### Create App

1. Go to All apps > Create app
2. App name: Agrinext
3. Default language: English
4. App or game: App
5. Free or paid: Free
6. Accept declarations

### Set Up App

1. Fill in Store listing
2. Upload screenshots
3. Set content rating
4. Set target audience
5. Create release

### Generate Signing Key

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore agrinext-release.keystore \
  -alias agrinext-key \
  -keyalg RSA -keysize 2048 -validity 10000
```

---

## 9. Generate JWT Secrets

### Generate Secure Random Strings

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT Refresh Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Save these in your .env.production file.

---

## 10. Environment Variables Checklist

### Backend (.env.production)

- [ ] NODE_ENV=production
- [ ] PORT=3000
- [ ] DB_HOST
- [ ] DB_PORT
- [ ] DB_NAME
- [ ] DB_USER
- [ ] DB_PASSWORD
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] TWILIO_ACCOUNT_SID
- [ ] TWILIO_AUTH_TOKEN
- [ ] TWILIO_PHONE_NUMBER
- [ ] OPENAI_API_KEY
- [ ] HUGGINGFACE_API_KEY
- [ ] ROBOFLOW_API_KEY
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION
- [ ] S3_BUCKET
- [ ] GOOGLE_TRANSLATE_API_KEY

### Mobile (.env.production)

- [ ] API_BASE_URL
- [ ] API_TIMEOUT_DEFAULT
- [ ] API_TIMEOUT_DETECTION

---

## 11. Security Best Practices

### Secrets Management

1. **Never commit secrets to Git**
   - Add .env files to .gitignore
   - Use environment variables

2. **Use AWS Secrets Manager** (recommended for production)
   ```bash
   aws secretsmanager create-secret \
     --name agrinext/production/env \
     --secret-string file://.env.production
   ```

3. **Rotate secrets regularly**
   - JWT secrets: Every 90 days
   - API keys: Every 180 days
   - Database passwords: Every 90 days

4. **Use different secrets for each environment**
   - Development
   - Staging
   - Production

### Access Control

1. **Limit AWS IAM permissions**
   - Use principle of least privilege
   - Create separate users for different services

2. **Enable MFA**
   - AWS root account
   - IAM users with admin access

3. **Monitor access logs**
   - CloudTrail for AWS
   - Application logs for API access

---

## 12. Cost Estimation

### Monthly Costs (Approximate)

| Service | Cost |
|---------|------|
| AWS EC2 (t3.medium) | $30 |
| AWS RDS (db.t3.micro) | $15 |
| AWS S3 (100GB storage) | $2 |
| AWS Data Transfer | $10 |
| Twilio SMS (1000 messages) | $10 |
| OpenAI API (moderate usage) | $20 |
| Google Translate API | $5 |
| **Total** | **~$92/month** |

### Cost Optimization Tips

1. Use Reserved Instances for EC2/RDS (save 30-50%)
2. Enable S3 lifecycle policies
3. Monitor and optimize API usage
4. Use CloudWatch to track costs

---

## Support

For help with environment setup:
- Email: tech@agrinext.com
- Documentation: https://docs.agrinext.com
