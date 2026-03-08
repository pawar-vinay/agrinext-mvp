# EC2 Backend Startup Instructions

## Problem Identified
The `.env` file is valid and can be loaded by Node.js, but when starting with `tsx`, the environment variables aren't being passed to the process.

## Solution
Start the backend with environment variables explicitly exported before running `tsx`.

## Commands to Run on EC2

```bash
# Navigate to backend directory
cd /home/ssm-user/agrinext-phase2/backend

# Kill any existing backend process
pkill -f "tsx src/server.ts"
sleep 2

# Method 1: Start with environment variables exported (RECOMMENDED)
set -a && source .env && set +a && nohup npx tsx src/server.ts > backend.log 2>&1 &

# Wait for server to start
sleep 5

# Check if server is running
ps aux | grep "tsx src/server.ts" | grep -v grep

# Test the OTP endpoint
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}'

# Check logs for any errors
tail -50 backend.log
```

## Alternative Method (if Method 1 doesn't work)

```bash
cd /home/ssm-user/agrinext-phase2/backend

# Create a startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash
cd /home/ssm-user/agrinext-phase2/backend
set -a
source .env
set +a
exec npx tsx src/server.ts
EOF

# Make it executable
chmod +x start-backend.sh

# Kill existing process
pkill -f "tsx src/server.ts"
sleep 2

# Start using the script
nohup ./start-backend.sh > backend.log 2>&1 &

# Wait and test
sleep 5
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}'
```

## Expected Result

If successful, you should see:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

## If Still Failing

Check the backend logs for Twilio-specific errors:
```bash
tail -100 backend.log | grep -i twilio
```

Common Twilio errors:
- Invalid credentials: Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
- Invalid phone number: Check TWILIO_PHONE_NUMBER format (+1234567890)
- Insufficient balance: Check Twilio account balance
- Geographic restrictions: Ensure Twilio account can send to India (+91)
