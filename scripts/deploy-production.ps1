# Production Environment Deployment Script
# Usage: .\scripts\deploy-production.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Production Environment Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if in project root
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Please run this script from project root" -ForegroundColor Red
    exit 1
}

# Check Cloudflare login
Write-Host "Checking Cloudflare login..." -ForegroundColor Yellow
try {
    Push-Location backend
    $whoami = npx wrangler whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Not logged in, please login first..." -ForegroundColor Yellow
        npx wrangler login
    } else {
        Write-Host "  Already logged in to Cloudflare" -ForegroundColor Green
    }
    Pop-Location
} catch {
    Write-Host "  Error checking Cloudflare login" -ForegroundColor Red
    exit 1
}

# Step 1: Database Migration
Write-Host ""
Write-Host "Step 1: Running database migrations..." -ForegroundColor Cyan
Push-Location backend

Write-Host "  Running initial schema migration..." -ForegroundColor Yellow
$migrate1 = echo "Y" | npx wrangler d1 execute jewelry-db --file=./migrations/0001_initial_schema.sql --remote 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Initial schema migration completed" -ForegroundColor Green
} else {
    Write-Host "  Initial schema migration failed or already exists" -ForegroundColor Yellow
}

Write-Host "  Running admin users migration..." -ForegroundColor Yellow
$migrate2 = echo "Y" | npx wrangler d1 execute jewelry-db --file=./migrations/0002_admin_users.sql --remote 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Admin users migration completed" -ForegroundColor Green
} else {
    Write-Host "  Admin users migration failed or already exists" -ForegroundColor Yellow
}

Pop-Location

# Step 2: Deploy Backend
Write-Host ""
Write-Host "Step 2: Deploying backend to Cloudflare Workers..." -ForegroundColor Cyan
Push-Location backend

Write-Host "  Deploying..." -ForegroundColor Yellow
$deployOutput = npx wrangler deploy 2>&1
$deployOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

# Extract Workers URL from output
$workersUrl = ""
if ($deployOutput -match "https://([\w-]+)\.workers\.dev") {
    $workersUrl = $matches[0]
    Write-Host ""
    Write-Host "  Backend deployed successfully!" -ForegroundColor Green
    Write-Host "  Workers URL: $workersUrl" -ForegroundColor White
} else {
    Write-Host "  Could not extract Workers URL from output" -ForegroundColor Yellow
    Write-Host "  Please check the deployment output above" -ForegroundColor Yellow
    $workersUrl = Read-Host "  Enter your Workers URL manually (e.g., https://jewelry-app-api.xxx.workers.dev)"
}

Pop-Location

if (-not $workersUrl) {
    Write-Host ""
    Write-Host "Error: Workers URL is required to continue" -ForegroundColor Red
    exit 1
}

# Step 3: Configure Frontend
Write-Host ""
Write-Host "Step 3: Configuring frontend..." -ForegroundColor Cyan
Push-Location frontend

# Create .env.production file
$envContent = @"
VITE_API_URL=$workersUrl
VITE_WHATSAPP_PHONE=8613800138000
"@

$envFile = ".env.production"
if (Test-Path $envFile) {
    Write-Host "  .env.production already exists, updating..." -ForegroundColor Yellow
    $envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline
} else {
    Write-Host "  Creating .env.production..." -ForegroundColor Yellow
    $envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline
}
Write-Host "  Frontend environment configured" -ForegroundColor Green
Write-Host "  API URL: $workersUrl" -ForegroundColor White

Pop-Location

# Step 4: Build Frontend
Write-Host ""
Write-Host "Step 4: Building frontend..." -ForegroundColor Cyan
Push-Location frontend

Write-Host "  Running build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Frontend build completed successfully" -ForegroundColor Green
} else {
    Write-Host "  Frontend build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# Step 5: Deploy Frontend (Optional - using local preview for now)
Write-Host ""
Write-Host "Step 5: Frontend deployment options..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend has been built to: frontend/dist" -ForegroundColor White
Write-Host ""
Write-Host "  Deployment options:" -ForegroundColor Yellow
Write-Host "  1. Cloudflare Pages: Upload dist folder via Cloudflare Dashboard" -ForegroundColor White
Write-Host "  2. Vercel: Run 'cd frontend && vercel --prod'" -ForegroundColor White
Write-Host "  3. Netlify: Run 'cd frontend && netlify deploy --prod --dir=dist'" -ForegroundColor White
Write-Host "  4. Local preview: Run 'cd frontend && npm run preview'" -ForegroundColor White
Write-Host ""

# Ask user what they want to do
$choice = Read-Host "  Choose deployment option (1-4, or press Enter to skip)"
switch ($choice) {
    "1" {
        Write-Host "  Please deploy manually via Cloudflare Pages Dashboard" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "  Deploying to Vercel..." -ForegroundColor Yellow
        Push-Location frontend
        if (Get-Command vercel -ErrorAction SilentlyContinue) {
            vercel --prod
        } else {
            Write-Host "  Vercel CLI not found. Install with: npm install -g vercel" -ForegroundColor Yellow
        }
        Pop-Location
    }
    "3" {
        Write-Host "  Deploying to Netlify..." -ForegroundColor Yellow
        Push-Location frontend
        if (Get-Command netlify -ErrorAction SilentlyContinue) {
            netlify deploy --prod --dir=dist
        } else {
            Write-Host "  Netlify CLI not found. Install with: npm install -g netlify-cli" -ForegroundColor Yellow
        }
        Pop-Location
    }
    "4" {
        Write-Host "  Starting local preview server..." -ForegroundColor Yellow
        Push-Location frontend
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run preview"
        Start-Sleep -Seconds 3
        Start-Process "http://localhost:4173/admin/login"
        Pop-Location
    }
    default {
        Write-Host "  Skipping frontend deployment" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Summary" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:" -ForegroundColor Cyan
Write-Host "  URL: $workersUrl" -ForegroundColor White
Write-Host "  Health Check: $workersUrl/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Cyan
Write-Host "  Build Location: frontend/dist" -ForegroundColor White
Write-Host "  API URL: $workersUrl" -ForegroundColor White
Write-Host ""
Write-Host "Admin Login:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Important:" -ForegroundColor Yellow
Write-Host "  - Change the default admin password after first login!" -ForegroundColor White
Write-Host "  - Configure CORS in backend for production domain" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

