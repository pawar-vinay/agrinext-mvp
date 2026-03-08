# Upload the fixed database.ts to S3 and apply it on EC2

Write-Host "Uploading fixed database.ts to S3..." -ForegroundColor Cyan

# Upload the fixed file
aws s3 cp backend/src/config/database.ts s3://agrinext-images-1772367775698/scripts/database.ts

Write-Host "`n✅ File uploaded to S3" -ForegroundColor Green
Write-Host "`nNow run these commands on EC2 (via Session Manager):" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Download the fixed file" -ForegroundColor Gray
Write-Host "aws s3 cp s3://agrinext-images-1772367775698/scripts/database.ts ~/agrinext-phase2/backend/src/config/database.ts"
Write-Host ""
Write-Host "# Stop PM2" -ForegroundColor Gray
Write-Host "pm2 stop all"
Write-Host "pm2 delete all"
Write-Host ""
Write-Host "# Test with NODE_ENV=production" -ForegroundColor Gray
Write-Host "cd ~/agrinext-phase2/backend"
Write-Host "NODE_ENV=production tsx src/server.ts"
Write-Host ""
Write-Host "# If you see 'Database SSL: enabled' and server starts, press Ctrl+C and run:" -ForegroundColor Gray
Write-Host "pm2 start ecosystem.config.js"
Write-Host "pm2 save"
Write-Host ""
