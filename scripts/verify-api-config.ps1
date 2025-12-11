# Verify Frontend API Configuration Matches Backend Routes

# Get project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  API Configuration Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Frontend API endpoints
Write-Host "Frontend API Endpoints:" -ForegroundColor Yellow
$frontendApi = Get-Content "frontend\src\api.js" -Raw

$frontendEndpoints = @()
if ($frontendApi -match '/api/products[^/]') { $frontendEndpoints += "GET /api/products" }
if ($frontendApi -match '/api/products/\$\{id\}') { $frontendEndpoints += "GET /api/products/:id" }
if ($frontendApi -match "method:\s*'POST'.*'/api/products'") { $frontendEndpoints += "POST /api/products" }
if ($frontendApi -match "method:\s*'PUT'.*'/api/products") { $frontendEndpoints += "PUT /api/products/:id" }
if ($frontendApi -match "method:\s*'DELETE'.*'/api/products") { $frontendEndpoints += "DELETE /api/products/:id" }
if ($frontendApi -match '/api/categories') { $frontendEndpoints += "GET /api/categories" }
if ($frontendApi -match '/api/orders[^/]') { $frontendEndpoints += "GET /api/orders" }
if ($frontendApi -match '/api/orders/\$\{id\}') { $frontendEndpoints += "GET /api/orders/:id" }
if ($frontendApi -match "method:\s*'POST'.*'/api/orders'") { $frontendEndpoints += "POST /api/orders" }
if ($frontendApi -match "method:\s*'PUT'.*'/api/orders") { $frontendEndpoints += "PUT /api/orders/:id" }
if ($frontendApi -match '/api/admin/auth/login') { $frontendEndpoints += "POST /api/admin/auth/login" }
if ($frontendApi -match '/api/admin/auth/logout') { $frontendEndpoints += "POST /api/admin/auth/logout" }
if ($frontendApi -match '/api/admin/auth/verify') { $frontendEndpoints += "GET /api/admin/auth/verify" }
if ($frontendApi -match '/api/admin/stats') { $frontendEndpoints += "GET /api/admin/stats" }
if ($frontendApi -match '/api/health') { $frontendEndpoints += "GET /api/health" }

foreach ($endpoint in $frontendEndpoints) {
    Write-Host "  [OK] $endpoint" -ForegroundColor Green
}

# Check Backend API routes
Write-Host "`nBackend API Routes:" -ForegroundColor Yellow
$backendApi = Get-Content "backend\src\index.js" -Raw

$backendRoutes = @()
if ($backendApi -match 'GET.*\/api\/products[^/]') { $backendRoutes += "GET /api/products" }
if ($backendApi -match 'GET.*\/api\/products\/:id') { $backendRoutes += "GET /api/products/:id" }
if ($backendApi -match 'POST.*\/api\/products') { $backendRoutes += "POST /api/products" }
if ($backendApi -match 'PUT.*\/api\/products\/:id') { $backendRoutes += "PUT /api/products/:id" }
if ($backendApi -match 'DELETE.*\/api\/products\/:id') { $backendRoutes += "DELETE /api/products/:id" }
if ($backendApi -match 'GET.*\/api\/categories') { $backendRoutes += "GET /api/categories" }
if ($backendApi -match 'GET.*\/api\/orders[^/]') { $backendRoutes += "GET /api/orders" }
if ($backendApi -match 'GET.*\/api\/orders\/:id') { $backendRoutes += "GET /api/orders/:id" }
if ($backendApi -match 'POST.*\/api\/orders') { $backendRoutes += "POST /api/orders" }
if ($backendApi -match 'PUT.*\/api\/orders\/:id') { $backendRoutes += "PUT /api/orders/:id" }
if ($backendApi -match 'POST.*\/api\/admin\/auth\/login') { $backendRoutes += "POST /api/admin/auth/login" }
if ($backendApi -match 'POST.*\/api\/admin\/auth\/logout') { $backendRoutes += "POST /api/admin/auth/logout" }
if ($backendApi -match 'GET.*\/api\/admin\/auth\/verify') { $backendRoutes += "GET /api/admin/auth/verify" }
if ($backendApi -match 'GET.*\/api\/admin\/stats') { $backendRoutes += "GET /api/admin/stats" }
if ($backendApi -match '\/api\/health') { $backendRoutes += "GET /api/health" }

foreach ($route in $backendRoutes) {
    Write-Host "  [OK] $route" -ForegroundColor Green
}

# Compare configurations
Write-Host "`nConfiguration Comparison:" -ForegroundColor Yellow
Write-Host "  Frontend API Base URL: http://localhost:8787 (default)" -ForegroundColor White
Write-Host "  Backend Port: 8787 (Cloudflare Workers)" -ForegroundColor White
Write-Host "  Frontend Port: 3000" -ForegroundColor White

# Check for mismatches
Write-Host "`nVerification:" -ForegroundColor Yellow
$allMatch = $true
$requiredEndpoints = @(
    "GET /api/products",
    "GET /api/products/:id",
    "POST /api/products",
    "PUT /api/products/:id",
    "DELETE /api/products/:id",
    "GET /api/categories",
    "GET /api/orders",
    "POST /api/orders",
    "GET /api/orders/:id",
    "PUT /api/orders/:id",
    "POST /api/admin/auth/login",
    "POST /api/admin/auth/logout",
    "GET /api/admin/auth/verify",
    "GET /api/admin/stats",
    "GET /api/health"
)

foreach ($endpoint in $requiredEndpoints) {
    $method = $endpoint.Split(' ')[0]
    $path = $endpoint.Split(' ')[1]
    
    $inFrontend = $frontendApi -match [regex]::Escape($path.Replace(':id', '${id}'))
    $inBackend = $backendApi -match [regex]::Escape($path)
    
    if ($inFrontend -and $inBackend) {
        Write-Host "  [OK] $endpoint - Matches" -ForegroundColor Green
    } elseif (-not $inFrontend) {
        Write-Host "  [WARN] $endpoint - Missing in frontend" -ForegroundColor Yellow
        $allMatch = $false
    } elseif (-not $inBackend) {
        Write-Host "  [WARN] $endpoint - Missing in backend" -ForegroundColor Yellow
        $allMatch = $false
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
if ($allMatch) {
    Write-Host "  [SUCCESS] All endpoints match!" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Some endpoints may not match" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

