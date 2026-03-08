# OTP Issue Diagnostic Guide

## Issue
Send OTP is failing in the web application.

## Possible Causes

### 1. Twilio Credentials Not Set or Invalid
The backend requires these environment variables:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### 2. Twilio Account Issues
- Account not verified
- Insufficient balance
- Phone number not verified (for trial accounts)
- Geographic restrictions

### 3. Backend Server Issues
- Server not running
- Environment variables not loaded
- Database connection issues

### 4. Rate Limiting
- Too many OTP requests from the same number

## Diagnostic Steps

### Step 1: Check Backend Server Status

SSH into EC2 and run:
```bash
ssh -i aws-tests/agrinext-key.pem ubuntu@3.239.184.220

# Check if backend is running
pm2 status

# Check recent logs
pm2 logs agrinext-backend --lines 50
```

### Step 2: Check Environment Variables

```bash
cd /home/ubuntu/agrinext/backend

# Check if .env file exists
ls -la .env

# Check Twilio variables (masked)
grep TWILIO .env | sed 's/=.*/=***/'
```

### Step 3: Check Backend Logs for Errors

```bash
# Check error logs specifically
pm2 logs agrinext-backend --err --lines 30

# Check for Twilio-related errors
pm2 logs agrinext-backend --lines 100 | grep -i twilio

# Check for OTP-related errors
pm2 logs agrinext-backend --lines 100 | grep -i otp
```

### Step 4: Test API Endpoint Directly

```bash
# Test send-otp endpoint
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}'
```

### Step 5: Check Database Connection

```bash
# Check if database is accessible
cd /home/ubuntu/agrinext/backend
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB Error:', err);
  else console.log('DB Connected:', res.rows[0]);
  pool.end();
});
"
```

## Common Solutions

### Solution 1: Set Twilio Credentials

If Twilio credentials are missing, add them to `.env`:

```bash
cd /home/ubuntu/agrinext/backend
nano .env

# Add these lines:
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Restart backend
pm2 restart agrinext-backend
```

### Solution 2: Verify Twilio Account

1. Log into Twilio Console: https://console.twilio.com
2. Check account status
3. Verify phone number is active
4. Check account balance
5. For trial accounts, add recipient numbers to verified list

### Solution 3: Check CORS Settings

If the web app can't reach the backend:

```bash
cd /home/ubuntu/agrinext/backend
grep CORS_ORIGIN .env

# Should include your web app URL
# CORS_ORIGIN=http://localhost:5173,http://3.239.184.220:3000
```

### Solution 4: Restart Backend

```bash
pm2 restart agrinext-backend
pm2 logs agrinext-backend --lines 20
```

## Expected Behavior

When OTP send is successful, you should see in logs:
```
INFO: OTP stored for mobile number: 9876543210
INFO: Sending OTP SMS (attempt 1/3) to +919876543210
INFO: OTP SMS sent successfully. SID: SM...
INFO: OTP sent to 9876543210
```

## Error Messages to Look For

### "Missing required environment variable: TWILIO_ACCOUNT_SID"
- Twilio credentials not set in .env file

### "Unable to send OTP. Please try again later."
- Twilio API call failed after 3 retries
- Check Twilio account status and credentials

### "Mobile number must be exactly 10 digits"
- Invalid mobile number format in request

### "Maximum OTP attempts exceeded"
- User has requested too many OTPs
- Wait for rate limit to reset or clear from database

## Quick Fix Commands

Run these on EC2 to get immediate diagnostics:

```bash
# One-liner to check everything
ssh -i aws-tests/agrinext-key.pem ubuntu@3.239.184.220 '
echo "=== PM2 Status ===";
pm2 status;
echo "";
echo "=== Recent Logs ===";
pm2 logs agrinext-backend --lines 30 --nostream;
echo "";
echo "=== Twilio Config (masked) ===";
cd /home/ubuntu/agrinext/backend && grep TWILIO .env | sed "s/=.*/=***/";
'
```

## Web App Error Handling

The web app should display the error message from the backend. Check browser console for:
- Network errors (CORS, connection refused)
- API response errors (400, 500, etc.)
- Error messages from backend

## Next Steps

1. Run diagnostic commands above
2. Check backend logs for specific error
3. Verify Twilio credentials are set
4. Test API endpoint directly
5. If still failing, provide the error logs for further analysis
