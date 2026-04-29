# ============================================
#   SkillConnect - Frontend Server Launcher
# ============================================

Write-Host ""
Write-Host "  SkillConnect FRONTEND" -ForegroundColor Cyan
Write-Host "  React + Vite" -ForegroundColor Gray
Write-Host "  http://localhost:5173" -ForegroundColor Green
Write-Host ""

$frontendDir = "C:\Users\nazis\OneDrive\Desktop\SKILL CONNECT\frontend"
Set-Location $frontendDir

Write-Host "  Starting React dev server..." -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev
