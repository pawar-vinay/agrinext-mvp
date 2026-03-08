# Simple Diagnostic Steps for EC2

The S3 download had an issue because the commands were pasted together. Let's run the diagnostic commands directly instead.

## Copy These Commands ONE AT A TIME

Connect to your EC2 instance via Session Manager, then run each command below and share the output:

### Command 1: Test DNS Resolution

```bash
nslookup agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com
```

**What this tests**: Can EC2 resolve the RDS hostname to an IP address?

---

### Command 2: Test Port Connectivity

```bash
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com/5432' && echo "✅ Port is reachable" || echo "❌ Port is NOT reachable"
```

**What this tests**: Can EC2 connect to RDS on port 5432?

---

### Command 3: Test Database Connection

```bash
cd ~/agrinext-phase2/backend
node test-db.js
```

**What this tests**: Can the application connect to PostgreSQL?

---

### Command 4: Check Environment Variables

```bash
cd ~/agrinext-phase2/backend
grep "DB_HOST\|DB_PORT\|DB_NAME\|DB_USER" .env
```

**What this tests**: Are the database credentials configured correctly?

---

### Command 5: Check PM2 Status

```bash
pm2 status
pm2 logs agrinext-api --lines 20 --nostream
```

**What this tests**: What's the current status and recent logs?

---

## What to Share

After running each command, copy and paste the output here. This will help me identify:

1. ✅ or ❌ DNS resolution working
2. ✅ or ❌ Port 5432 accessible
3. ✅ or ❌ PostgreSQL connection working
4. ✅ or ❌ Environment variables correct
5. ✅ or ❌ PM2 status

## Quick Alternative: Try Starting Backend Directly

If you want to see the error immediately, try this:

```bash
cd ~/agrinext-phase2/backend
pm2 stop all
tsx src/server.ts
```

This will run the backend in the foreground and show you the exact error message.

Press `Ctrl+C` to stop it when you're done.

---

**Ready?** Start with Command 1 and work your way down!
