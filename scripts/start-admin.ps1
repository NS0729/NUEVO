# Start Admin Panel Script
# Usage: .\scripts\start-admin.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Admin Panel Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if in project root
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Please run this script from project root" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "Checking environment..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  Node.js not found, please install Node.js first" -ForegroundColor Red
    exit 1
}

# Check dependencies
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "  Frontend dependencies not installed, installing..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host "  Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  Frontend dependencies OK" -ForegroundColor Green
}

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "  Backend dependencies not installed, installing..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
    Write-Host "  Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  Backend dependencies OK" -ForegroundColor Green
}

# Check database migration
Write-Host ""
Write-Host "Checking database..." -ForegroundColor Yellow
Push-Location backend
Write-Host "  Running database migrations..." -ForegroundColor Cyan
npm run db:migrate 2>&1 | Out-Null
npm run db:migrate:admin 2>&1 | Out-Null
Write-Host "  Database migrations completed" -ForegroundColor Green
Pop-Location

# Start services
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend: http://localhost:8787" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Admin Login: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host ""

# Get current directory
$currentDir = Get-Location

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Yellow
$backendPath = Join-Path $currentDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend server starting...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# Wait for backend
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Yellow
$frontendPath = Join-Path $currentDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend server starting...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# Wait for services
Write-Host ""
Write-Host "Waiting for services to start (about 15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Open browser
Write-Host ""
Write-Host "Opening admin login page..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/admin/login"

# Display info
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Startup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access Information:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8787" -ForegroundColor White
Write-Host "  Admin Login: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "  - Close PowerShell windows to stop services" -ForegroundColor White
Write-Host "  - If browser didn't open, visit the URL manually" -ForegroundColor White
Write-Host "  - Check server windows for any error messages" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window (services will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
