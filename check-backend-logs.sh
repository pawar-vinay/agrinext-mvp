#!/bin/bash

# Check backend logs on EC2
ssh -i aws-tests/agrinext-key.pem -o StrictHostKeyChecking=no ubuntu@3.239.184.220 << 'EOF'
echo "=== PM2 Process Status ==="
pm2 status

echo ""
echo "=== Last 50 lines of backend logs ==="
pm2 logs agrinext-backend --lines 50 --nostream

echo ""
echo "=== Check if Twilio credentials are set ==="
cd /home/ubuntu/agrinext/backend
if [ -f .env ]; then
    echo "Environment variables (masked):"
    grep -E "TWILIO|OTP" .env | sed 's/=.*/=***MASKED***/'
else
    echo ".env file not found!"
fi

echo ""
echo "=== Recent error logs ==="
pm2 logs agrinext-backend --err --lines 20 --nostream
EOF
