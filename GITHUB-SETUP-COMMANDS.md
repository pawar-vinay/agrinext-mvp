# GitHub Repository Setup Commands

## Step 1: Create Repository on GitHub

1. Go to https://github.com/pawar-vinay
2. Click "New Repository"
3. Repository name: `agrinext-mvp`
4. Description: "Agricultural advisory platform for rural Indian farmers"
5. Visibility: Public or Private (your choice)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create Repository"

---

## Step 2: Prepare Local Repository

Run these commands in PowerShell:

```powershell
# Initialize git (if not already done)
git init
git branch -M main

# Add .gitignore first
git add .gitignore

# Add source code
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

# Add database
git add database/schema.sql
git add database/seed-data.sql
git add database/migrations/
git add database/setup.sh
git add database/setup.ps1
git add database/README.md

# Add deployment scripts
git add deploy/*.sh
git add deploy/*.md

# Add documentation
git add README.md
git add AGRINEXT-WALKTHROUGH.md
git add ARCHITECTURE-DIAGRAM.md
git add GIT-COMMIT-GUIDE.md
git add GITHUB-SETUP-COMMANDS.md

# Add specs
git add .kiro/specs/agrinext/

# Review what will be committed
git status
```

---

## Step 3: Security Check

**CRITICAL**: Verify no sensitive data is staged:

```powershell
# Check for API keys
git diff --cached | Select-String "sk-proj"
git diff --cached | Select-String "hf_"
git diff --cached | Select-String "AKIA"

# Check for passwords
git diff --cached | Select-String "Agrinextow7s74of"

# Check for .env files
git status | Select-String "\.env$"
```

**If any sensitive data is found**:
```powershell
# Remove from staging
git reset HEAD backend/.env
git reset HEAD "Aws Resoucres/"
```

---

## Step 4: Commit

```powershell
git commit -m "feat: Initial AgriNext MVP implementation

- Backend API with Express + TypeScript
- Web app with React + Vite
- Disease detection with Hugging Face
- Advisory service with OpenAI
- PostgreSQL database schema
- AWS deployment configuration
- Comprehensive documentation"
```

---

## Step 5: Push to GitHub

```powershell
# Add remote (use the URL from your GitHub repository)
git remote add origin https://github.com/pawar-vinay/agrinext-mvp.git

# Push to GitHub
git push -u origin main
```

**If you get authentication error**:
```powershell
# Option 1: Use GitHub CLI
gh auth login

# Option 2: Use Personal Access Token
# Go to: https://github.com/settings/tokens
# Generate token with 'repo' scope
# Use token as password when prompted
```

---

## Step 6: Verify

1. Go to https://github.com/pawar-vinay/agrinext-mvp
2. Verify all files are present
3. Check that no .env files are visible
4. Check that no .pem files are visible
5. Verify README.md displays correctly

---

## ✅ FINAL CHECKLIST

Before pushing:

- [ ] Created repository on GitHub
- [ ] .gitignore is present
- [ ] .env.example exists (not .env)
- [ ] No .pem files staged
- [ ] No Aws Resoucres/ folder staged
- [ ] No node_modules/ staged
- [ ] No dist/ folders staged
- [ ] All source code is staged
- [ ] Documentation is staged
- [ ] Ran security check
- [ ] Reviewed `git status`
- [ ] Created commit
- [ ] Ready to push

---

## 🆘 Troubleshooting

### "Repository not found"
- Verify repository exists on GitHub
- Check repository name spelling
- Verify you have access to the repository

### "Authentication failed"
- Use GitHub Personal Access Token
- Or setup SSH keys
- Or use GitHub CLI (`gh auth login`)

### "Remote already exists"
- Remove existing remote: `git remote remove origin`
- Add correct remote: `git remote add origin <url>`

### "Sensitive data detected"
- Remove from staging: `git reset HEAD <file>`
- Add to .gitignore
- Never commit .env, .pem, or credential files
