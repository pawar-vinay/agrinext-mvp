#!/bin/bash

# ============================================
# Agrinext Phase 2 Deployment Script (Fixed)
# Upgrades Phase 1 infrastructure to Phase 2
# Works with systemd or direct node processes
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PHASE1_DIR="$HOME/agrinext"
PHASE2_DIR="$HOME/agrinext-phase2"
BACKUP_DIR="$HOME/agrinext-backups"
LOG_FILE="$HOME/phase2-deployment.log"
S3_BUCKET="agrinext-images-1772367775698"

# Detect Node.js and npm paths
detect_node() {
    # Try common locations
    if command -v node &> /dev/null; then
        NODE_CMD="node"
        NPM_CMD="npm"
    elif [ -f "/home/ec2-user/.nvm/versions/node/v18.20.5/bin/node" ]; then
        export PATH="/home/ec2-user/.nvm/versions/node/v18.20.5/bin:$PATH"
        NODE_CMD="node"
        NPM_CMD="npm"
    elif [ -f "/usr/bin/node" ]; then
        NODE_CMD="/usr/bin/node"
        NPM_CMD="/usr/bin/npm"
    else
        # Try to find node
        NODE_PATH=$(sudo find /home -name "node" -type f 2>/dev/null | grep -E "bin/node$" | head -1)
        if [ -n "$NODE_PATH" ]; then
            export PATH="$(dirname $NODE_PATH):$PATH"
            NODE_CMD="node"
            NPM_CMD="npm"
        else
            return 1
        fi
    fi
    return 0
}

# Detect PM2
detect_pm2() {
    if command -v pm2 &> /dev/null; then
        PM2_CMD="pm2"
        return 0
    elif [ -f "/home/ec2-user/.nvm/versions/node/v18.20.5/bin/pm2" ]; then
        PM2_CMD="/home/ec2-user/.nvm/versions/node/v18.20.5/bin/pm2"
        return 0
    else
        PM2_PATH=$(sudo find /home -name "pm2" -type f 2>/dev/null | grep -E "bin/pm2$" | head -1)
        if [ -n "$PM2_PATH" ]; then
            PM2_CMD="$PM2_PATH"
            return 0
        fi
    fi
    return 1
}

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# ============================================
# 1. PRE-DEPLOYMENT CHECKS
# ============================================

log "Starting Phase 2 deployment..."
log "Performing pre-deployment checks..."

# Detect Node.js
if detect_node; then
    log "✓ Node.js found: $($NODE_CMD --version)"
else
    error "Node.js not found. Please install Node.js 18+ first."
fi

# Detect PM2 (optional)
if detect_pm2; then
    log "✓ PM2 found: $($PM2_CMD --version)"
    USE_PM2=true
else
    warn "PM2 not found. Will use systemd or direct node process."
    USE_PM2=false
fi

# Check if Phase 1 backend is running
log "Checking if Phase 1 backend is running..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    log "✓ Phase 1 backend is running on port 3000"
else
    warn "Phase 1 backend not responding on port 3000"
fi

# Check if Phase 1 directory exists
if [ ! -d "$PHASE1_DIR" ]; then
    error "Phase 1 directory not found: $PHASE1_DIR"
fi

log "✓ Phase 1 directory found: $PHASE1_DIR"

# Check PostgreSQL client
if ! command -v psql &> /dev/null; then
    warn "PostgreSQL client not found. Installing..."
    sudo yum install -y postgresql15 2>&1 | tee -a "$LOG_FILE"
fi

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    error "AWS CLI not found. Please install AWS CLI first."
fi

# Check disk space (need at least 2GB free)
FREE_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$FREE_SPACE" -lt 2 ]; then
    error "Insufficient disk space. Need at least 2GB free, have ${FREE_SPACE}GB"
fi

log "✓ Pre-deployment checks passed"

# ============================================
# 2. BACKUP PHASE 1
# ============================================

log "Creating backup of Phase 1..."

# Create backup directory
mkdir -p "$BACKUP_DIR"
CURRENT_BACKUP="$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$CURRENT_BACKUP"

# Backup Phase 1 code
if [ -d "$PHASE1_DIR" ]; then
    log "Backing up Phase 1 code..."
    cp -r "$PHASE1_DIR" "$CURRENT_BACKUP/phase1-code"
fi

# Backup database
log "Backing up database..."
if [ -f "$PHASE1_DIR/backend/.env" ]; then
    source "$PHASE1_DIR/backend/.env"
    PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$CURRENT_BACKUP/database-backup.sql" 2>&1 | tee -a "$LOG_FILE"
    log "✓ Database backup created: $CURRENT_BACKUP/database-backup.sql"
else
    warn "No .env file found. Skipping database backup."
fi

# Backup PM2 configuration if PM2 is used
if [ "$USE_PM2" = true ]; then
    sudo -u ec2-user $PM2_CMD save 2>/dev/null || true
    if [ -f "/home/ec2-user/.pm2/dump.pm2" ]; then
        cp /home/ec2-user/.pm2/dump.pm2 "$CURRENT_BACKUP/pm2-dump.pm2" 2>/dev/null || true
    fi
fi

log "✓ Backup completed: $CURRENT_BACKUP"

# ============================================
# 3. DOWNLOAD PHASE 2 CODE
# ============================================

log "Downloading Phase 2 code from S3..."

# Create Phase 2 directory
mkdir -p "$PHASE2_DIR"

# Download backend code
log "Downloading backend ZIP..."
aws s3 cp "s3://$S3_BUCKET/phase2/phase2-backend.zip" "$PHASE2_DIR/" --region us-east-1

# Extract backend code
log "Extracting backend code..."
cd "$PHASE2_DIR"
unzip -q phase2-backend.zip
rm phase2-backend.zip

# Download database migration
log "Downloading database migration..."
mkdir -p "$PHASE2_DIR/database/migrations"
aws s3 cp "s3://$S3_BUCKET/phase2/database/migrations/002_phase2_schema_upgrade.sql" "$PHASE2_DIR/database/migrations/" --region us-east-1

log "✓ Phase 2 code downloaded"

# ============================================
# 4. INSTALL DEPENDENCIES
# ============================================

log "Installing Phase 2 dependencies..."

cd "$PHASE2_DIR/backend"

# Install Node.js dependencies
log "Running npm install (this may take 20-30 minutes)..."
$NPM_CMD install --production 2>&1 | tee -a "$LOG_FILE"

# Build TypeScript code
log "Building TypeScript code (this may take 5-10 minutes)..."
$NPM_CMD run build 2>&1 | tee -a "$LOG_FILE"

if [ ! -d "dist" ]; then
    error "TypeScript build failed. dist/ directory not found."
fi

log "✓ Dependencies installed and code built"

# ============================================
# 5. CONFIGURE ENVIRONMENT
# ============================================

log "Configuring environment variables..."

# Copy Phase 1 .env as template
if [ -f "$PHASE1_DIR/backend/.env" ]; then
    cp "$PHASE1_DIR/backend/.env" "$PHASE2_DIR/backend/.env"
    log "✓ Copied existing .env file"
    
    warn ""
    warn "============================================"
    warn "⚠️  IMPORTANT: UPDATE API KEYS"
    warn "============================================"
    warn ""
    warn "Please update .env file with your API keys:"
    warn ""
    warn "Required API keys:"
    warn "  - TWILIO_ACCOUNT_SID"
    warn "  - TWILIO_AUTH_TOKEN"
    warn "  - TWILIO_PHONE_NUMBER"
    warn "  - OPENAI_API_KEY"
    warn "  - HUGGINGFACE_API_KEY"
    warn "  - GOOGLE_PROJECT_ID"
    warn ""
    warn "To edit the .env file:"
    warn "  1. Open a NEW terminal tab (keep this one open)"
    warn "  2. Connect to EC2 again via Session Manager"
    warn "  3. Run: cd ~/agrinext-phase2/backend"
    warn "  4. Run: nano .env"
    warn "  5. Update the API keys"
    warn "  6. Press Ctrl+X, then Y, then Enter to save"
    warn "  7. Come back to this terminal"
    warn ""
    warn "============================================"
    warn ""
    read -p "Press Enter after updating .env file..."
else
    error ".env file not found in Phase 1. Cannot proceed."
fi

log "✓ Environment configured"

# ============================================
# 6. RUN DATABASE MIGRATION
# ============================================

log "Running database migration..."

# Source environment variables
source "$PHASE2_DIR/backend/.env"

# Check if migration file exists
MIGRATION_FILE="$PHASE2_DIR/database/migrations/002_phase2_schema_upgrade.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    error "Migration file not found: $MIGRATION_FILE"
fi

# Run migration
log "Applying schema changes..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE" 2>&1 | tee -a "$LOG_FILE"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    error "Database migration failed. Check log file: $LOG_FILE"
fi

log "✓ Database migration completed"

# ============================================
# 7. CHECK IAM ROLE PERMISSIONS
# ============================================

log "Checking IAM role permissions..."

# Test S3 write access
TEST_FILE="/tmp/iam-test-$(date +%s).txt"
echo "IAM test" > "$TEST_FILE"

if aws s3 cp "$TEST_FILE" "s3://$S3_BUCKET/test/" --region us-east-1 &> /dev/null; then
    log "✓ S3 write access confirmed"
    aws s3 rm "s3://$S3_BUCKET/test/$(basename $TEST_FILE)" --region us-east-1 &> /dev/null
    rm "$TEST_FILE"
else
    error "S3 write access not available. IAM role update may have failed."
fi

# ============================================
# 8. STOP PHASE 1 BACKEND
# ============================================

log "Stopping Phase 1 backend..."

# Find and stop the Phase 1 process
if [ "$USE_PM2" = true ]; then
    log "Stopping via PM2..."
    sudo -u ec2-user $PM2_CMD stop agrinext-api 2>/dev/null || true
    sudo -u ec2-user $PM2_CMD delete agrinext-api 2>/dev/null || true
else
    log "Finding Phase 1 process..."
    PHASE1_PID=$(sudo lsof -ti:3000 2>/dev/null || true)
    if [ -n "$PHASE1_PID" ]; then
        log "Stopping process $PHASE1_PID..."
        sudo kill $PHASE1_PID
        sleep 2
    fi
fi

log "✓ Phase 1 backend stopped"

# ============================================
# 9. START PHASE 2 BACKEND
# ============================================

log "Starting Phase 2 backend..."

cd "$PHASE2_DIR/backend"

if [ "$USE_PM2" = true ]; then
    log "Starting with PM2..."
    sudo -u ec2-user $PM2_CMD start dist/server.js \
        --name agrinext-api \
        --instances 1 \
        --max-memory-restart 400M \
        --env production
    
    sudo -u ec2-user $PM2_CMD save
else
    log "Starting with systemd..."
    
    # Create systemd service file
    sudo tee /etc/systemd/system/agrinext.service > /dev/null <<EOF
[Unit]
Description=Agrinext Phase 2 Backend
After=network.target

[Service]
Type=simple
User=ssm-user
WorkingDirectory=$PHASE2_DIR/backend
Environment=NODE_ENV=production
EnvironmentFile=$PHASE2_DIR/backend/.env
ExecStart=$NODE_CMD dist/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and start service
    sudo systemctl daemon-reload
    sudo systemctl enable agrinext
    sudo systemctl start agrinext
fi

# Wait for server to start
log "Waiting for server to start..."
sleep 10

# ============================================
# 10. VERIFY DEPLOYMENT
# ============================================

log "Verifying deployment..."

# Test health endpoint
log "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    log "✓ Health check passed"
else
    error "Health check failed. Response: $HEALTH_RESPONSE"
fi

# Test API version endpoint
log "Testing API version endpoint..."
API_RESPONSE=$(curl -s http://localhost:3000/api/v1)

if echo "$API_RESPONSE" | grep -q "Agrinext API"; then
    log "✓ API version check passed"
else
    warn "API version check failed. Response: $API_RESPONSE"
fi

# Test database connection
log "Testing database connection..."
if echo "$HEALTH_RESPONSE" | grep -q '"database":"connected"'; then
    log "✓ Database connection verified"
else
    warn "Database connection issue detected"
fi

# ============================================
# 11. DEPLOYMENT SUMMARY
# ============================================

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

log ""
log "============================================"
log "Phase 2 Deployment Complete!"
log "============================================"
log ""
log "Deployment Summary:"
log "  - Phase 1 backup: $CURRENT_BACKUP"
log "  - Phase 2 location: $PHASE2_DIR"
log "  - Log file: $LOG_FILE"
log ""
log "Service Status:"
log "  - Backend API: http://$PUBLIC_IP:3000"
log "  - Health Check: http://$PUBLIC_IP:3000/health"
log "  - API Version: http://$PUBLIC_IP:3000/api/v1"
log ""
if [ "$USE_PM2" = true ]; then
    log "Useful Commands:"
    log "  - View logs: sudo -u ec2-user $PM2_CMD logs agrinext-api"
    log "  - Restart: sudo -u ec2-user $PM2_CMD restart agrinext-api"
    log "  - Status: sudo -u ec2-user $PM2_CMD status"
else
    log "Useful Commands:"
    log "  - View logs: sudo journalctl -u agrinext -f"
    log "  - Restart: sudo systemctl restart agrinext"
    log "  - Status: sudo systemctl status agrinext"
fi
log ""
log "Next Steps:"
log "  1. Test all API endpoints"
log "  2. Configure mobile app with: http://$PUBLIC_IP:3000"
log "  3. Monitor logs for 24 hours"
log ""
log "============================================"

# ============================================
# END OF DEPLOYMENT SCRIPT
# ============================================
