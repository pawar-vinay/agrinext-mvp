#!/bin/bash
# Database Backup Script
# Run this script to backup the production database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-agrinext}"
DB_USER="${DB_USER:-agrinextadmin}"
DB_PASSWORD="${DB_PASSWORD:-}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Check required variables
if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Required environment variables not set${NC}"
    echo "Usage: DB_HOST=<host> DB_PASSWORD=<password> ./backup-database.sh"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/agrinext-backup-$TIMESTAMP.sql"

echo -e "${GREEN}Starting database backup...${NC}"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Export password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    > "$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

# Get file size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}✓ Backup completed successfully!${NC}"
echo "Backup file: $BACKUP_FILE"
echo "Size: $BACKUP_SIZE"

# Upload to S3 (optional)
if [ ! -z "$S3_BACKUP_BUCKET" ]; then
    echo -e "${YELLOW}Uploading to S3...${NC}"
    aws s3 cp "$BACKUP_FILE" "s3://$S3_BACKUP_BUCKET/database-backups/"
    echo -e "${GREEN}✓ Uploaded to S3${NC}"
fi

# Clean up old backups (keep last 7 days)
echo -e "${YELLOW}Cleaning up old backups...${NC}"
find "$BACKUP_DIR" -name "agrinext-backup-*.sql.gz" -mtime +7 -delete
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Unset password
unset PGPASSWORD

echo -e "\n${GREEN}Backup process completed!${NC}"
