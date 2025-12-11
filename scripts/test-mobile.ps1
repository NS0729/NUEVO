# Mobile Feature Test Script

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Mobile Feature Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# 1. Check mobile components
Write-Host "1. Checking mobile components..." -ForegroundColor Yellow
if (Test-Path "frontend\src\components\MobileBottomNav.vue") {
    Write-Host "  [OK] MobileBottomNav.vue exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] MobileBottomNav.vue not found" -ForegroundColor Red
    $allGood = $false
}

# 2. Check mobile utilities
Write-Host "`n2. Checking mobile utilities..." -ForegroundColor Yellow
if (Test-Path "frontend\src\utils\touchGestures.js") {
    Write-Host "  [OK] touchGestures.js exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] touchGestures.js not found" -ForegroundColor Red
    $allGood = $false
}

# 3. Check component references
Write-Host "`n3. Checking component references..." -ForegroundColor Yellow
$appContent = Get-Content "frontend\src\App.vue" -Raw
if ($appContent -match "MobileBottomNav") {
    Write-Host "  [OK] App.vue references MobileBottomNav" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] App.vue does not reference MobileBottomNav" -ForegroundColor Red
    $allGood = $false
}

# 4. Check mobile styles
Write-Host "`n4. Checking mobile styles..." -ForegroundColor Yellow
$mainScss = Get-Content "frontend\src\styles\main.scss" -Raw
if ($mainScss -match "@media.*max-width.*768px") {
    Write-Host "  [OK] Mobile styles added" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Mobile styles may be incomplete" -ForegroundColor Yellow
}

# 5. Check mobile meta tags
Write-Host "`n5. Checking mobile meta tags..." -ForegroundColor Yellow
$indexHtml = Get-Content "frontend\index.html" -Raw
if ($indexHtml -match "viewport" -and $indexHtml -match "mobile-web-app-capable") {
    Write-Host "  [OK] Mobile meta tags configured" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Mobile meta tags may be incomplete" -ForegroundColor Yellow
}

# 6. Check page bottom padding
Write-Host "`n6. Checking page bottom padding..." -ForegroundColor Yellow
$pages = @(
    "frontend\src\views\Home.vue",
    "frontend\src\views\Category.vue",
    "frontend\src\views\Cart.vue",
    "frontend\src\views\Search.vue",
    "frontend\src\views\ProductDetail.vue"
)

$pagesWithPadding = 0
foreach ($page in $pages) {
    if (Test-Path $page) {
        $content = Get-Content $page -Raw
        if ($content -match "padding-bottom.*6rem" -or $content -match "padding-bottom.*80px") {
            $pagesWithPadding++
        }
    }
}

if ($pagesWithPadding -eq $pages.Count) {
    Write-Host "  [OK] All pages have bottom padding" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Some pages may lack bottom padding ($pagesWithPadding/$($pages.Count))" -ForegroundColor Yellow
}

# 7. Test frontend server
Write-Host "`n7. Testing frontend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  [OK] Frontend server is running" -ForegroundColor Green
    Write-Host "  [TIP] Open http://localhost:3000 in browser and test mobile view" -ForegroundColor Cyan
} catch {
    Write-Host "  [INFO] Frontend server not running (normal if not started)" -ForegroundColor Yellow
    Write-Host "  [TIP] Run 'cd frontend && npm run dev' to start server" -ForegroundColor Cyan
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  [SUCCESS] Mobile feature check passed!" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Some issues found, check output above" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Testing Instructions:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:3000 in browser" -ForegroundColor White
Write-Host "  2. Press F12 to open DevTools" -ForegroundColor White
Write-Host "  3. Click device toolbar icon (Ctrl+Shift+M)" -ForegroundColor White
Write-Host "  4. Select mobile device for testing" -ForegroundColor White
Write-Host "  5. Check if bottom navigation bar appears" -ForegroundColor White
Write-Host "  6. Test mobile layout on all pages" -ForegroundColor White
Write-Host ""
