# Git Repository Commit Guide

## ✅ FILES TO COMMIT

### Source Code
```
✅ backend/src/**/*.ts          # All TypeScript source files
✅ backend/src/**/*.js           # JavaScript files (if any)
✅ web-app/src/**/*              # All web app source files
✅ database/schema.sql           # Database schema
✅ database/migrations/*.sql     # Migration files
✅ database/seed-data.sql        # Seed data
```

### Configuration Files (Templates Only)
```
✅ backend/.env.example          # Template with placeholder values
✅ backend/.env.production.example  # Production template
✅ backend/package.json          # Dependencies
✅ backend/package-lock.json     # Lock file
✅ backend/tsconfig.json         # TypeScript config
✅ backend/jest.config.js        # Test config
✅ web-app/package.json          # Dependencies
✅ web-app/package-lock.json     # Lock file
✅ web-app/tsconfig.json         # TypeScript config
✅ web-app/vite.config.ts        # Vite config
✅ web-app/index.html            # HTML template
```

### Documentation
```
✅ README.md                     # Project overview
✅ AGRINEXT-WALKTHROUGH.md       # Complete walkthrough
✅ ARCHITECTURE-DIAGRAM.md       # Architecture documentation
✅ AGRINEXT-PRESENTATION.md      # Presentation content
✅ AGRINEXT-PRESENTATION-OUTLINE.md
✅ AGRINEXT-DEPLOYMENT-COMPLETE.md
✅ DISEASE-DETECTION-DEMO-SETUP.md
✅ CONNECT-TO-EC2.md
✅ database/README.md            # Database documentation
✅ deploy/README.md              # Deployment documentation
✅ deploy/environment-setup.md
```

### Deployment Scripts
```
✅ deploy/deploy-backend.sh      # Backend deployment
✅ deploy/deploy-webapp.sh       # Web app deployment
✅ deploy/deploy-phase2.sh
✅ deploy/setup-database.sh      # Database setup
✅ deploy/backup-database.sh     # Backup script
✅ deploy/restore-database.sh    # Restore script
✅ database/setup.sh             # Database initialization
✅ database/setup.ps1            # Windows setup
```

### Spec Files
```
✅ .kiro/specs/agrinext/requirements.md
✅ .kiro/specs/agrinext/design.md
✅ .kiro/specs/agrinext/mvp.md
✅ .kiro/specs/agrinext/tasks.md
✅ .kiro/specs/agrinext/.config.kiro
```

### Git Configuration
```
✅ .gitignore                    # Git ignore rules
```


---

## ❌ FILES TO NEVER COMMIT

### Sensitive Credentials (CRITICAL - NEVER COMMIT)
```
❌ backend/.env                  # Contains real API keys and passwords
❌ backend/.env.production       # Production credentials
❌ *.pem                         # SSH private keys
❌ *.csv (in Aws Resoucres/)    # AWS credentials
❌ Aws Resoucres/               # Entire folder with credentials
```

### Build Artifacts
```
❌ backend/dist/                # Compiled JavaScript
❌ backend/node_modules/        # Dependencies (reinstall with npm)
❌ web-app/dist/                # Built web app
❌ web-app/node_modules/        # Dependencies
❌ *.tar.gz                     # Deployment packages
❌ *.zip                        # Compressed files
```

### Logs and Temporary Files
```
❌ backend/logs/*.log           # Application logs
❌ *.log                        # All log files
❌ *.tmp                        # Temporary files
❌ backend.log                  # Server logs
```

### Generated Files
```
❌ *.js.map                     # Source maps
❌ coverage/                    # Test coverage reports
```

### Local Development Files
```
❌ .vscode/                     # VS Code settings (optional)
❌ .idea/                       # IntelliJ settings
```

---

## 📋 COMMIT CHECKLIST

Before committing, verify:

- [ ] No .env files with real credentials
- [ ] No .pem files (SSH keys)
- [ ] No AWS credential CSV files
- [ ] No node_modules/ directories
- [ ] No dist/ or build/ directories
- [ ] No log files
- [ ] .env.example files have placeholder values only
- [ ] .gitignore is present and comprehensive
- [ ] All source code is included
- [ ] Documentation is up to date
- [ ] Package.json and lock files are included

---

## 🚀 GIT COMMANDS

### Initial Setup
```bash
# Initialize repository (if not already done)
git init

# Add .gitignore first
git add .gitignore
git commit -m "Add .gitignore"

# Add all safe files
git add .
git status  # Review what will be committed

# Commit
git commit -m "Initial commit: AgriNext MVP"
```

### Create Remote Repository
```bash
# On GitHub/GitLab, create new repository
# Then link it:
git remote add origin https://github.com/yourusername/agrinext.git
git branch -M main
git push -u origin main
```


### Verify Before Push
```bash
# Check what will be pushed
git status

# Review files to be committed
git diff --cached

# Check for sensitive data
git grep -i "password"
git grep -i "api_key"
git grep -i "secret"

# If found, remove from staging:
git reset HEAD <file>
```

### Safe Commit Process
```bash
# Stage specific directories
git add backend/src/
git add web-app/src/
git add database/schema.sql
git add database/migrations/
git add .kiro/specs/

# Add documentation
git add *.md

# Add configuration templates
git add backend/.env.example
git add backend/package.json
git add web-app/package.json

# Review staged files
git status

# Commit
git commit -m "feat: Add AgriNext MVP with disease detection and advisory"

# Push
git push origin main
```

---

## 🔒 SECURITY BEST PRACTICES

### Before First Commit

1. **Create .env.example files**:
```bash
# Copy .env and replace real values with placeholders
cp backend/.env backend/.env.example

# Edit .env.example and replace:
# DB_PASSWORD=Agrinextow7s74of! → DB_PASSWORD=your-database-password
# OPENAI_API_KEY=sk-proj-... → OPENAI_API_KEY=your-openai-api-key
# etc.
```

2. **Remove sensitive files from tracking**:
```bash
# If accidentally added
git rm --cached backend/.env
git rm --cached "Aws Resoucres/*.pem"
git rm --cached "Aws Resoucres/*.csv"
```

3. **Verify .gitignore is working**:
```bash
git status --ignored
```


---

## 📁 RECOMMENDED REPOSITORY STRUCTURE

```
agrinext/
├── .gitignore                          ✅ Commit
├── README.md                           ✅ Commit
├── AGRINEXT-WALKTHROUGH.md             ✅ Commit
├── ARCHITECTURE-DIAGRAM.md             ✅ Commit
├── GIT-COMMIT-GUIDE.md                 ✅ Commit
│
├── backend/
│   ├── src/                            ✅ Commit all
│   ├── tests/                          ✅ Commit all
│   ├── package.json                    ✅ Commit
│   ├── package-lock.json               ✅ Commit
│   ├── tsconfig.json                   ✅ Commit
│   ├── jest.config.js                  ✅ Commit
│   ├── .env.example                    ✅ Commit
│   ├── .env                            ❌ NEVER commit
│   ├── .env.production                 ❌ NEVER commit
│   ├── dist/                           ❌ Don't commit (build artifact)
│   ├── node_modules/                   ❌ Don't commit
│   └── logs/                           ❌ Don't commit
│
├── web-app/
│   ├── src/                            ✅ Commit all
│   ├── public/                         ✅ Commit all
│   ├── index.html                      ✅ Commit
│   ├── package.json                    ✅ Commit
│   ├── package-lock.json               ✅ Commit
│   ├── tsconfig.json                   ✅ Commit
│   ├── vite.config.ts                  ✅ Commit
│   ├── dist/                           ❌ Don't commit (build artifact)
│   └── node_modules/                   ❌ Don't commit
│
├── database/
│   ├── schema.sql                      ✅ Commit
│   ├── seed-data.sql                   ✅ Commit
│   ├── migrations/                     ✅ Commit all
│   ├── setup.sh                        ✅ Commit
│   ├── setup.ps1                       ✅ Commit
│   └── README.md                       ✅ Commit
│
├── deploy/
│   ├── deploy-backend.sh               ✅ Commit
│   ├── deploy-webapp.sh                ✅ Commit
│   ├── setup-database.sh               ✅ Commit
│   ├── backup-database.sh              ✅ Commit
│   ├── environment-setup.md            ✅ Commit
│   └── README.md                       ✅ Commit
│
├── .kiro/
│   └── specs/agrinext/                 ✅ Commit all
│
├── Aws Resoucres/                      ❌ NEVER commit (credentials)
├── aws-tests/                          ⚠️  Optional (test scripts)
├── *.pem                               ❌ NEVER commit
├── *.tar.gz                            ❌ Don't commit
└── *.zip                               ❌ Don't commit
```

---

## ⚠️ CRITICAL SECURITY WARNINGS

### NEVER Commit These

1. **API Keys and Secrets**:
   - OpenAI API keys (sk-proj-...)
   - Hugging Face API keys (hf_...)
   - AWS Access Keys
   - Database passwords
   - JWT secrets
   - Twilio credentials

2. **SSH Keys**:
   - *.pem files
   - Private keys
   - Certificate files

3. **AWS Credentials**:
   - Agrinext_accessKeys.csv
   - Agrinext_credentials.csv
   - Any CSV with credentials

4. **Environment Files**:
   - .env (local)
   - .env.production (production)
   - Any file with real credentials

### If Accidentally Committed

```bash
# Remove from Git history (DANGEROUS - rewrites history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Or use BFG Repo-Cleaner (easier)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (only if repository is private and you're the only user)
git push origin --force --all
```

**IMPORTANT**: If credentials were committed, assume they're compromised:
1. Rotate all API keys immediately
2. Change all passwords
3. Generate new JWT secrets
4. Update production environment


---

## 📝 RECOMMENDED COMMIT MESSAGES

### Initial Commit
```bash
git commit -m "feat: Initial AgriNext MVP implementation

- Backend API with Express + TypeScript
- Web app with React + Vite
- Disease detection with Hugging Face
- Advisory service with OpenAI
- PostgreSQL database schema
- AWS deployment configuration"
```

### Feature Commits
```bash
# Disease detection
git commit -m "feat: Add disease detection with Hugging Face API"

# Advisory service
git commit -m "feat: Add agronomy advisory with OpenAI integration"

# Schemes
git commit -m "feat: Add government schemes browsing"

# Bug fixes
git commit -m "fix: Update CSP to allow blob URLs for image preview"

# Documentation
git commit -m "docs: Add comprehensive walkthrough and architecture guide"
```

---

## 🔍 PRE-COMMIT VERIFICATION

### Run These Commands Before Committing

```bash
# 1. Check for sensitive data
git diff --cached | grep -i "password"
git diff --cached | grep -i "api_key"
git diff --cached | grep -i "secret"
git diff --cached | grep -i "sk-proj"
git diff --cached | grep -i "hf_"

# 2. Verify .gitignore is working
git status --ignored | grep ".env"
git status --ignored | grep ".pem"
git status --ignored | grep "node_modules"

# 3. Check file sizes (avoid large files)
git diff --cached --stat

# 4. Review all staged files
git diff --cached --name-only
```

### Automated Pre-Commit Hook (Optional)

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash

# Check for sensitive patterns
if git diff --cached | grep -iE "(password|api_key|secret_key|sk-proj|hf_)" > /dev/null; then
    echo "ERROR: Potential sensitive data detected!"
    echo "Review your changes and remove sensitive information."
    exit 1
fi

# Check for .env files
if git diff --cached --name-only | grep "\.env$" > /dev/null; then
    echo "ERROR: .env file detected!"
    echo "Never commit .env files. Use .env.example instead."
    exit 1
fi

echo "Pre-commit checks passed ✓"
exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```


---

## 🎯 QUICK START COMMANDS

### First Time Setup

```bash
# 1. Create .gitignore (already done)
# File created: .gitignore

# 2. Create .env.example files
cp backend/.env backend/.env.example
# Edit .env.example and replace all real values with placeholders

# 3. Initialize git (if not done)
git init

# 4. Add .gitignore first
git add .gitignore
git commit -m "chore: Add .gitignore"

# 5. Add source code
git add backend/src/
git add web-app/src/
git add database/
git add .kiro/specs/

# 6. Add configuration templates
git add backend/package.json
git add backend/tsconfig.json
git add backend/.env.example
git add web-app/package.json
git add web-app/tsconfig.json
git add web-app/vite.config.ts

# 7. Add documentation
git add *.md
git add deploy/*.md

# 8. Add deployment scripts
git add deploy/*.sh
git add database/*.sh
git add database/*.ps1

# 9. Review what will be committed
git status

# 10. Commit
git commit -m "feat: Initial AgriNext MVP implementation"

# 11. Create remote repository on GitHub/GitLab
# Then push:
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 📦 WHAT GETS INSTALLED FROM REPOSITORY

When someone clones your repository, they will need to:

1. **Install dependencies**:
```bash
cd backend
npm install

cd ../web-app
npm install
```

2. **Create .env files**:
```bash
cp backend/.env.example backend/.env
# Edit .env with real credentials
```

3. **Build applications**:
```bash
cd backend
npm run build

cd ../web-app
npm run build
```

4. **Setup database**:
```bash
cd database
./setup.sh  # or setup.ps1 on Windows
```

This is why we DON'T commit:
- node_modules/ (reinstalled with npm install)
- dist/ (rebuilt with npm run build)
- .env (created from .env.example)
- logs/ (generated at runtime)


---

## 🔐 CREDENTIAL MANAGEMENT

### Create .env.example Files

**backend/.env.example**:
```env
# Server
PORT=3000
NODE_ENV=production
API_VERSION=v1

# Database
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_SSL=true

# JWT (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-jwt-secret-64-chars-minimum
REFRESH_TOKEN_SECRET=your-refresh-token-secret-64-chars-minimum
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500

# Hugging Face
HUGGINGFACE_API_KEY=your-huggingface-api-key
HUGGINGFACE_MODEL=facebook/detr-resnet-50

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# CORS
CORS_ORIGIN=http://localhost:5173,http://your-domain.com
```

### Store Secrets Securely

**For Team Members**:
- Use password manager (1Password, LastPass)
- Share via secure channels only
- Never send via email or Slack
- Use AWS Secrets Manager for production

**For Production**:
- Use AWS Secrets Manager
- Use environment variables on EC2
- Rotate credentials regularly
- Audit access logs

---

## ✅ FINAL CHECKLIST

Before pushing to GitHub:

- [ ] .gitignore file is present
- [ ] All .env files are in .gitignore
- [ ] All .pem files are in .gitignore
- [ ] Aws Resoucres/ folder is in .gitignore
- [ ] .env.example files have placeholder values
- [ ] No real API keys in any committed file
- [ ] No passwords in any committed file
- [ ] No AWS credentials in any committed file
- [ ] All source code is included
- [ ] All documentation is included
- [ ] Package.json files are included
- [ ] Database schema is included
- [ ] Deployment scripts are included
- [ ] README.md is comprehensive
- [ ] Ran `git status` to review
- [ ] Ran security checks (grep for secrets)
- [ ] Tested that someone can clone and run

---

**READY TO COMMIT!** 🚀

Use the commands in the "Quick Start Commands" section above.
