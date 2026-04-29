# ============================================================
#   SkillConnect — Start Everything
#   Run this once to launch Backend + Frontend together
# ============================================================

Write-Host ""
Write-Host "  ===========================================" -ForegroundColor Cyan
Write-Host "   SkillConnect — Full Stack Launcher" -ForegroundColor Cyan
Write-Host "  ===========================================" -ForegroundColor Cyan
Write-Host ""

$python     = "C:\Python314\python.exe"
$backendDir = "C:\Users\nazis\OneDrive\Desktop\skill\backend"
$frontendDir= "C:\Users\nazis\OneDrive\Desktop\skill\frontend"

# Set Python path — no PYTHONHOME (breaks encodings)
$env:PYTHONPATH = "C:\Users\nazis\OneDrive\Desktop\skill\Lib\site-packages"
Remove-Item Env:\PYTHONHOME -ErrorAction SilentlyContinue

# ── Launch Backend in a NEW window ─────────────────────────
Write-Host "  [1/2] Starting Django backend (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
  `$env:PYTHONPATH = 'C:\Users\nazis\OneDrive\Desktop\skill\Lib\site-packages';
  Remove-Item Env:\PYTHONHOME -ErrorAction SilentlyContinue;
  Set-Location '$backendDir';
  Write-Host '  Running migrations...' -ForegroundColor Yellow;
  & '$python' manage.py migrate --run-syncdb 2>&1 | Where-Object { `$_ -notmatch 'platform independent' };
  Write-Host '';
  Write-Host '  Django running at http://localhost:8000' -ForegroundColor Green;
  & '$python' manage.py runserver 0.0.0.0:8000 2>&1
"

# Wait a moment so backend initialises before frontend
Start-Sleep -Seconds 3

# ── Launch Frontend in a NEW window ───────────────────────
Write-Host "  [2/2] Starting React frontend  (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
  Set-Location '$frontendDir';
  Write-Host '  React running at http://localhost:5173' -ForegroundColor Green;
  npm run dev
"

Write-Host ""
Write-Host "  Both servers are starting in separate windows." -ForegroundColor Green
Write-Host "  Open http://localhost:5173 in your browser."    -ForegroundColor Cyan
Write-Host ""
