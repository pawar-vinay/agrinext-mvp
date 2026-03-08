# ============================================
# Agrinext MVP - Database Setup Script (PowerShell)
# ============================================

$ErrorActionPreference = "Stop"

# Configuration
$DB_NAME = "agrinext_mvp"
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }

Write-Host "========================================" -ForegroundColor Green
Write-Host "Agrinext MVP - Database Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Host "Error: PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL 14+ first" -ForegroundColor Yellow
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER"
Write-Host ""

# Prompt for password
$SecurePassword = Read-Host "Enter PostgreSQL password for $DB_USER" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
Write-Host ""

# Set environment variable for psql
$env:PGPASSWORD = $DB_PASSWORD

# Test connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Connection successful" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "✗ Connection failed" -ForegroundColor Red
    Write-Host "Please check your credentials and try again" -ForegroundColor Yellow
    exit 1
}

# Check if database exists
Write-Host "Checking if database exists..." -ForegroundColor Yellow
$dbExists = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>&1

if ($dbExists -eq "1") {
    Write-Host "Database '$DB_NAME' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME" | Out-Null
        Write-Host "✓ Database dropped" -ForegroundColor Green
    } else {
        Write-Host "Skipping database creation" -ForegroundColor Yellow
        exit 0
    }
}

# Create database
Write-Host "Creating database '$DB_NAME'..." -ForegroundColor Yellow
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME" | Out-Null
Write-Host "✓ Database created" -ForegroundColor Green

# Run schema
Write-Host "Creating database schema..." -ForegroundColor Yellow
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql | Out-Null
Write-Host "✓ Schema created" -ForegroundColor Green

# Count tables
$tableCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'"
Write-Host "  Created $tableCount tables" -ForegroundColor Green

# Load seed data
$response = Read-Host "Do you want to load seed data? (Y/n)"
if ($response -ne "n" -and $response -ne "N") {
    Write-Host "Loading seed data..." -ForegroundColor Yellow
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed-data.sql | Out-Null
    Write-Host "✓ Seed data loaded" -ForegroundColor Green
    
    # Show record counts
    Write-Host "Record counts:" -ForegroundColor Green
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c @"
        SELECT 'users' as table_name, COUNT(*) as records FROM users
        UNION ALL
        SELECT 'government_schemes', COUNT(*) FROM government_schemes
        UNION ALL
        SELECT 'disease_detections', COUNT(*) FROM disease_detections
        UNION ALL
        SELECT 'advisories', COUNT(*) FROM advisories
"@
}

# Create .env file
Write-Host "Creating .env file..." -ForegroundColor Yellow
$envContent = @"
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
"@

$envContent | Out-File -FilePath "../.env" -Encoding UTF8
Write-Host "✓ .env file created" -ForegroundColor Green

# Clear password from environment
Remove-Item Env:\PGPASSWORD
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Connection details:" -ForegroundColor Yellow
Write-Host "  postgresql://$DB_USER`:****@$DB_HOST`:$DB_PORT/$DB_NAME"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review the .env file in the project root"
Write-Host "  2. Start building the Authentication Module"
Write-Host "  3. Create the API Gateway"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
