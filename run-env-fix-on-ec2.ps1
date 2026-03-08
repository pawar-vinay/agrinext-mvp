# PowerShell script to run environment fix on EC2 via AWS Systems Manager

Write-Host "=== Running Environment Fix on EC2 ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Upload the updated env.ts file
Write-Host "Step 1: Uploading updated env.ts to EC2..." -ForegroundColor Yellow
$envTsContent = Get-Content "backend\src\config\env.ts" -Raw

# Create a temporary script to update env.ts
$updateEnvScript = @"
cat > /home/ssm-user/agrinext-phase2/backend/src/config/env.ts << 'ENVTS_EOF'
$envTsContent
ENVTS_EOF
echo "✓ Updated env.ts"
"@

# Save to temp file
$updateEnvScript | Out-File -FilePath "temp-update-env.sh" -Encoding ASCII -NoNewline

Write-Host "✓ Prepared env.ts update" -ForegroundColor Green
Write-Host ""

# Step 2: Upload and run the fix script
Write-Host "Step 2: Uploading fix script to EC2..." -ForegroundColor Yellow
$fixScript = Get-Content "fix-env-loading.sh" -Raw

# Create combined script
$combinedScript = @"
#!/bin/bash
# Combined script to update env.ts and run fix

echo "Updating env.ts..."
$updateEnvScript

echo ""
echo "Running environment fix..."
$fixScript
"@

# Save combined script
$combinedScript | Out-File -FilePath "temp-combined-fix.sh" -Encoding ASCII -NoNewline

Write-Host "✓ Prepared combined fix script" -ForegroundColor Green
Write-Host ""

# Step 3: Show instructions for manual execution
Write-Host "=== MANUAL EXECUTION REQUIRED ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please run the following commands in your EC2 session:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Upload the fix script:" -ForegroundColor White
Write-Host "   (Copy the content of temp-combined-fix.sh and paste it into EC2)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Or run these commands directly in EC2:" -ForegroundColor White
Write-Host ""
Write-Host "cd /home/ssm-user/agrinext-phase2/backend" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Update env.ts to use process.cwd()" -ForegroundColor Green
Write-Host @"
cat > src/config/env.ts << 'EOF'
$envTsContent
EOF
"@ -ForegroundColor Cyan
Write-Host ""
Write-Host "# Stop current backend" -ForegroundColor Green
Write-Host "pkill -f 'tsx src/server.ts'" -ForegroundColor Cyan
Write-Host "sleep 2" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Export environment variables and start backend" -ForegroundColor Green
Write-Host "set -a && source .env && set +a" -ForegroundColor Cyan
Write-Host "nohup npx tsx src/server.ts > backend.log 2>&1 &" -ForegroundColor Cyan
Write-Host "sleep 5" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Test OTP endpoint" -ForegroundColor Green
Write-Host @"
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210"}'
"@ -ForegroundColor Cyan
Write-Host ""
Write-Host "# Check logs" -ForegroundColor Green
Write-Host "tail -50 backend.log" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== End of Instructions ===" -ForegroundColor Cyan
