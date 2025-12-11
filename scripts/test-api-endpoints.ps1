# Test All API Endpoints

# Get project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Testing API Endpoints" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8787"
$endpoints = @(
    @{ Method = "GET"; Path = "/api/health"; Auth = $false },
    @{ Method = "GET"; Path = "/api/products"; Auth = $false },
    @{ Method = "GET"; Path = "/api/categories"; Auth = $false }
)

Write-Host "Testing Public Endpoints:" -ForegroundColor Yellow
foreach ($endpoint in $endpoints) {
    $url = "$baseUrl$($endpoint.Path)"
    try {
        Write-Host "  Testing $($endpoint.Method) $($endpoint.Path)..." -ForegroundColor Gray -NoNewline
        $response = Invoke-WebRequest -Uri $url -Method $endpoint.Method -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " [OK] Status: $($response.StatusCode)" -ForegroundColor Green
            try {
                $data = $response.Content | ConvertFrom-Json
                if ($data.products) { Write-Host "    Products: $($data.products.Count)" -ForegroundColor White }
                if ($data.categories) { Write-Host "    Categories: $($data.categories.Count)" -ForegroundColor White }
            } catch {
                # Not JSON or different format
            }
        } else {
            Write-Host " [WARN] Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host " [AUTH REQUIRED] Status: 401" -ForegroundColor Cyan
        } elseif ($statusCode -eq 404) {
            Write-Host " [NOT FOUND] Status: 404" -ForegroundColor Red
        } else {
            Write-Host " [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

