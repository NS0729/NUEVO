# 完整的商家后台启动脚本
# 使用方法: .\scripts\start-admin-complete.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  商家后台管理系统 - 完整启动脚本" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查是否在项目根目录
if (-not (Test-Path "backend" -PathType Container) -or -not (Test-Path "frontend" -PathType Container)) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 Node.js
Write-Host "📋 检查环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查依赖
Write-Host "`n📦 检查依赖..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "   ⚠️  前端依赖未安装，正在安装..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "   ✅ 前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "   ✅ 前端依赖已安装" -ForegroundColor Green
}

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "   ⚠️  后端依赖未安装，正在安装..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "   ✅ 后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "   ✅ 后端依赖已安装" -ForegroundColor Green
}

# 检查数据库迁移
Write-Host "`n🗄️  检查数据库..." -ForegroundColor Yellow
Set-Location backend
Write-Host "   运行数据库迁移..." -ForegroundColor Cyan
npm run db:migrate 2>&1 | Out-Null
npm run db:migrate:admin 2>&1 | Out-Null
Write-Host "   ✅ 数据库迁移完成" -ForegroundColor Green
Set-Location ..

# 检查端口占用
Write-Host "`n🔍 检查端口..." -ForegroundColor Yellow
try {
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        Write-Host "   ⚠️  端口 3000 已被占用" -ForegroundColor Yellow
    }
} catch {}

try {
    $port8787 = Get-NetTCPConnection -LocalPort 8787 -ErrorAction SilentlyContinue
    if ($port8787) {
        Write-Host "   ⚠️  端口 8787 已被占用" -ForegroundColor Yellow
    }
} catch {}

Write-Host "   ✅ 端口检查完成" -ForegroundColor Green

# 启动服务
Write-Host "`n🚀 启动服务..." -ForegroundColor Cyan
Write-Host "`n   📦 后端服务器: http://localhost:8787" -ForegroundColor White
Write-Host "   🌐 前端服务器: http://localhost:3000" -ForegroundColor White
Write-Host "   🔐 后台登录: http://localhost:3000/admin/login" -ForegroundColor White

# 启动后端
Write-Host "`n   正在启动后端服务器..." -ForegroundColor Yellow
$backendPath = (Resolve-Path "backend").Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '后端服务器启动中...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端
Write-Host "   正在启动前端服务器..." -ForegroundColor Yellow
$frontendPath = (Resolve-Path "frontend").Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '前端服务器启动中...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# 等待服务启动
Write-Host "`n⏳ 等待服务启动完成（约15秒）..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 验证服务是否启动
Write-Host "`n🔍 验证服务状态..." -ForegroundColor Yellow
$backendReady = $false
$frontendReady = $false

for ($i = 0; $i -lt 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8787/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "   ✅ 后端服务器已就绪" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

for ($i = 0; $i -lt 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "   ✅ 前端服务器已就绪" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "   ⚠️  后端服务器可能未完全启动，请检查后端窗口" -ForegroundColor Yellow
}

if (-not $frontendReady) {
    Write-Host "   ⚠️  前端服务器可能未完全启动，请检查前端窗口" -ForegroundColor Yellow
}

# 打开浏览器
Write-Host "`n🌍 打开商家后台登录页面..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/admin/login"

# 显示信息
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ 启动完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "📋 访问信息:" -ForegroundColor Cyan
Write-Host "   🌐 前端应用: http://localhost:3000" -ForegroundColor White
Write-Host "   📦 后端 API: http://localhost:8787" -ForegroundColor White
Write-Host "   🔐 后台登录: http://localhost:3000/admin/login" -ForegroundColor White

Write-Host "`n🔑 登录信息:" -ForegroundColor Cyan
Write-Host "   用户名: admin" -ForegroundColor White
Write-Host "   密码: admin123" -ForegroundColor White

Write-Host "`n💡 提示:" -ForegroundColor Yellow
Write-Host "   - 关闭 PowerShell 窗口即可停止服务" -ForegroundColor White
Write-Host "   - 如果浏览器未自动打开，请手动访问上述地址" -ForegroundColor White
Write-Host "   - 如果遇到问题，请检查打开的服务器窗口中的错误信息" -ForegroundColor White

Write-Host "`n按任意键退出此窗口（服务将继续运行）..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
