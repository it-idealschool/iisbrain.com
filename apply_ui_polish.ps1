# apply_ui_polish.ps1
#
# Ith script, aasr_ui_polish.zip-il ulla ella puthiya/updated files-um
# ninte project-il terminal vazhi thanne copy cheyyum. Notepad open
# cheyyenda, paste cheyyenda.
#
# USAGE:
#   1. aasr_ui_polish.zip ninte Downloads folder-il undennu urapp varuthuka
#   2. Ee script, ninte "aasr-platform" root folder-il (backend/ and
#      frontend/ folders ulla idathu) vecho, PowerShell-il ith run cheyyuka:
#
#        cd C:\Users\welcome\aasr-platform
#        powershell -ExecutionPolicy Bypass -File apply_ui_polish.ps1
#
#   Zip Downloads-il alla enkil, $zipPath line maattuka.

$zipPath = "$HOME\Downloads\aasr_ui_polish.zip"
$tempExtract = "$env:TEMP\aasr_ui_polish_extract"

if (-not (Test-Path $zipPath)) {
    Write-Host "ERROR: Zip file kandilla: $zipPath" -ForegroundColor Red
    Write-Host "Zip file evideyanu ennu nokki, script-inte top-il ulla `$zipPath line correct cheyyuka." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path ".\backend") -or -not (Test-Path ".\frontend")) {
    Write-Host "ERROR: Ee folder-il backend/ and frontend/ kandilla." -ForegroundColor Red
    Write-Host "Ninte 'aasr-platform' root folder-il ninnu ee script run cheyyuka (cd C:\Users\welcome\aasr-platform)." -ForegroundColor Yellow
    exit 1
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
Write-Host "  cd frontend"
Write-Host "  npm install"
Write-Host "  npm run dev"
