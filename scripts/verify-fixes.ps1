# Verify All Fixes Are Applied

# Get project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Verifying Fix Status" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# 1. Check environment config file
Write-Host "1. Checking environment config..." -ForegroundColor Yellow
if (Test-Path "frontend\.env.development") {
    Write-Host "  [OK] .env.development exists" -ForegroundColor Green
    $envContent = Get-Content "frontend\.env.development"
    if ($envContent -match "VITE_API_URL=http://localhost:8787") {
        Write-Host "  [OK] API URL configured correctly" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] API URL may be incorrect" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "  [ERROR] .env.development not found" -ForegroundColor Red
    $allGood = $false
}

# 2. Check API file improvements
Write-Host "`n2. Checking API file improvements..." -ForegroundColor Yellow
$apiContent = Get-Content "frontend\src\api.js" -Raw
if ($apiContent -match "checkApiConnection") {
    Write-Host "  [OK] checkApiConnection function added" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] checkApiConnection function not found" -ForegroundColor Red
    $allGood = $false
}

if ($apiContent -match "getApiBaseUrl") {
    Write-Host "  [OK] getApiBaseUrl function added" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] getApiBaseUrl function not found" -ForegroundColor Red
    $allGood = $false
}

# 3. Check main.js startup improvements
Write-Host "`n3. Checking app startup improvements..." -ForegroundColor Yellow
$mainContent = Get-Content "frontend\src\main.js" -Raw
if ($mainContent -match "checkApiConnection") {
    Write-Host "  [OK] API connection check added" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] API connection check not found" -ForegroundColor Red
    $allGood = $false
}

# 4. Check startup scripts
Write-Host "`n4. Checking startup scripts..." -ForegroundColor Yellow
$scriptsPath = Join-Path $projectRoot "scripts"
if (Test-Path (Join-Path $scriptsPath "start-all.ps1")) {
    Write-Host "  [OK] start-all.ps1 exists" -ForegroundColor Green
} else {
    Write-Host "  [WARN] start-all.ps1 not found" -ForegroundColor Yellow
}

if (Test-Path (Join-Path $scriptsPath "start-dev.ps1")) {
    Write-Host "  [OK] start-dev.ps1 exists" -ForegroundColor Green
} else {
    Write-Host "  [WARN] start-dev.ps1 not found" -ForegroundColor Yellow
}

# 5. Test server connections
Write-Host "`n5. Testing server connections..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:8787/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  [OK] Backend API: Running" -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Backend API: Not running (normal if not started)" -ForegroundColor Yellow
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  [OK] Frontend Server: Running" -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Frontend Server: Not running (normal if not started)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  [SUCCESS] All fixes applied correctly!" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Some issues found, check output above" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan
