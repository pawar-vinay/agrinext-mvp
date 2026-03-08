# Deployment Scripts

This directory contains automated deployment scripts for the Agrinext application.

## Scripts Overview

### 1. setup-database.sh
Initializes the production database with schema, migrations, and seed data.

**Usage**:
```bash
DB_HOST=your-rds-endpoint DB_PASSWORD=your-password ./setup-database.sh
```

**What it does**:
- Creates database
- Runs schema.sql
- Applies migrations
- Seeds initial data
- Verifies setup

### 2. deploy-backend.sh
Deploys the backend application to EC2.

**Usage**:
```bash
EC2_HOST=your-ec2-ip ./deploy-backend.sh
```

**What it does**:
- Builds application locally
- Creates deployment package
- Uploads to EC2
- Installs dependencies
- Restarts PM2 process
- Verifies deployment

### 3. backup-database.sh
Creates a backup of the production database.

**Usage**:
```bash
DB_HOST=your-rds-endpoint DB_PASSWORD=your-password ./backup-database.sh
```

**What it does**:
- Creates SQL dump
- Compresses backup
- Optionally uploads to S3
- Cleans up old backups (>7 days)

### 4. restore-database.sh
Restores database from a backup file.

**Usage**:
```bash
DB_HOST=your-rds-endpoint DB_PASSWORD=your-password BACKUP_FILE=backup.sql.gz ./restore-database.sh
```

**What it does**:
- Drops existing database
- Creates new database
- Restores from backup
- Verifies restore

### 5. ec2-user-data.sh
EC2 instance initialization script (runs on first boot).

**What it does**:
- Installs Node.js
- Installs PostgreSQL client
- Installs PM2
- Installs Nginx
- Configures Nginx
- Installs CloudWatch agent

## Prerequisites

### Required Tools
- AWS CLI configured
- PostgreSQL client (psql)
- SSH access to EC2
- Bash shell

### Required Environment Variables

For database scripts:
- `DB_HOST` - RDS endpoint
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: agrinext)
- `DB_USER` - Database user (default: agrinextadmin)
- `DB_PASSWORD` - Database password

For deployment scripts:
- `EC2_HOST` - EC2 public IP or domain
- `EC2_USER` - SSH user (default: ec2-user)
- `EC2_KEY` - SSH key file (default: agrinext-key.pem)

## Quick Start

### First Time Setup

1. **Make scripts executable**:
   ```bash
   chmod +x *.sh
   ```

2. **Set up database**:
   ```bash
   export DB_HOST=your-rds-endpoint.rds.amazonaws.com
   export DB_PASSWORD=your-secure-password
   ./setup-database.sh
   ```

3. **Deploy backend**:
   ```bash
   export EC2_HOST=your-ec2-public-ip
   ./deploy-backend.sh
   ```

### Regular Deployment

```bash
# Deploy new version
export EC2_HOST=your-ec2-public-ip
./deploy-backend.sh
```

### Regular Backup

```bash
# Create backup
export DB_HOST=your-rds-endpoint
export DB_PASSWORD=your-password
./backup-database.sh

# Backups are stored in ./backups/ directory
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check security group
aws ec2 describe-security-groups --group-ids <rds-sg-id>
```

### Deployment Issues
```bash
# Check PM2 status
ssh -i agrinext-key.pem ec2-user@$EC2_HOST
pm2 status
pm2 logs agrinext-backend

# Restart application
pm2 restart agrinext-backend
```

### Backup/Restore Issues
```bash
# Verify backup file
gunzip -t backup.sql.gz

# Check disk space
df -h

# Check PostgreSQL version
psql --version
```

## Best Practices

### Before Deployment
1. Test locally
2. Review changes
3. Backup database
4. Notify team
5. Plan rollback

### During Deployment
1. Monitor logs
2. Check health endpoint
3. Verify core features
4. Monitor metrics

### After Deployment
1. Run smoke tests
2. Monitor for errors
3. Check performance
4. Collect feedback

## Automation

### Cron Jobs

Add to crontab for automated backups:
```bash
# Daily backup at 3 AM
0 3 * * * /path/to/deploy/backup-database.sh

# Weekly cleanup
0 4 * * 0 find /path/to/backups -name "*.sql.gz" -mtime +30 -delete
```

### CI/CD Integration

Example GitHub Actions workflow:
```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        env:
          EC2_HOST: ${{ secrets.EC2_HOST }}
          EC2_KEY: ${{ secrets.EC2_KEY }}
        run: |
          echo "$EC2_KEY" > key.pem
          chmod 400 key.pem
          ./deploy/deploy-backend.sh
```

## Security Notes

1. **Never commit secrets**
   - Use environment variables
   - Use AWS Secrets Manager
   - Rotate credentials regularly

2. **Secure SSH keys**
   - Use strong passphrases
   - Restrict file permissions (chmod 400)
   - Store securely

3. **Database security**
   - Use strong passwords
   - Restrict network access
   - Enable encryption at rest
   - Enable SSL connections

## Support

For issues or questions:
- Email: tech@agrinext.com
- Documentation: ../DEPLOYMENT-GUIDE.md
- Emergency: Follow rollback procedure

## Version History

- **1.0.0** (2026-03-02): Initial deployment scripts
