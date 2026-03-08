# Create Word Document from Markdown (No pandoc required)
# Uses Microsoft Word COM object

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AgriNext Walkthrough - Word Creation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Word is installed
try {
    $word = New-Object -ComObject Word.Application
    Write-Host "Microsoft Word found" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Microsoft Word is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative options:" -ForegroundColor Yellow
    Write-Host "  1. Install pandoc: choco install pandoc" -ForegroundColor White
    Write-Host "  2. Use online converter: dillinger.io" -ForegroundColor White
    Write-Host "  3. Copy-paste into Word manually" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Read markdown file
$inputFile = "AGRINEXT-WALKTHROUGH.md"
$outputFile = "AGRINEXT-WALKTHROUGH.docx"

if (-not (Test-Path $inputFile)) {
    Write-Host "ERROR: $inputFile not found" -ForegroundColor Red
    $word.Quit()
    exit 1
}

Write-Host "Reading markdown file..." -ForegroundColor Yellow
$content = Get-Content $inputFile -Raw

# Create new Word document
Write-Host "Creating Word document..." -ForegroundColor Yellow
$word.Visible = $false
$doc = $word.Documents.Add()

# Add content
$selection = $word.Selection
$selection.TypeText($content)

# Apply basic formatting
Write-Host "Applying formatting..." -ForegroundColor Yellow
$selection.WholeStory()
$selection.Font.Name = "Calibri"
$selection.Font.Size = 11

# Save document
Write-Host "Saving document..." -ForegroundColor Yellow
$fullPath = Join-Path (Get-Location) $outputFile
$doc.SaveAs2($fullPath, 16) # 16 = wdFormatDocumentDefault (.docx)

# Close Word
$doc.Close()
$word.Quit()

# Release COM objects
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($selection) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()

Write-Host ""
Write-Host "Success! Word document created:" -ForegroundColor Green
Write-Host "  $outputFile" -ForegroundColor White
Write-Host ""
Write-Host "Opening document..." -ForegroundColor Yellow
Start-Process $outputFile

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Document Created!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
