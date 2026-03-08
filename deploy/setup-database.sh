#!/bin/bash
# Database Setup Script
# Run this script to initialize the production database

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

# Check required variables
if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Required environment variables not set${NC}"
    echo "Usage: DB_HOST=<host> DB_PASSWORD=<password> ./setup-database.sh"
    exit 1
fi

echo -e "${GREEN}Setting up database on $DB_HOST${NC}"

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Step 1: Create database
echo -e "${YELLOW}Step 1: Creating database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres << EOF
CREATE DATABASE $DB_NAME;
EOF

echo -e "${GREEN}✓ Database created${NC}"

# Step 2: Run schema
echo -e "${YELLOW}Step 2: Creating schema...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/schema.sql

echo -e "${GREEN}✓ Schema created${NC}"

# Step 3: Run migrations
echo -e "${YELLOW}Step 3: Running migrations...${NC}"
for migration in database/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "Running $migration..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration"
    fi
done

echo -e "${GREEN}✓ Migrations completed${NC}"

# Step 4: Seed data
echo -e "${YELLOW}Step 4: Seeding data...${NC}"
if [ -f "database/seed-data.sql" ]; then
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/seed-data.sql
    echo -e "${GREEN}✓ Data seeded${NC}"
else
    echo -e "${YELLOW}No seed data file found, skipping...${NC}"
fi

# Step 5: Verify setup
echo -e "${YELLOW}Step 5: Verifying setup...${NC}"
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo -e "${GREEN}✓ Database setup complete!${NC}"
echo "Tables created: $TABLE_COUNT"

# List tables
echo -e "\n${YELLOW}Tables:${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt"

# Unset password
unset PGPASSWORD

echo -e "\n${GREEN}Database is ready for use!${NC}"
