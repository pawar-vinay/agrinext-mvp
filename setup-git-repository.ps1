# Setup Git Repository and Push to GitHub
# Repository: https://github.com/pawar-vinay/agrinext-mvp

$ErrorActionPreference = "Stop"

$REPO_URL = "https://github.com/pawar-vinay/agrinext-mvp.git"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AgriNext - Git Repository Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "Found: $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Git is not installed" -ForegroundColor Red
    exit 1
}

# Check if already a git repository
if (Test-Path .git) {
    Write-Host "Git repository already initialized" -ForegroundColor Yellow
}
else {
    Write-Host "[1/6] Initializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Add .gitignore first
Write-Host "[2/6] Adding .gitignore..." -ForegroundColor Yellow
git add .gitignore
git add .env.example 2>$null

# Add source code
Write-Host "[3/6] Adding source code..." -ForegroundColor Yellow
git add backend/src/
git add backend/tests/
git add backend/package.json
git add backend/package-lock.json
git add backend/tsconfig.json
git add backend/jest.config.js
git add backend/.env.example

git add web-app/src/
git add web-app/index.html
git add web-app/package.json
git add web-app/package-lock.json
git add web-app/tsconfig.json
git add web-app/vite.config.ts

# Add database files
Write-Host "[4/6] Adding database files..." -ForegroundColor Yellow
git add database/schema.sql
git add database/seed-data.sql
git add database/migrations/
git add database/setup.sh
git add database/setup.ps1
git add database/README.md

# Add deployment scripts
Write-Host "[5/6] Adding deployment scripts..." -ForegroundColor Yellow
git add deploy/*.sh
git add deploy/*.md

# Add documentation
Write-Host "[6/6] Adding documentation..." -ForegroundColor Yellow
git add README.md
git add AGRINEXT-WALKTHROUGH.md
git add ARCHITECTURE-DIAGRAM.md
git add GIT-COMMIT-GUIDE.md
git add .kiro/specs/agrinext/

Write-Host ""
Write-Host "Files staged for commit:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "SECURITY CHECK" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Check for sensitive data
$sensitivePatterns = @("sk-proj", "hf_", "AKIA", "Agrinextow7s74of")
$foundSensitive = $false

foreach ($pattern in $sensitivePatterns) {
    $result = git diff --cached | Select-String -Pattern $pattern -Quiet
    if ($result) {
        Write-Host "⚠️  WARNING: Found pattern '$pattern' in staged files" -ForegroundColor Red
        $foundSensitive = $true
    }
}

if ($foundSensitive) {
    Write-Host ""
    Write-Host "CRITICAL: Sensitive data detected!" -ForegroundColor Red
    Write-Host "Review staged files and remove sensitive information before committing." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "✓ No sensitive data detected" -ForegroundColor Green
Write-Host ""


# Prompt for commit
Write-Host "Ready to commit. Review the files above." -ForegroundColor Cyan
$confirm = Read-Host "Proceed with commit? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Commit cancelled" -ForegroundColor Yellow
    exit 0
}

# Commit
Write-Host ""
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "feat: Initial AgriNext MVP implementation

- Backend API with Express + TypeScript
- Web app with React + Vite  
- Disease detection with Hugging Face
- Advisory service with OpenAI
- PostgreSQL database schema
- AWS deployment configuration
- Comprehensive documentation"

# Check if remote exists
$remoteExists = git remote | Select-String -Pattern "origin" -Quiet

if (-not $remoteExists) {
    Write-Host ""
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin $REPO_URL
}

# Push to GitHub
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "READY TO PUSH TO GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Repository: $REPO_URL" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Make sure you have:" -ForegroundColor Yellow
Write-Host "  1. Created the repository on GitHub" -ForegroundColor White
Write-Host "  2. Have push access to the repository" -ForegroundColor White
Write-Host "  3. GitHub credentials configured (SSH or HTTPS)" -ForegroundColor White
Write-Host ""

$pushConfirm = Read-Host "Push to GitHub now? (yes/no)"

if ($pushConfirm -eq "yes") {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Green
    git push -u origin main
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Repository URL: $REPO_URL" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "Commit created locally. Push manually with:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host ""
}
