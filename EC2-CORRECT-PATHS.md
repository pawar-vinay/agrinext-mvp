# Correct EC2 Paths for Agrinext

## Important: Actual Directory Structure

The backend is located at:
```
/home/ssm-user/agrinext-phase2/backend/
```

NOT at `/home/ssm-user/agrinext/backend/`

## Corrected Commands for EC2

### Navigate to Backend Directory
```bash
cd /home/ssm-user/agrinext-phase2/backend
```

### Check Current .env File
```bash
cd /home/ssm-user/agrinext-phase2/backend
cat .env
```

### Edit .env File
```bash
cd /home/ssm-user/agrinext-phase2/backend
nano .env
```

### Generate JWT Secrets
```bash
cd /home/ssm-user/agrinext-phase2/backend
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### Find Running Process
```bash
ps aux | grep "tsx src/server.ts" | grep -v grep
```

### Check Backend Logs
```bash
cd /home/ssm-user/agrinext-phase2/backend
tail -f backend.log
```

### Restart Backend
```bash
# Find and kill the process
ps aux | grep "tsx src/server.ts" | grep -v grep | awk '{print $2}' | xargs kill

# Start backend again
cd /home/ssm-user/agrinext-phase2/backend
nohup npx tsx src/server.ts > backend.log 2>&1 &

# Verify it started
tail -f backend.log
```

### Test OTP Endpoint Locally
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}'
```

## Complete .env Template (Corrected Path)

Create/edit this file: `/home/ssm-user/agrinext-phase2/backend/.env`

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=agrinext-db-1772367775698.c9wpfqo0zzqo.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=Agrinextow7s74of!
DB_SSL=true
DB_POOL_MIN=10
DB_POOL_MAX=50

# ============================================
# JWT TOKENS (Generate with crypto)
# ============================================
JWT_SECRET=<paste_generated_secret_here>
REFRESH_TOKEN_SECRET=<paste_generated_secret_here>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d

# ============================================
# TWILIO SMS (Get from https://console.twilio.com)
# ============================================
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
TWILIO_PHONE_NUMBER=<your_twilio_phone_number>

# ============================================
# AWS S3
# ============================================
AWS_ACCESS_KEY_ID=<your_aws_access_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
AWS_REGION=us-east-1
AWS_S3_BUCKET=agrinext-images-1772367775698

# ============================================
# OPENAI (Get from https://platform.openai.com/api-keys)
# ============================================
OPENAI_API_KEY=<your_openai_api_key>
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500

# ============================================
# HUGGING FACE (Get from https://huggingface.co/settings/tokens)
# ============================================
HUGGINGFACE_API_KEY=<your_huggingface_api_key>
HUGGINGFACE_MODEL=linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification

# ============================================
# GOOGLE TRANSLATE (Optional - can skip for MVP)
# ============================================
GOOGLE_PROJECT_ID=<your_google_project_id>

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=production
API_VERSION=v1

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# OTP CONFIGURATION
# ============================================
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info

# ============================================
# CORS
# ============================================
CORS_ORIGIN=http://localhost:5173,http://3.239.184.220:3000
```

## Quick Setup Steps (Corrected)

1. **Connect to EC2** via AWS Systems Manager Session Manager

2. **Navigate to backend**:
   ```bash
   cd /home/ssm-user/agrinext-phase2/backend
   ```

3. **Generate JWT secrets**:
   ```bash
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy these values!

4. **Edit .env file**:
   ```bash
   nano .env
   ```
   Paste the template above and fill in all values.

5. **Save**: `Ctrl+X`, then `Y`, then `Enter`

6. **Restart backend**:
   ```bash
   ps aux | grep "tsx src/server.ts" | grep -v grep | awk '{print $2}' | xargs kill
   cd /home/ssm-user/agrinext-phase2/backend
   nohup npx tsx src/server.ts > backend.log 2>&1 &
   ```

7. **Test OTP**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"mobileNumber":"9876543210"}'
   ```

## Priority Order

**Minimum to get OTP working:**
1. ✅ JWT_SECRET
2. ✅ REFRESH_TOKEN_SECRET
3. ✅ TWILIO_ACCOUNT_SID
4. ✅ TWILIO_AUTH_TOKEN
5. ✅ TWILIO_PHONE_NUMBER

**Add these for full functionality:**
6. AWS credentials (for image upload)
7. OpenAI API key (for advisory)
8. Hugging Face API key (for disease detection)
9. Google Project ID (optional - for translation)

Start with the minimum 5 to get OTP working, then add the rest!
