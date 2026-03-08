#!/bin/bash
# Test OTP endpoint with detailed logging

cd /home/ssm-user/agrinext-phase2/backend

echo "=== Testing OTP Endpoint with Detailed Logging ==="
echo ""

# Create a test script that adds console logging
cat > test-otp-direct.js << 'EOF'
// Load environment variables
require('dotenv').config({ path: require('path').join(process.cwd(), '.env') });

console.log('=== Environment Variables Check ===');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'MISSING');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'MISSING');
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING');
console.log('');

// Test Twilio directly
const twilio = require('twilio');

async function testTwilio() {
  try {
    console.log('=== Testing Twilio Connection ===');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('Twilio client created successfully');
    console.log('Attempting to send test SMS...');
    
    const message = await client.messages.create({
      body: 'Test OTP: 123456. This is a test message from Agrinext.',
      to: '+919876543210',
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    
    console.log('✓ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
  } catch (error) {
    console.error('✗ Twilio Error:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('More Info:', error.moreInfo);
    console.error('Status:', error.status);
    console.error('Full Error:', JSON.stringify(error, null, 2));
  }
}

testTwilio();
EOF

echo "Running direct Twilio test..."
node test-otp-direct.js

echo ""
echo "=== Test Complete ==="
