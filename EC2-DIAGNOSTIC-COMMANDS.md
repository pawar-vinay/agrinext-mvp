# EC2 Diagnostic Commands

You're connected to EC2 but can't find pm2 or the backend. Run these commands to locate it:

## Step 1: Check what user you are

```bash
whoami
pwd
```

## Step 2: Find the Node.js process

```bash
# Find all node processes
ps aux | grep node

# Find processes listening on port 3000
sudo netstat -tlnp | grep 3000

# Or use lsof
sudo lsof -i :3000
```

## Step 3: Find where the backend code is

```bash
# Search for backend directory
sudo find / -name "agrinext" -type d 2>/dev/null

# Search for .env files
sudo find / -name ".env" -type f 2>/dev/null | grep -v node_modules

# Check common locations
ls -la /home/
ls -la /home/ubuntu/ 2>/dev/null
ls -la /home/ec2-user/ 2>/dev/null
ls -la /opt/ 2>/dev/null
ls -la /var/www/ 2>/dev/null
```

## Step 4: Check if pm2 is installed globally

```bash
# Check npm global packages
npm list -g --depth=0 2>/dev/null

# Find pm2 binary
which pm2
sudo find / -name "pm2" -type f 2>/dev/null | head -5
```

## Step 5: Switch to the correct user

If the backend is running under a different user (like ubuntu or ec2-user):

```bash
# Try switching to ubuntu user
sudo su - ubuntu

# Or ec2-user
sudo su - ec2-user

# Then check pm2
pm2 status
```

## Step 6: Check system logs

```bash
# Check system logs for backend startup
sudo journalctl -u agrinext* --no-pager -n 50

# Check for any systemd services
sudo systemctl list-units | grep agrinext
```

## Step 7: If you find the process, get its details

```bash
# Once you find the PID from step 2, get details:
sudo ls -l /proc/<PID>/cwd
sudo cat /proc/<PID>/environ | tr '\0' '\n' | grep -E "TWILIO|DB_|NODE"
```

## Quick One-Liner to Find Everything

```bash
echo "=== Current User ===" && whoami && \
echo "=== Node Processes ===" && ps aux | grep node | grep -v grep && \
echo "=== Port 3000 ===" && sudo lsof -i :3000 && \
echo "=== Backend Directories ===" && sudo find /home /opt /var -name "agrinext" -type d 2>/dev/null && \
echo "=== PM2 Location ===" && which pm2 || echo "pm2 not in PATH"
```

## Expected Output Analysis

### If you see something like:
```
ubuntu    1234  0.5  5.2  node /home/ubuntu/agrinext/backend/dist/server.js
```

Then:
1. The backend is running under user `ubuntu`
2. Located at `/home/ubuntu/agrinext/backend/`
3. Switch to that user: `sudo su - ubuntu`

### If you see:
```
LISTEN  1234/node
```

Then the backend is running. Get its working directory:
```bash
sudo ls -l /proc/1234/cwd
```

## After Finding the Backend Location

```bash
# Navigate to backend directory
cd <backend-path>

# Check .env file
cat .env | grep TWILIO

# If Twilio is missing, add it:
nano .env
# Add:
# TWILIO_ACCOUNT_SID=your_sid
# TWILIO_AUTH_TOKEN=your_token
# TWILIO_PHONE_NUMBER=your_number

# Restart the backend
pm2 restart agrinext-backend
# Or if using systemd:
sudo systemctl restart agrinext-backend
```
