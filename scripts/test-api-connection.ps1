# Test Frontend and API Configuration Consistency

# Get project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Testing Frontend and API Configuration" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Check Frontend API Configuration
Write-Host "1. Checking Frontend API Configuration..." -ForegroundColor Yellow
$frontendApiFile = "frontend\src\api.js"
if (Test-Path $frontendApiFile) {
    $apiContent = Get-Content $frontendApiFile -Raw
    if ($apiContent -match "API_BASE_URL.*=.*import\.meta\.env\.VITE_API_URL.*\|\|.*'([^']+)'") {
        $defaultApiUrl = $matches[1]
        Write-Host "  [OK] Frontend default API URL: $defaultApiUrl" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Cannot parse frontend API configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [ERROR] Frontend API file not found" -ForegroundColor Red
}

# 2. Check Environment Variable Files
Write-Host "`n2. Checking Environment Variable Configuration..." -ForegroundColor Yellow
$envFiles = @(
    "frontend\.env",
    "frontend\.env.development",
    "frontend\.env.local"
)

$foundEnvFile = $false
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "  [OK] Found environment file: $envFile" -ForegroundColor Green
        $envContent = Get-Content $envFile
        foreach ($line in $envContent) {
            if ($line -match "VITE_API_URL=(.+)") {
                Write-Host "    API URL: $($matches[1])" -ForegroundColor White
            }
        }
        $foundEnvFile = $true
    }
}

if (-not $foundEnvFile) {
    Write-Host "  [WARN] No environment file found, will use default configuration" -ForegroundColor Yellow
}

# 3. Check Backend Configuration
Write-Host "`n3. Checking Backend Configuration..." -ForegroundColor Yellow
$backendWranglerFile = "backend\wrangler.toml"
if (Test-Path $backendWranglerFile) {
    Write-Host "  [OK] Found backend configuration file" -ForegroundColor Green
    Write-Host "  [INFO] Backend uses Cloudflare Workers (default port: 8787)" -ForegroundColor White
} else {
    Write-Host "  [ERROR] Backend configuration file not found" -ForegroundColor Red
}

# 4. Test API Connection
Write-Host "`n4. Testing API Connection..." -ForegroundColor Yellow
$apiUrl = "http://localhost:8787/api/health"

try {
    Write-Host "  Testing: $apiUrl" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri $apiUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  [OK] API server is running (Status: $($response.StatusCode))" -ForegroundColor Green
        try {
            $data = $response.Content | ConvertFrom-Json
            Write-Host "  [INFO] Response: $($data | ConvertTo-Json -Compress)" -ForegroundColor White
        } catch {
            Write-Host "  [WARN] Response is not valid JSON" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [WARN] API returned non-200 status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [ERROR] Cannot connect to API server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  [TIP] Please ensure backend service is running (npm run dev in backend folder)" -ForegroundColor Cyan
}

# 5. Check Frontend Server
Write-Host "`n5. Checking Frontend Server..." -ForegroundColor Yellow
$frontendUrl = "http://localhost:3000"

try {
    Write-Host "  Testing: $frontendUrl" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  [OK] Frontend server is running (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Frontend returned non-200 status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [ERROR] Cannot connect to frontend server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  [TIP] Please ensure frontend service is running (npm run dev in frontend folder)" -ForegroundColor Cyan
}

# 6. Verify API Endpoint Paths
Write-Host "`n6. Verifying API Endpoint Paths..." -ForegroundColor Yellow
$apiEndpoints = @(
    "/api/health",
    "/api/products",
    "/api/categories",
    "/api/orders",
    "/api/admin/auth/login",
    "/api/admin/stats"
)

Write-Host "  Frontend API call paths:" -ForegroundColor Gray
$frontendApiContent = Get-Content "frontend\src\api.js" -Raw
foreach ($endpoint in $apiEndpoints) {
    $escapedEndpoint = [regex]::Escape($endpoint)
    if ($frontendApiContent -match $escapedEndpoint) {
        Write-Host "    [OK] $endpoint" -ForegroundColor Green
    } else {
        Write-Host "    [WARN] $endpoint (not found in frontend code)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Configuration Summary:" -ForegroundColor Yellow
Write-Host "  Frontend Port: 3000" -ForegroundColor White
Write-Host "  Backend Port: 8787 (Cloudflare Workers)" -ForegroundColor White
Write-Host "  Frontend API URL: http://localhost:8787 (default)" -ForegroundColor White
Write-Host ""
