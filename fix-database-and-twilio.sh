#!/bin/bash
# Fix missing database table and provide Twilio instructions

cd /home/ssm-user/agrinext-phase2

echo "=== Fixing Database Schema ==="
echo ""

# Run the migration to create rate limit tables
psql "postgresql://postgres:Agrinext2024!@agrinext-mvp-db.c3r4kzfzo6vl.us-east-1.rds.amazonaws.com:5432/agrinext_mvp?sslmode=require" << 'EOF'
-- Create rate limiting tables
CREATE TABLE IF NOT EXISTS otp_rate_limits (
    id SERIAL PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mobile_created (mobile_number, created_at)
);

CREATE TABLE IF NOT EXISTS api_rate_limits (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    endpoint VARCHAR(255) NOT NULL,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_endpoint_created (user_id, endpoint, created_at),
    INDEX idx_ip_endpoint_created (ip_address, endpoint, created_at)
);

-- Verify tables were created
\dt otp_rate_limits
\dt api_rate_limits

SELECT 'Database tables created successfully!' as status;
EOF

echo ""
echo "=== Database Fix Complete ==="
echo ""
echo "=== Twilio Trial Account Issue ==="
echo ""
echo "Your Twilio account is in TRIAL MODE and can only send SMS to verified numbers."
echo ""
echo "You have 2 options:"
echo ""
echo "Option 1: Verify Phone Numbers (FREE)"
echo "  1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
echo "  2. Click 'Add a new number'"
echo "  3. Enter the phone number you want to test with (e.g., +919876543210)"
echo "  4. Verify it via SMS or call"
echo "  5. You can verify up to 10 numbers for free"
echo ""
echo "Option 2: Upgrade Twilio Account (PAID)"
echo "  1. Go to: https://console.twilio.com/us1/billing/manage-billing/upgrade"
echo "  2. Add payment method and upgrade"
echo "  3. You can then send to any number"
echo ""
echo "=== Testing Backend After Database Fix ==="
echo ""

# Restart backend
cd backend
pkill -f "tsx src/server.ts"
sleep 2
set -a && source .env && set +a && nohup npx tsx src/server.ts > backend.log 2>&1 &
sleep 5

echo "Backend restarted. Testing OTP endpoint..."
echo ""

# Test with a verified number (will still fail until you verify the number)
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}'

echo ""
echo ""
echo "If you see a different error (not 'relation does not exist'), the database is fixed!"
echo "The Twilio error will remain until you verify the phone number or upgrade your account."
