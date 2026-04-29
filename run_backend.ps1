# SkillConnect - Backend Launcher
# Uses Python 3.14 with manual site-packages path injection

$python = "C:\Python314\python.exe"
$sitePackages = "C:\Users\nazis\OneDrive\Desktop\skill\Lib\site-packages"
$backendDir = "C:\Users\nazis\OneDrive\Desktop\skill\backend"

Write-Host "=== SkillConnect Backend ===" -ForegroundColor Cyan
Write-Host "Python: $python" -ForegroundColor Gray
Write-Host "Packages: $sitePackages" -ForegroundColor Gray

# Create a tiny sitecustomize to inject the path
$siteCustomize = @"
import sys
sys.path.insert(0, r'$sitePackages')
"@

$tempSite = "$backendDir\sitecustomize.py"
Set-Content -Path $tempSite -Value $siteCustomize

Set-Location $backendDir

Write-Host "`nRunning migrations..." -ForegroundColor Yellow
& $python -S manage.py migrate 2>&1 | ForEach-Object { Write-Host $_ }

Write-Host "`nStarting Django server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray
& $python -S manage.py runserver 0.0.0.0:8000
