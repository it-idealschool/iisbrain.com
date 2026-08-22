# apply_ui_polish2.ps1
#
# Ith script aasr_ui_polish2.zip-il ulla ella updated files-um
# ninte project-il copy cheyyum:
#   - Sidebar-il "Subjects / Admin Staff / Transport / Staffing Report" links add cheyyum
#   - Overview (front) page-il summary stats + graphs (bar chart, gender donut) varum
#   - Subjects / Admin Staff / Transport / Staffing Report / Teacher Profile pages
#     ninte existing dark navy/gold design-eth match aavunna vidham restyle cheyyum
#
# USAGE:
#   1. aasr_ui_polish2.zip Downloads folder-il vekkuka
#   2. "aasr-platform" root folder-il (backend/ and frontend/ ulla idathu) vecho:
#
#        cd C:\Users\welcome\aasr-platform
#        powershell -ExecutionPolicy Bypass -File apply_ui_polish2.ps1

$zipPath = "$HOME\Downloads\aasr_ui_polish2.zip"
$tempExtract = "$env:TEMP\aasr_ui_polish2_extract"

if (-not (Test-Path $zipPath)) {
    Write-Host "ERROR: Zip file kandilla: $zipPath" -ForegroundColor Red
    Write-Host "Zip file evideyanu ennu nokki, script-inte top-il ulla `$zipPath line correct cheyyuka." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path ".\backend") -or -not (Test-Path ".\frontend")) {
    Write-Host "ERROR: Ee folder-il backend/ and frontend/ kandilla." -ForegroundColor Red
    Write-Host "Ninte 'aasr-platform' root folder-il ninnu ee script run cheyyuka." -ForegroundColor Yellow
    exit 1
}

# Cleanup: previous copy-paste attempt oru nested duplicate folder undakki
# (dashboard\subjects\subjects). Athu ivide undenkil remove cheyyum.
$staleDup = ".\frontend\src\app\dashboard\subjects\subjects"
if (Test-Path $staleDup) {
    Write-Host "Pazhaya duplicate folder kandu, remove cheyyunnu: $staleDup" -ForegroundColor Yellow
    Remove-Item $staleDup -Recurse -Force
}

Write-Host "Zip extract cheyyunnu..." -ForegroundColor Cyan
if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $tempExtract -Force

Write-Host "Backend files copy cheyyunnu..." -ForegroundColor Cyan
Copy-Item "$tempExtract\backend\*" -Destination ".\backend" -Recurse -Force

Write-Host "Frontend files copy cheyyunnu..." -ForegroundColor Cyan
Copy-Item "$tempExtract\frontend\*" -Destination ".\frontend" -Recurse -Force

Remove-Item $tempExtract -Recurse -Force

Write-Host ""
Write-Host "Done! Ella files-um update aayi." -ForegroundColor Green
Write-Host ""
Write-Host "Ini ith run cheyyuka:" -ForegroundColor Yellow
Write-Host "  cd backend"
Write-Host "  .\venv\Scripts\activate"
Write-Host "  python manage.py migrate"
Write-Host "  python manage.py runserver"
Write-Host ""
Write-Host "  (vere terminal-il)"
Write-Host "  cd frontend"
Write-Host "  npm run dev"
