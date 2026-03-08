# Convert AgriNext Walkthrough Markdown to Word Document
# Requires: pandoc (install with: choco install pandoc)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AgriNext Walkthrough - Word Conversion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if pandoc is installed
try {
    $pandocVersion = pandoc --version | Select-Object -First 1
    Write-Host "Found: $pandocVersion" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: pandoc is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install pandoc using one of these methods:" -ForegroundColor Yellow
    Write-Host "  1. Chocolatey: choco install pandoc" -ForegroundColor White
    Write-Host "  2. Download: https://pandoc.org/installing.html" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Convert to Word
Write-Host "Converting markdown to Word document..." -ForegroundColor Yellow

$inputFile = "AGRINEXT-WALKTHROUGH.md"
$outputFile = "AGRINEXT-WALKTHROUGH.docx"

if (-not (Test-Path $inputFile)) {
    Write-Host "ERROR: $inputFile not found" -ForegroundColor Red
    exit 1
}

# Run pandoc conversion
pandoc $inputFile -o $outputFile `
    --toc `
    --toc-depth=2 `
    --highlight-style=tango `
    --metadata title="AgriNext Application Walkthrough" `
    --metadata author="AgriNext Development Team" `
    --metadata date="March 8, 2026"

if (Test-Path $outputFile) {
    Write-Host ""
    Write-Host "Success! Word document created:" -ForegroundColor Green
    Write-Host "  $outputFile" -ForegroundColor White
    Write-Host ""
    Write-Host "Opening document..." -ForegroundColor Yellow
    Start-Process $outputFile
}
else {
    Write-Host "ERROR: Conversion failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conversion Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
