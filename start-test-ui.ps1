# Simple HTTP server to serve the test UI
Write-Host "Starting local web server..." -ForegroundColor Cyan
Write-Host "Opening test UI at: http://localhost:8080/test-ui.html" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start Python HTTP server
python -m http.server 8080
