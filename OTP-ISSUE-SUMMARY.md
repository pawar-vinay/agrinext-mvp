# OTP Issue Summary

## Current Status

**Backend Status:** ✅ Running and healthy
- Server is accessible at http://3.239.184.220:3000
- Database is connected
- Uptime: ~34 hours

**OTP Endpoint Status:** ❌ Failing with INTERNAL_ERROR
- Endpoint: POST /api/v1/auth/send-otp
- Error: `{"error":{"code":"INTERNAL_ERROR","message":"An unexpected error occurred"}}`

## Root Cause Analysis

The "INTERNAL_ERROR" response indicates an unhandled exception in the backend. Based on the code review, the most likely causes are:

### 1. **Twilio Credentials Missing or Invalid** (MOST LIKELY)
The backend requires these environment variables in `/home/ubuntu/agrinext/backend/.env`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Why this is likely:**
- The SMS service will throw an error if Twilio credentials are not set
- The error handler catches this and returns "INTERNAL_ERROR"
- No specific error message suggests the error is happening before validation

### 2. **Translation Service Failure**
The error handler tries to translate error messages, which might be failing if:
- Google Translate API credentials are missing
- `GOOGLE_PROJECT_ID` not set in .env

### 3. **Database Issue with OTP Table**
Less likely since database shows as "connected", but possible if:
- `otp_verifications` table doesn't exist
- Database permissions issue

## Required Actions

### Action 1: Check Backend Logs (CRITICAL)
SSH into EC2 and check the actual error:

```bash
ssh -i aws-tests/agrinext-key.pem ubuntu@3.239.184.220
pm2 logs agrinext-backend --lines 100 | grep -A 10 -B 5 "error"
```

This will show the actual error message that's being caught.

### Action 2: Verify Twilio Credentials
```bash
cd /home/ubuntu/agrinext/backend
cat .env | grep TWILIO
```

Expected output:
```
TWILIO_ACCOUNT_SID=ACxxxxx...
TWILIO_AUTH_TOKEN=xxxxx...
TWILIO_PHONE_NUMBER=+1xxxxx...
```

If these are missing, you need to:
1. Get Twilio credentials from https://console.twilio.com
2. Add them to the .env file
3. Restart the backend: `pm2 restart agrinext-backend`

### Action 3: Check Translation Service Config
```bash
cd /home/ubuntu/agrinext/backend
cat .env | grep GOOGLE
```

If `GOOGLE_PROJECT_ID` is missing, the translation service might be failing.

### Action 4: Test Database Table
```bash
cd /home/ubuntu/agrinext/backend
psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -c "\d otp_verifications"
```

This verifies the OTP table exists.

## Quick Fix (If Twilio Not Configured)

### Option A: Configure Twilio (Recommended)
1. Sign up for Twilio: https://www.twilio.com/try-twilio
2. Get a phone number
3. Copy Account SID and Auth Token
4. Add to .env file on EC2
5. Restart backend

### Option B: Use Mock OTP for Testing (Development Only)
Temporarily modify the backend to skip Twilio and just log the OTP:

```typescript
// In backend/src/services/sms.service.ts
export const sendOTPSMS = async (
  mobileNumber: string,
  otpCode: string
): Promise<void> => {
  // TEMPORARY: Log OTP instead of sending SMS
  logger.info(`[MOCK] OTP for ${mobileNumber}: ${otpCode}`);
  console.log(`\n\n=== OTP CODE: ${otpCode} ===\n\n`);
  return;
};
```

Then check logs to see the OTP code.

## Expected Log Output (When Working)

When OTP send is successful, logs should show:
```
INFO: OTP stored for mobile number: 9876543210
INFO: Sending OTP SMS (attempt 1/3) to +919876543210
INFO: OTP SMS sent successfully. SID: SMxxxxxxxxxxxxxxx
INFO: OTP sent to 9876543210
```

## Expected Log Output (When Failing)

If Twilio credentials are missing:
```
ERROR: Missing required environment variable: TWILIO_ACCOUNT_SID
```

If Twilio API fails:
```
WARN: Twilio attempt 1 failed: [Error message]
WARN: Twilio attempt 2 failed: [Error message]
WARN: Twilio attempt 3 failed: [Error message]
ERROR: Failed to send OTP SMS after all retries
```

## Next Steps

1. **SSH into EC2** and run the diagnostic commands above
2. **Check the actual error** in pm2 logs
3. **Verify Twilio credentials** are set in .env
4. **Share the error logs** if you need help interpreting them

## Alternative: Use curl to test from EC2

SSH into EC2 and test locally:
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}' \
  -v
```

This will show more detailed error information.

## Files to Check on EC2

1. `/home/ubuntu/agrinext/backend/.env` - Environment variables
2. `/home/ubuntu/.pm2/logs/agrinext-backend-error.log` - Error logs
3. `/home/ubuntu/.pm2/logs/agrinext-backend-out.log` - Output logs

## Contact Information

If you need help:
1. Share the output of `pm2 logs agrinext-backend --lines 50`
2. Share the output of `cat /home/ubuntu/agrinext/backend/.env | grep -E "TWILIO|GOOGLE"` (with sensitive values masked)
3. Share any error messages from the browser console
