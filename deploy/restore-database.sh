#!/bin/bash
# Database Restore Script
# Run this script to restore the production database from backup

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
BACKUP_FILE="${BACKUP_FILE:-}"

# Check required variables
if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ] || [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Required environment variables not set${NC}"
    echo "Usage: DB_HOST=<host> DB_PASSWORD=<password> BACKUP_FILE=<file> ./restore-database.sh"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}WARNING: This will overwrite the current database!${NC}"
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    gunzip -k "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Drop existing connections
echo -e "${YELLOW}Dropping existing connections...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();
EOF

# Drop and recreate database
echo -e "${YELLOW}Recreating database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres << EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

# Restore backup
echo -e "${YELLOW}Restoring backup...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"

# Verify restore
echo -e "${YELLOW}Verifying restore...${NC}"
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo -e "${GREEN}✓ Database restored successfully!${NC}"
echo "Tables restored: $TABLE_COUNT"

# Unset password
unset PGPASSWORD

echo -e "\n${GREEN}Restore process completed!${NC}"
