# Android Studio Environment Variables Setup Script
# Run this as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Studio Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get username
$username = $env:USERNAME
Write-Host "[OK] Detected username: $username" -ForegroundColor Green

# Set Android SDK path
$androidHome = "C:\Users\$username\AppData\Local\Android\Sdk"
Write-Host "[OK] Android SDK path: $androidHome" -ForegroundColor Green

# Check if SDK exists
if (Test-Path $androidHome) {
    Write-Host "[OK] Android SDK found!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Android SDK not found at $androidHome" -ForegroundColor Yellow
    Write-Host "  Make sure Android Studio setup completed successfully" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setting up environment variables..." -ForegroundColor Cyan

# Set ANDROID_HOME
try {
    [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidHome, 'User')
    Write-Host "[OK] ANDROID_HOME set successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to set ANDROID_HOME: $_" -ForegroundColor Red
    exit 1
}

# Get current PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')

# Define paths to add
$platformTools = "$androidHome\platform-tools"
$tools = "$androidHome\tools"
$toolsBin = "$androidHome\tools\bin"

# Check if already in PATH
if ($currentPath -like "*$platformTools*") {
    Write-Host "[OK] Android tools already in PATH" -ForegroundColor Green
} else {
    Write-Host "Adding Android tools to PATH..." -ForegroundColor Cyan
    try {
        $newPath = "$currentPath;$platformTools;$tools;$toolsBin"
        [System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Host "[OK] Android tools added to PATH successfully" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to update PATH: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: You must close this PowerShell window and open a NEW one" -ForegroundColor Yellow
Write-Host "Then run: adb --version" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
