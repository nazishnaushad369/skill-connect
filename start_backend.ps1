# ============================================
#   SkillConnect - Backend Server Launcher
# ============================================

Write-Host ""
Write-Host "  SkillConnect BACKEND" -ForegroundColor Cyan
Write-Host "  Django + Python 3.14" -ForegroundColor Gray
Write-Host "  http://localhost:8000" -ForegroundColor Green
Write-Host ""

# Set Python environment - using C:\Python314\python.exe
$env:PYTHONPATH = "C:\Users\nazis\OneDrive\Desktop\SKILL CONNECT\Lib\site-packages"
Remove-Item Env:\PYTHONHOME -ErrorAction SilentlyContinue

$python = "C:\Python314\python.exe"
$backendDir = "C:\Users\nazis\OneDrive\Desktop\SKILL CONNECT\backend"

Set-Location $backendDir

Write-Host "  Running migrations..." -ForegroundColor Yellow
& $python manage.py migrate --run-syncdb 2>&1 | Where-Object { $_ -notmatch "platform independent" }

Write-Host ""
Write-Host "  Starting Django server on http://localhost:8000" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

& $python manage.py runserver 0.0.0.0:8000 2>&1 | Where-Object { $_ -notmatch "platform independent" }
