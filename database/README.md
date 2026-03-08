# Agrinext MVP - Database Setup Guide

## Overview

This directory contains all database-related files for the Agrinext MVP application. The database uses PostgreSQL 14+ and includes schema definitions, seed data, and migration scripts.

## Database Structure

### Tables

1. **users** - Farmer user profiles and authentication data
2. **otp_verifications** - Temporary OTP storage for authentication
3. **user_sessions** - JWT token management and session tracking
4. **disease_detections** - Crop disease detection results
5. **advisories** - Farming advisory queries and responses
6. **government_schemes** - Government scheme master data
7. **scheme_applications** - User applications to schemes (future)
8. **audit_logs** - System audit trail
9. **otp_rate_limits** - OTP request rate limiting per mobile number
10. **api_rate_limits** - API request rate limiting per user/IP

### Views

- **active_users_summary** - User activity summary
- **disease_outbreak_monitor** - Disease outbreak tracking

## Prerequisites

- PostgreSQL 14 or higher
- Database user with CREATE DATABASE privileges
- psql command-line tool (optional but recommended)

## Quick Start

### Option 1: Using psql (Recommended)

```bash
# 1. Create database
createdb agrinext_mvp

# 2. Run schema
psql -d agrinext_mvp -f schema.sql

# 3. Load seed data (optional)
psql -d agrinext_mvp -f seed-data.sql
```

### Option 2: Using PostgreSQL GUI (pgAdmin, DBeaver)

1. Create a new database named `agrinext_mvp`
2. Open and execute `schema.sql`
3. Open and execute `seed-data.sql` (optional)

### Option 3: Using Docker

```bash
# Start PostgreSQL container
docker run --name agrinext-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=agrinext_mvp \
  -p 5432:5432 \
  -d postgres:14

# Wait for container to be ready
sleep 5

# Run schema
docker exec -i agrinext-postgres psql -U postgres -d agrinext_mvp < schema.sql

# Load seed data
docker exec -i agrinext-postgres psql -U postgres -d agrinext_mvp < seed-data.sql
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_SSL=false

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### Connection String

```
postgresql://username:password@localhost:5432/agrinext_mvp
```

## Database Schema Details

### Key Features

✅ **UUID Primary Keys** - Using uuid-ossp extension for unique identifiers
✅ **Timestamps** - Automatic created_at and updated_at tracking
✅ **Indexes** - Optimized for common query patterns
✅ **Constraints** - Data validation at database level
✅ **Triggers** - Automatic timestamp updates
✅ **Views** - Pre-built queries for common analytics
✅ **Audit Trail** - Complete logging of user actions

### Data Types

- **UUID** - All primary keys
- **VARCHAR** - Text fields with length limits
- **TEXT** - Unlimited text (descriptions, responses)
- **DECIMAL** - Precise numbers (coordinates, confidence)
- **TIMESTAMP** - Date and time tracking
- **JSONB** - Flexible structured data
- **ARRAY** - Lists (benefits, documents)
- **INET** - IP addresses

### Relationships

```
users (1) ----< (N) disease_detections
users (1) ----< (N) advisories
users (1) ----< (N) user_sessions
users (1) ----< (N) scheme_applications
government_schemes (1) ----< (N) scheme_applications
```

## Seed Data

The `seed-data.sql` file includes:

- **5 Government Schemes** - PM-KISAN, PMFBY, KCC, Soil Health Card, Micro Irrigation
- **5 Sample Users** - For testing (different states and crops)
- **Sample Detections** - Test disease detection records
- **Sample Advisories** - Test advisory records

### Government Schemes Included

1. **PM-KISAN** - ₹6000/year income support
2. **PMFBY** - Crop insurance scheme
3. **Kisan Credit Card** - Low-interest loans
4. **Soil Health Card** - Free soil testing
5. **Micro Irrigation** - Drip/sprinkler subsidy

## Maintenance

### Regular Cleanup

Run these functions periodically:

```sql
-- Clean expired OTPs (run daily)
SELECT cleanup_expired_otps();

-- Clean expired sessions (run daily)
SELECT cleanup_expired_sessions();

-- Delete old audit logs (run monthly)
DELETE FROM audit_logs WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
```

### Backup

```bash
# Full backup
pg_dump agrinext_mvp > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump --schema-only agrinext_mvp > schema_backup.sql

# Data only
pg_dump --data-only agrinext_mvp > data_backup.sql
```

### Restore

```bash
# Restore from backup
psql agrinext_mvp < backup_20260301.sql
```

## Performance Optimization

### Indexes Created

- User lookups by mobile number
- Disease detections by user and date
- Advisories by user and date
- Schemes by category, state, and crop
- Geographic queries (lat/long)

### Query Optimization Tips

1. Use prepared statements
2. Leverage indexes for WHERE clauses
3. Use LIMIT for pagination
4. Use views for complex queries
5. Monitor slow queries with pg_stat_statements

## Security

### Best Practices

✅ Use environment variables for credentials
✅ Create separate database user for application
✅ Grant minimal required permissions
✅ Enable SSL for production
✅ Regular backups
✅ Monitor audit logs
✅ Rotate passwords regularly

### Create Application User

```sql
-- Create dedicated user
CREATE USER agrinext_app WITH PASSWORD 'secure_password_here';

-- Grant permissions
GRANT CONNECT ON DATABASE agrinext_mvp TO agrinext_app;
GRANT USAGE ON SCHEMA public TO agrinext_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO agrinext_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO agrinext_app;
```

## Monitoring

### Useful Queries

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Active connections
SELECT * FROM pg_stat_activity WHERE datname = 'agrinext_mvp';

-- Recent user activity
SELECT * FROM active_users_summary ORDER BY last_login DESC LIMIT 10;

-- Disease outbreak monitoring
SELECT * FROM disease_outbreak_monitor;
```

## Troubleshooting

### Common Issues

**Issue: "uuid-ossp extension not found"**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Issue: "Permission denied"**
- Check user has CREATE privileges
- Verify connection string
- Check pg_hba.conf for authentication

**Issue: "Connection refused"**
- Verify PostgreSQL is running
- Check port 5432 is open
- Verify host and credentials

**Issue: "Slow queries"**
- Check indexes are created
- Run ANALYZE on tables
- Monitor with pg_stat_statements

## Migrations

Database migrations are located in the `migrations/` directory and should be applied in order:

1. **001_add_rate_limit_tables.sql** - Initial rate limiting tables (Phase 1)
2. **002_phase2_schema_upgrade.sql** - Phase 2 schema enhancements
3. **003_add_rate_limit_tables.sql** - Additional rate limiting tables (OTP and API)

### Applying Migrations

```bash
# Apply a specific migration
psql -d agrinext_mvp -f migrations/003_add_rate_limit_tables.sql

# Or using environment variables
source .env
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/003_add_rate_limit_tables.sql
```

### Migration Strategy

For future schema changes:

1. Create migration file: `migrations/00X_description.sql`
2. Include both UP and DOWN migrations
3. Test on development database first
4. Backup production before applying
5. Apply during low-traffic period

## Next Steps

After database setup:

1. ✅ Database schema created
2. ⏭️ Create Authentication Module (Priority 1)
3. ⏭️ Create API Gateway (Priority 1)
4. ⏭️ Build Disease Detection Module (Priority 2)
5. ⏭️ Build Advisory Service Module (Priority 2)

## Support

For issues or questions:
- Check PostgreSQL logs: `/var/log/postgresql/`
- Review query performance: `EXPLAIN ANALYZE`
- Monitor connections: `pg_stat_activity`

---

**Database Version:** 1.0.0  
**Last Updated:** March 1, 2026  
**PostgreSQL Version:** 14+
