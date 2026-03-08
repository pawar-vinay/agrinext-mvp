#!/bin/bash
# Fix environment variable loading issue on EC2

echo "=== Agrinext Backend Environment Fix ==="
echo ""

# Navigate to backend directory
cd /home/ssm-user/agrinext-phase2/backend || exit 1

echo "Step 1: Stopping current backend process..."
pkill -f "tsx src/server.ts"
sleep 2

echo ""
echo "Step 2: Testing dotenv loading..."
node -e "
require('dotenv').config({ path: require('path').join(process.cwd(), '.env') });
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'LOADED ✓' : 'MISSING ✗');
console.log('DB_HOST:', process.env.DB_HOST ? 'LOADED ✓' : 'MISSING ✗');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'LOADED ✓' : 'MISSING ✗');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'LOADED ✓' : 'MISSING ✗');
"

echo ""
echo "Step 3: Checking .env file format..."
# Check for Windows line endings
if file .env | grep -q "CRLF"; then
    echo "⚠ WARNING: .env has Windows line endings (CRLF)"
    echo "Converting to Unix line endings..."
    dos2unix .env 2>/dev/null || sed -i 's/\r$//' .env
    echo "✓ Converted to Unix line endings"
else
    echo "✓ .env has correct line endings"
fi

echo ""
echo "Step 4: Starting backend with explicit environment loading..."
# Export all variables from .env file
set -a
source .env
set +a

# Start backend
nohup npx tsx src/server.ts > backend.log 2>&1 &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo ""
echo "Waiting 5 seconds for server to start..."
sleep 5

echo ""
echo "Step 5: Checking if server is running..."
if ps -p $BACKEND_PID > /dev/null; then
    echo "✓ Backend process is running"
else
    echo "✗ Backend process failed to start"
    echo "Last 20 lines of backend.log:"
    tail -20 backend.log
    exit 1
fi

echo ""
echo "Step 6: Testing OTP endpoint..."
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Step 7: Checking backend logs..."
echo "Last 30 lines of backend.log:"
tail -30 backend.log

echo ""
echo "=== Fix Complete ==="
echo "If OTP still fails, check the logs above for Twilio errors"
