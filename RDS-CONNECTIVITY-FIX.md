# RDS Connectivity Diagnostic Guide

## Current Status

✅ **Security group is properly configured** - EC2 and RDS are in the same security group and can communicate

❌ **Backend still cannot connect** - Need to diagnose the actual issue

## What We Know

1. The `fix-rds-connectivity.js` script confirmed that the security group rule exists
2. EC2 security group: `sg-01402410c86b50f62`
3. RDS security group: `sg-01402410c86b50f62` (same as EC2)
4. This means they should be able to communicate

## Possible Causes

The DNS resolution error (`ENOTFOUND`) could be caused by:

1. **VPC DNS settings** - DNS resolution might not be enabled in the VPC
2. **Network connectivity** - Routing or network ACL issues
3. **RDS endpoint issue** - RDS might not be fully available
4. **Application configuration** - Environment variables or connection string issues

## Diagnostic Steps

I've uploaded a diagnostic script to S3. Run these commands on your EC2 instance:

### Step 1: Connect to EC2

Use AWS Systems Manager Session Manager (from AWS Console):
1. Go to EC2 → Instances
2. Select instance `i-004ef74f37ba59da1`
3. Click "Connect" → "Session Manager" → "Connect"

### Step 2: Download and Run Diagnostic Script

```bash
# Download the diagnostic script
aws s3 cp s3://agrinext-images-1772367775698/scripts/diagnose-ec2-rds.sh ~/diagnose-ec2-rds.sh

# Make it executable
chmod +x ~/diagnose-ec2-rds.sh

# Run the diagnostic
~/diagnose-ec2-rds.sh
```

### Step 3: Review Results

The script will test:
1. ✅ DNS resolution
2. ✅ Network connectivity (ping)
3. ✅ Port connectivity (TCP 5432)
4. ✅ PostgreSQL connection
5. ✅ Environment variables

## Expected Outcomes

### If DNS Resolution Fails
This indicates a VPC DNS issue. Solution:
- Enable DNS resolution in VPC settings
- Check VPC DNS hostnames setting

### If Port Connectivity Fails
This indicates a security group or network ACL issue. Solution:
- Verify security group rules again
- Check network ACL rules
- Verify RDS is in "Available" state

### If PostgreSQL Connection Fails
This indicates an authentication or database issue. Solution:
- Verify database credentials
- Check RDS is accepting connections
- Verify database name exists

## Quick Fix Commands

If the diagnostic reveals the issue, here are quick fixes:

### Fix 1: Restart Backend with Correct Environment

```bash
cd ~/agrinext-phase2/backend

# Stop PM2
pm2 stop all
pm2 delete all

# Verify environment variables
node -e "require('dotenv').config(); console.log('DB_HOST:', process.env.DB_HOST);"

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Check logs
pm2 logs agrinext-api --lines 50
```

### Fix 2: Test Database Connection Directly

```bash
cd ~/agrinext-phase2/backend

# Create a simple test script
cat > test-db-simple.js << 'EOF'
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
  console.log('Connecting to:', client.host);
  try {
    await client.connect();
    console.log('✅ Connected!');
    const result = await client.query('SELECT NOW()');
    console.log('Current time:', result.rows[0].now);
    await client.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

test();
EOF

# Run the test
node test-db-simple.js
```

## Next Steps After Diagnostic

Once you run the diagnostic script and share the output, I can:
1. Identify the exact issue
2. Provide a targeted fix
3. Get the Phase 2 backend running

---

**Created**: March 2, 2026
**Status**: Waiting for diagnostic results
