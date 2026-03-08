#!/bin/bash

# ============================================
# Agrinext MVP - Database Setup Script
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="agrinext_mvp"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Agrinext MVP - Database Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 14+ first"
    exit 1
fi

echo -e "${YELLOW}Database Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Prompt for password
read -sp "Enter PostgreSQL password for $DB_USER: " DB_PASSWORD
echo ""
echo ""

# Export password for psql
export PGPASSWORD=$DB_PASSWORD

# Test connection
echo -e "${YELLOW}Testing database connection...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    echo "Please check your credentials and try again"
    exit 1
fi

# Check if database exists
echo -e "${YELLOW}Checking if database exists...${NC}"
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Dropping existing database...${NC}"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME"
        echo -e "${GREEN}✓ Database dropped${NC}"
    else
        echo -e "${YELLOW}Skipping database creation${NC}"
        exit 0
    fi
fi

# Create database
echo -e "${YELLOW}Creating database '$DB_NAME'...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME"
echo -e "${GREEN}✓ Database created${NC}"

# Run schema
echo -e "${YELLOW}Creating database schema...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql > /dev/null
echo -e "${GREEN}✓ Schema created${NC}"

# Count tables
TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")
echo -e "${GREEN}  Created $TABLE_COUNT tables${NC}"

# Load seed data
read -p "Do you want to load seed data? (Y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}Loading seed data...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed-data.sql > /dev/null
    echo -e "${GREEN}✓ Seed data loaded${NC}"
    
    # Show record counts
    echo -e "${GREEN}Record counts:${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        SELECT 'users' as table_name, COUNT(*) as records FROM users
        UNION ALL
        SELECT 'government_schemes', COUNT(*) FROM government_schemes
        UNION ALL
        SELECT 'disease_detections', COUNT(*) FROM disease_detections
        UNION ALL
        SELECT 'advisories', COUNT(*) FROM advisories
    " | grep -v "^-" | grep -v "^(" | grep -v "^$"
fi

# Create .env file
echo -e "${YELLOW}Creating .env file...${NC}"
cat > ../.env << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10

# Application
NODE_ENV=development
PORT=3000
EOF
echo -e "${GREEN}✓ .env file created${NC}"

# Clear password from environment
unset PGPASSWORD

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Connection details:${NC}"
echo "  postgresql://$DB_USER:****@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review the .env file in the project root"
echo "  2. Start building the Authentication Module"
echo "  3. Create the API Gateway"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
