#!/bin/bash

# Create the diagnostic script directly on EC2
# Run this command by command on EC2

cat > ~/diagnose-ec2-rds.sh << 'SCRIPT_END'
#!/bin/bash

# Diagnose EC2 to RDS connectivity issues
# Run this script on the EC2 instance

echo "🔍 Diagnosing EC2 to RDS connectivity..."
echo ""

# Database details
DB_HOST="agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com"
DB_PORT="5432"

echo "Step 1: Testing DNS resolution..."
if nslookup $DB_HOST > /dev/null 2>&1; then
    echo "✅ DNS resolution successful"
    nslookup $DB_HOST | grep -A2 "Name:"
else
    echo "❌ DNS resolution failed"
    echo "This could indicate:"
    echo "  - VPC DNS settings issue"
    echo "  - Network connectivity problem"
    exit 1
fi

echo ""
echo "Step 2: Testing network connectivity (ping)..."
if ping -c 3 $DB_HOST > /dev/null 2>&1; then
    echo "✅ Ping successful"
else
    echo "⚠️  Ping failed (this is normal - RDS doesn't respond to ICMP)"
fi

echo ""
echo "Step 3: Testing port connectivity..."
if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
    echo "✅ Port $DB_PORT is reachable"
else
    echo "❌ Port $DB_PORT is NOT reachable"
    echo "This indicates:"
    echo "  - Security group is blocking the connection"
    echo "  - Network ACL is blocking the connection"
    echo "  - RDS is not running"
    exit 1
fi

echo ""
echo "Step 4: Testing PostgreSQL connection..."
cd ~/agrinext-phase2/backend

if [ -f "test-db.js" ]; then
    node test-db.js
else
    echo "⚠️  test-db.js not found, creating it..."
    cat > test-db.js << 'EOF'
const { Client } = require('pg');

const client = new Client({
  host: 'agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'agrinext_mvp',
  user: 'postgres',
  password: 'Agrinextow7s74of!',
  connectionTimeoutMillis: 10000,
});

async function test() {
  try {
    await client.connect();
    console.log('✅ PostgreSQL connection successful!');
    const result = await client.query('SELECT version()');
    console.log('Version:', result.rows[0].version);
    await client.end();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    process.exit(1);
  }
}

test();
EOF
    node test-db.js
fi

echo ""
echo "Step 5: Checking environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "DB_HOST=$(grep DB_HOST .env | cut -d'=' -f2)"
    echo "DB_PORT=$(grep DB_PORT .env | cut -d'=' -f2)"
    echo "DB_NAME=$(grep DB_NAME .env | cut -d'=' -f2)"
    echo "DB_USER=$(grep DB_USER .env | cut -d'=' -f2)"
else
    echo "❌ .env file not found"
fi

echo ""
echo "✅ Diagnostics complete!"
SCRIPT_END

chmod +x ~/diagnose-ec2-rds.sh

echo "✅ Diagnostic script created!"
echo ""
echo "Now run: ~/diagnose-ec2-rds.sh"
