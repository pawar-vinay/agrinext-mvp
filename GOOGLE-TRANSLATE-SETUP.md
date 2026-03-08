# Google Cloud Translation API Setup

## Important Note

Google Cloud Translation requires more setup than other services. It uses **Service Account credentials** (a JSON file), not just an API key.

## Option 1: Skip Google Translate (Recommended for MVP)

The translation service is used for error messages and some content translation. For MVP testing, you can:

1. **Use English only** - Set all users to English language
2. **Use OpenAI for translation** - Modify the code to use OpenAI instead
3. **Mock the translation** - Return original text without translation

This is the fastest way to get your app working.

## Option 2: Full Google Cloud Translation Setup

If you need full multilingual support, follow these steps:

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Project name: "agrinext-translation"
4. Click "Create"
5. **Copy the Project ID** (e.g., `agrinext-translation-123456`)

### Step 2: Enable Translation API

1. Go to https://console.cloud.google.com/apis/library/translate.googleapis.com
2. Make sure your project is selected
3. Click "Enable"

### Step 3: Create Service Account

1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click "Create Service Account"
3. Service account name: "agrinext-backend"
4. Click "Create and Continue"
5. Role: Select "Cloud Translation API User"
6. Click "Continue" → "Done"

### Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Key type: JSON
5. Click "Create"
6. A JSON file will download - **SAVE THIS FILE SECURELY**

### Step 5: Upload Key to EC2

**Option A: Copy-paste method (easier)**

1. Open the downloaded JSON file in a text editor
2. Copy the entire content
3. On EC2, run:
```bash
cd /home/ssm-user/agrinext/backend
nano google-credentials.json
```
4. Paste the JSON content
5. Save: `Ctrl+X`, `Y`, `Enter`

**Option B: Upload via S3**

```bash
# On your local machine
aws s3 cp path/to/your-key.json s3://agrinext-images-1772367775698/google-credentials.json

# On EC2
cd /home/ssm-user/agrinext/backend
aws s3 cp s3://agrinext-images-1772367775698/google-credentials.json ./google-credentials.json
```

### Step 6: Update .env File

Add these to your `.env`:

```env
# Google Translate
GOOGLE_PROJECT_ID=your-project-id-from-step-1
GOOGLE_APPLICATION_CREDENTIALS=/home/ssm-user/agrinext/backend/google-credentials.json
```

### Step 7: Restart Backend

```bash
# Kill old process
ps aux | grep "tsx src/server.ts" | grep -v grep | awk '{print $2}' | xargs kill

# Start with credentials
cd /home/ssm-user/agrinext/backend
export GOOGLE_APPLICATION_CREDENTIALS=/home/ssm-user/agrinext/backend/google-credentials.json
nohup npx tsx src/server.ts > backend.log 2>&1 &
```

## Option 3: Simplified Translation (Recommended Alternative)

Instead of Google Translate, modify the backend to use OpenAI for translation. This is simpler and you already have OpenAI configured.

### Modify translation.service.ts

On EC2, edit the translation service:

```bash
cd /home/ssm-user/agrinext/backend/src/services
nano translation.service.ts
```

Replace the content with this simplified version:

```typescript
/**
 * Simplified Translation service using OpenAI
 */

import logger from '../utils/logger';

// For MVP, return original content
// Translation can be added later with OpenAI or Google Translate

export const translateError = async (
  message: string,
  language: string
): Promise<string> => {
  // For MVP, return English messages
  return message;
};

export const translateContent = async (
  content: string,
  language: string
): Promise<string> => {
  // For MVP, return original content
  return content;
};

export const translateBatch = async (
  contents: string[],
  language: string
): Promise<string[]> => {
  // For MVP, return original contents
  return contents;
};

export const detectLanguage = async (text: string): Promise<string> => {
  return 'en';
};
```

Save and restart the backend. This removes the Google Translate dependency entirely.

## Recommended Approach for MVP

**Use Option 3 (Simplified Translation)** because:
- ✅ No additional service setup needed
- ✅ No extra costs
- ✅ Faster to implement
- ✅ Can add proper translation later
- ✅ App will work immediately

You can add full translation support after the MVP is working.

## Cost Comparison

| Service | Cost | Setup Complexity |
|---------|------|------------------|
| Google Translate | $20 per 1M characters | High (service account, JSON key) |
| OpenAI Translation | ~$0.002 per request | Low (already configured) |
| No Translation (MVP) | Free | None |

## Updated .env Without Google Translate

If you use Option 3 (simplified), your `.env` doesn't need Google credentials:

```env
# Database
DB_HOST=agrinext-db-1772367775698.c9wpfqo0zzqo.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=Agrinextow7s74of!
DB_SSL=true
DB_POOL_MIN=10
DB_POOL_MAX=50

# JWT Tokens
JWT_SECRET=<your_generated_secret>
REFRESH_TOKEN_SECRET=<your_generated_secret>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d

# Twilio
TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_token>
TWILIO_PHONE_NUMBER=<your_twilio_number>

# AWS S3
AWS_ACCESS_KEY_ID=<your_aws_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret>
AWS_REGION=us-east-1
AWS_S3_BUCKET=agrinext-images-1772367775698

# OpenAI
OPENAI_API_KEY=<your_openai_key>
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500

# Hugging Face
HUGGINGFACE_API_KEY=<your_hf_key>
HUGGINGFACE_MODEL=linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification

# Server
PORT=3000
NODE_ENV=production
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173,http://3.239.184.220:3000

# Note: GOOGLE_PROJECT_ID removed - using simplified translation
```

This will work without Google Translate!
