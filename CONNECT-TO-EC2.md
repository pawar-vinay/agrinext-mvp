# How to Connect to EC2 and Check Logs

## Problem
You're trying to run commands locally that should run on EC2.

## Solution: Proper SSH Connection

### Step 1: Find the correct key file location

From your workspace root, the key is at:
```
aws-tests/agrinext-key.pem
```

### Step 2: Connect to EC2 (Windows PowerShell)

```powershell
# Navigate to your project directory first
cd J:\Aws_hackathon

# Connect to EC2
ssh -i aws-tests/agrinext-key.pem ubuntu@3.239.184.220
```

### Step 3: Once connected, run these commands

After you see `ubuntu@ip-xxx-xxx-xxx-xxx:~$` prompt, run:

```bash
# Check PM2 status
pm2 status

# Check recent logs
pm2 logs agrinext-backend --lines 50

# Check Twilio credentials (masked)
cd agrinext/backend
cat .env | grep TWILIO

# Test OTP endpoint locally
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}'
```

## Alternative: One-Line Command (from your local machine)

If you want to run commands without staying connected:

```powershell
# From J:\Aws_hackathon directory
ssh -i aws-tests/agrinext-key.pem ubuntu@3.239.184.220 "pm2 logs agrinext-backend --lines 50"
```

## If SSH Key Permission Error

On Windows, fix key permissions:

```powershell
# Remove inheritance and grant only your user read access
icacls aws-tests\agrinext-key.pem /inheritance:r
icacls aws-tests\agrinext-key.pem /grant:r "$($env:USERNAME):(R)"
```

## Quick Diagnostic Script

I'll create a PowerShell script that does this for you:
