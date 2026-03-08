#!/bin/bash

echo "Checking Agrinext Backend OTP Issue..."
echo "======================================="
echo ""

# Try to SSH and get logs
ssh -i aws-tests/agrinext-key.pem -o StrictHostKeyChecking=no ubuntu@3.239.184.220 << 'ENDSSH'

echo "1. PM2 Status:"
echo "-------------"
pm2 status
echo ""

echo "2. Recent Error Logs (last 30 lines):"
echo "-------------------------------------"
pm2 logs agrinext-backend --err --lines 30 --nostream
echo ""

echo "3. Recent Output Logs (last 30 lines):"
echo "--------------------------------------"
pm2 logs agrinext-backend --out --lines 30 --nostream
echo ""

echo "4. Environment Variables (Twilio - masked):"
echo "-------------------------------------------"
cd /home/ubuntu/agrinext/backend
if [ -f .env ]; then
    echo "Twilio Account SID: $(grep TWILIO_ACCOUNT_SID .env | cut -d= -f2 | sed 's/\(.\{4\}\).*/\1***/')"
    echo "Twilio Auth Token: $(grep TWILIO_AUTH_TOKEN .env | cut -d= -f2 | sed 's/\(.\{4\}\).*/\1***/')"
    echo "Twilio Phone: $(grep TWILIO_PHONE_NUMBER .env | cut -d= -f2)"
    echo "Google Project ID: $(grep GOOGLE_PROJECT_ID .env | cut -d= -f2)"
else
    echo "ERROR: .env file not found!"
fi
echo ""

echo "5. Test OTP Endpoint Locally:"
echo "-----------------------------"
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}' \
  2>&1

echo ""
echo ""
echo "6. Database Connection Test:"
echo "---------------------------"
cd /home/ubuntu/agrinext/backend
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT COUNT(*) FROM otp_verifications', (err, res) => {
  if (err) {
    console.error('Database Error:', err.message);
  } else {
    console.log('Database OK - OTP table has', res.rows[0].count, 'records');
  }
  pool.end();
});
" 2>&1

ENDSSH

echo ""
echo "======================================="
echo "Diagnostic Complete"
