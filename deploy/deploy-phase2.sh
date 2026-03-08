#!/bin/bash

# ============================================
# Agrinext Phase 2 Deployment Script
# Upgrades Phase 1 infrastructure to Phase 2
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

# Check if Phase 1 is running
if ! pm2 list | grep -q "agrinext-api"; then
    error "Phase 1 backend not found in PM2. Please ensure Phase 1 is deployed first."
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ required. Current version: $(node --version)"
fi

# Check PostgreSQL client
if ! command -v psql &> /dev/null; then
    warn "PostgreSQL client not found. Installing..."
    sudo yum install -y postgresql15
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
mkdir -p "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
CURRENT_BACKUP="$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"

# Backup Phase 1 code
if [ -d "$PHASE1_DIR" ]; then
    log "Backing up Phase 1 code..."
    cp -r "$PHASE1_DIR" "$CURRENT_BACKUP/phase1-code"
fi

# Backup database
log "Backing up database..."
if [ -f "$PHASE1_DIR/.env" ]; then
    source "$PHASE1_DIR/.env"
    pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$CURRENT_BACKUP/database-backup.sql"
    log "✓ Database backup created: $CURRENT_BACKUP/database-backup.sql"
else
    warn "No .env file found. Skipping database backup."
fi

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 "$CURRENT_BACKUP/pm2-dump.pm2"

log "✓ Backup completed: $CURRENT_BACKUP"

# ============================================
# 3. DOWNLOAD PHASE 2 CODE
# ============================================

log "Downloading Phase 2 code from S3..."

# Create Phase 2 directory
mkdir -p "$PHASE2_DIR"

# Check if code is in S3
if aws s3 ls "s3://$S3_BUCKET/phase2/" &> /dev/null; then
    log "Downloading from S3..."
    aws s3 sync "s3://$S3_BUCKET/phase2/" "$PHASE2_DIR/" --region us-east-1
else
    warn "Phase 2 code not found in S3. Please upload code first or use local copy."
    info "To upload: aws s3 sync ./backend s3://$S3_BUCKET/phase2/backend/ --region us-east-1"
    
    # Check if local code exists
    if [ -d "./backend" ]; then
        log "Using local backend code..."
        cp -r ./backend "$PHASE2_DIR/"
    else
        error "No Phase 2 code found. Please provide code in ./backend or upload to S3."
    fi
fi

log "✓ Phase 2 code downloaded"

# ============================================
# 4. INSTALL DEPENDENCIES
# ============================================

log "Installing Phase 2 dependencies..."

cd "$PHASE2_DIR/backend"

# Install Node.js dependencies
log "Running npm install..."
npm install --production

# Build TypeScript code
log "Building TypeScript code..."
npm run build

if [ ! -d "dist" ]; then
    error "TypeScript build failed. dist/ directory not found."
fi

log "✓ Dependencies installed and code built"

# ============================================
# 5. CONFIGURE ENVIRONMENT
# ============================================

log "Configuring environment variables..."

# Copy Phase 1 .env as template
if [ -f "$PHASE1_DIR/.env" ]; then
    cp "$PHASE1_DIR/.env" "$PHASE2_DIR/backend/.env"
    log "✓ Copied existing .env file"
else
    warn "No existing .env file found. Creating from template..."
    
    # Create .env from template
    if [ -f "$PHASE2_DIR/backend/.env.production.example" ]; then
        cp "$PHASE2_DIR/backend/.env.production.example" "$PHASE2_DIR/backend/.env"
        warn "Please update .env file with your API keys before continuing."
        warn "Required: TWILIO_*, OPENAI_API_KEY, HUGGINGFACE_API_KEY, GOOGLE_PROJECT_ID"
        read -p "Press Enter after updating .env file..."
    else
        error ".env.production.example not found. Cannot create .env file."
    fi
fi

# Verify required environment variables
log "Verifying environment variables..."
source "$PHASE2_DIR/backend/.env"

REQUIRED_VARS=(
    "DB_HOST"
    "DB_NAME"
    "DB_USER"
    "DB_PASSWORD"
    "JWT_SECRET"
    "REFRESH_TOKEN_SECRET"
    "AWS_S3_BUCKET"
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_PHONE_NUMBER"
    "OPENAI_API_KEY"
    "HUGGINGFACE_API_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; then
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    error "Missing required environment variables: ${MISSING_VARS[*]}"
fi

log "✓ Environment configured"

# ============================================
# 6. RUN DATABASE MIGRATION
# ============================================

log "Running database migration..."

# Check if migration file exists
MIGRATION_FILE="$PHASE2_DIR/database/migrations/002_phase2_schema_upgrade.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    # Try alternative location
    MIGRATION_FILE="./database/migrations/002_phase2_schema_upgrade.sql"
    if [ ! -f "$MIGRATION_FILE" ]; then
        error "Migration file not found: 002_phase2_schema_upgrade.sql"
    fi
fi

# Run migration
log "Applying schema changes..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE" 2>&1 | tee -a "$LOG_FILE"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    error "Database migration failed. Check log file: $LOG_FILE"
fi

log "✓ Database migration completed"

# ============================================
# 7. UPDATE IAM ROLE (MANUAL STEP)
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
    warn "S3 write access not available. Please update IAM role:"
    warn "1. Go to AWS Console → IAM → Roles → AgrinextEC2Role"
    warn "2. Attach policy: AmazonS3FullAccess (or create custom policy)"
    warn "3. Wait 1-2 minutes for permissions to propagate"
    read -p "Press Enter after updating IAM role..."
fi

# ============================================
# 8. STOP PHASE 1 BACKEND
# ============================================

log "Stopping Phase 1 backend..."

pm2 stop agrinext-api
pm2 delete agrinext-api

log "✓ Phase 1 backend stopped"

# ============================================
# 9. START PHASE 2 BACKEND
# ============================================

log "Starting Phase 2 backend..."

cd "$PHASE2_DIR/backend"

# Start with PM2
pm2 start dist/server.js \
    --name agrinext-api \
    --instances 1 \
    --max-memory-restart 400M \
    --env production

# Save PM2 configuration
pm2 save

# Wait for server to start
log "Waiting for server to start..."
sleep 5

# Check if server is running
if pm2 list | grep -q "agrinext-api.*online"; then
    log "✓ Phase 2 backend started successfully"
else
    error "Phase 2 backend failed to start. Check PM2 logs: pm2 logs agrinext-api"
fi

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

# Check PM2 status
log "PM2 Status:"
pm2 status

# Check logs for errors
log "Recent logs:"
pm2 logs agrinext-api --lines 20 --nostream

# ============================================
# 11. POST-DEPLOYMENT TASKS
# ============================================

log "Running post-deployment tasks..."

# Clean up old OTPs and sessions
log "Cleaning up expired data..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT cleanup_expired_otps();" &> /dev/null
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT cleanup_expired_sessions();" &> /dev/null

# Set up log rotation (optional)
if [ ! -f "/etc/logrotate.d/agrinext" ]; then
    log "Setting up log rotation..."
    sudo tee /etc/logrotate.d/agrinext > /dev/null <<EOF
$HOME/.pm2/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
EOF
fi

log "✓ Post-deployment tasks completed"

# ============================================
# 12. DEPLOYMENT SUMMARY
# ============================================

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
log "  - Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
log "  - Health Check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000/health"
log "  - API Version: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000/api/v1"
log ""
log "Useful Commands:"
log "  - View logs: pm2 logs agrinext-api"
log "  - Restart: pm2 restart agrinext-api"
log "  - Status: pm2 status"
log "  - Monitor: pm2 monit"
log ""
log "Rollback Instructions:"
log "  If you need to rollback to Phase 1:"
log "  1. pm2 stop agrinext-api"
log "  2. pm2 delete agrinext-api"
log "  3. cd $PHASE1_DIR/backend"
log "  4. pm2 start src/server.js --name agrinext-api"
log "  5. psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME < $CURRENT_BACKUP/database-backup.sql"
log ""
log "Next Steps:"
log "  1. Test all API endpoints"
log "  2. Configure mobile app with new endpoints"
log "  3. Monitor logs for 24 hours"
log "  4. Set up external service accounts (Twilio, OpenAI, etc.)"
log ""
log "============================================"

# ============================================
# END OF DEPLOYMENT SCRIPT
# ============================================

