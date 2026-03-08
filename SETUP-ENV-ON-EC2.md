# Setup Environment Variables on EC2

## Current Issue
The backend `.env` file is missing critical credentials:
- ❌ Twilio (OTP/SMS)
- ❌ OpenAI (Advisory)
- ❌ Hugging Face (Disease Detection)
- ❌ Google Translate (Multilingual)
- ❌ JWT Secrets (Authentication)
- ❌ AWS Credentials (S3 Image Storage)

## Step-by-Step Setup

### Step 1: Generate JWT Secrets

On your EC2 session, run:

```bash
cd /home/ssm-user/agrinext/backend

# Generate JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate Refresh Token Secret
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Copy these values - you'll need them in Step 4.

### Step 2: Get Twilio Credentials (CRITICAL for OTP)

1. Go to: https://console.twilio.com
2. Sign up or log in
3. On the dashboard, copy:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click "Show" to reveal)
4. Get a phone number:
   - Go to: https://console.twilio.com/phone-numbers/incoming
   - Buy a number or use trial number
   - Copy the phone number (format: +1234567890)

**For Trial Accounts:**
- Verify recipient numbers at: https://console.twilio.com/phone-numbers/verified
- Add the Indian phone numbers you want to test with

### Step 3: Get OpenAI API Key (for Advisory Feature)

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with sk-...)
5. **Save it immediately** - you can't see it again!

**Pricing:** ~$0.002 per request (very cheap for testing)

### Step 4: Get Hugging Face API Key (for Disease Detection)

1. Go to: https://huggingface.co/settings/tokens
2. Sign up or log in
3. Click "New token"
4. Give it a name (e.g., "agrinext-disease-detection")
5. Select "Read" access
6. Copy the token

**Model to use:** You'll need to find a plant disease detection model on Hugging Face.
Example: `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`

### Step 5: Get AWS Credentials (for S3 Image Storage)

You should already have these from your AWS account. Check:

```bash
# On your local machine
cat "Aws Resoucres/Agrinext_accessKeys.csv"
```

Or get them from AWS Console:
1. Go to: https://console.aws.amazon.com/iam/
2. Users → Your user → Security credentials
3. Create access key if needed

### Step 6: Get Google Cloud Project ID (for Translation)

**Option A: Use existing project**
1. Go to: https://console.cloud.google.com
2. Select your project
3. Copy the Project ID

**Option B: Skip for now (Optional)**
- Translation can work with multilingual prompts to OpenAI
- Not critical for MVP testing

### Step 7: Create .env File on EC2

On your EC2 session:

```bash
cd /home/ssm-user/agrinext/backend

# Backup existing .env if it exists
cp .env .env.backup 2>/dev/null || true

# Create new .env file
nano .env
```

Paste this content and replace all YOUR_* values:

```env
# Database (Already Working)
DB_HOST=agrinext-db-1772367775698.c9wpfqo0zzqo.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=Agrinextow7s74of!
DB_SSL=true
DB_POOL_MIN=10
DB_POOL_MAX=50

# JWT Tokens (Use generated values from Step 1)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_FROM_STEP_1
REFRESH_TOKEN_SECRET=YOUR_GENERATED_REFRESH_SECRET_FROM_STEP_1
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d

# Twilio (From Step 2)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER

# AWS S3 (From Step 5)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=agrinext-images-1772367775698

# OpenAI (From Step 3)
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500

# Hugging Face (From Step 4)
HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY
HUGGINGFACE_MODEL=linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification

# Google Translate (From Step 6 - Optional)
GOOGLE_PROJECT_ID=YOUR_GOOGLE_PROJECT_ID

# Server Configuration
PORT=3000
NODE_ENV=production
API_VERSION=v1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:5173,http://3.239.184.220:3000
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Step 8: Restart the Backend

```bash
# Find the process ID
ps aux | grep "tsx src/server.ts" | grep -v grep

# Kill the old process (replace PID with actual process ID)
kill <PID>

# Start the backend again
cd /home/ssm-user/agrinext/backend
nohup npx tsx src/server.ts > backend.log 2>&1 &

# Check if it started
tail -f backend.log
```

Press `Ctrl+C` to stop viewing logs.

### Step 9: Test OTP Endpoint

```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2026-03-04T15:30:00.000Z"
}
```

### Step 10: Test from Web App

Go back to your web app at http://localhost:5173 and try logging in!

## Quick Reference: Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Twilio Console | https://console.twilio.com | Get SMS credentials |
| OpenAI API Keys | https://platform.openai.com/api-keys | Get AI advisory key |
| Hugging Face Tokens | https://huggingface.co/settings/tokens | Get disease detection key |
| AWS IAM | https://console.aws.amazon.com/iam/ | Get S3 credentials |
| Google Cloud Console | https://console.cloud.google.com | Get translation project ID |

## Minimum Required for OTP to Work

You only need these to get OTP working:
1. ✅ JWT_SECRET (generate with crypto)
2. ✅ REFRESH_TOKEN_SECRET (generate with crypto)
3. ✅ TWILIO_ACCOUNT_SID
4. ✅ TWILIO_AUTH_TOKEN
5. ✅ TWILIO_PHONE_NUMBER

The rest (OpenAI, Hugging Face, Google) can be added later for other features.

## Troubleshooting

### "Missing required environment variable" error
- Check that all required variables are in .env
- No spaces around the = sign
- No quotes around values (unless they contain spaces)

### OTP still not working
- Check Twilio account balance
- Verify phone number format includes country code (+91 for India)
- Check backend logs: `tail -f /home/ssm-user/agrinext/backend/backend.log`

### Backend won't start
- Check for syntax errors in .env
- Check logs: `tail -f /home/ssm-user/agrinext/backend/backend.log`
- Verify database connection: `DB_HOST` is correct

## Cost Estimates

- **Twilio**: ~$0.0075 per SMS (India)
- **OpenAI**: ~$0.002 per advisory request
- **Hugging Face**: Free tier available
- **Google Translate**: Free tier: 500,000 characters/month

**Total for testing**: ~$5-10/month
