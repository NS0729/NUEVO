# 启动开发环境脚本 - 同时启动前端和后端

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  启动开发环境" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 获取脚本所在目录的父目录（项目根目录）
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# 检查是否在项目根目录
if (-not (Test-Path "backend" -PathType Container) -or -not (Test-Path "frontend" -PathType Container)) {
    Write-Host "❌ 错误: 无法找到项目根目录" -ForegroundColor Red
    exit 1
}

# 检查Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查依赖
Write-Host "`n检查依赖..." -ForegroundColor Yellow

if (-not (Test-Path "backend\node_modules" -PathType Container)) {
    Write-Host "  安装后端依赖..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
}

if (-not (Test-Path "frontend\node_modules" -PathType Container)) {
    Write-Host "  安装前端依赖..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
}

Write-Host "✅ 依赖检查完成" -ForegroundColor Green

# 检查环境变量文件
Write-Host "`n检查环境配置..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\.env.development")) {
    Write-Host "  创建前端开发环境配置文件..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:8787
VITE_WHATSAPP_PHONE=8613800138000
"@ | Out-File -FilePath "frontend\.env.development" -Encoding UTF8
    Write-Host "  ✅ 已创建 frontend\.env.development" -ForegroundColor Green
} else {
    Write-Host "  ✅ 前端环境配置文件已存在" -ForegroundColor Green
}

# 启动后端
Write-Host "`n启动后端服务器..." -ForegroundColor Yellow
Write-Host "  后端将在 http://localhost:8787 运行" -ForegroundColor Gray
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    npm run dev
}

# 等待后端启动
Write-Host "  等待后端启动..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# 测试后端连接
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8787/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  ✅ 后端服务器运行正常" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  后端服务器可能还在启动中..." -ForegroundColor Yellow
}

# 启动前端
Write-Host "`n启动前端服务器..." -ForegroundColor Yellow
Write-Host "  前端将在 http://localhost:3000 运行" -ForegroundColor Gray
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend
    npm run dev
}

# 等待前端启动
Write-Host "  等待前端启动..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# 测试前端连接
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  ✅ 前端服务器运行正常" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  前端服务器可能还在启动中..." -ForegroundColor Yellow
}

# 总结
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  开发环境启动完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "服务地址:" -ForegroundColor Cyan
Write-Host "  前端: http://localhost:3000" -ForegroundColor White
Write-Host "  后端: http://localhost:8787" -ForegroundColor White
Write-Host ""

Write-Host "查看日志:" -ForegroundColor Cyan
Write-Host "  后端: Receive-Job -Job $backendJob" -ForegroundColor White
Write-Host "  前端: Receive-Job -Job $frontendJob" -ForegroundColor White
Write-Host ""

Write-Host "停止服务:" -ForegroundColor Cyan
Write-Host "  Stop-Job -Job `$backendJob, `$frontendJob" -ForegroundColor White
Write-Host "  Remove-Job -Job `$backendJob, `$frontendJob" -ForegroundColor White
Write-Host ""

Write-Host "按 Ctrl+C 停止所有服务..." -ForegroundColor Yellow
Write-Host ""

# 保存作业ID到文件，方便后续停止
@{
    BackendJob = $backendJob.Id
    FrontendJob = $frontendJob.Id
} | ConvertTo-Json | Out-File -FilePath ".dev-jobs.json" -Encoding UTF8

# 等待用户中断
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # 检查作业状态
        $backendStatus = Get-Job -Id $backendJob.Id | Select-Object -ExpandProperty State
        $frontendStatus = Get-Job -Id $frontendJob.Id | Select-Object -ExpandProperty State
        
        if ($backendStatus -eq "Failed" -or $frontendStatus -eq "Failed") {
            Write-Host "`n⚠️  检测到服务异常，请检查日志" -ForegroundColor Yellow
            break
        }
    }
} catch {
    Write-Host "`n正在停止服务..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Item ".dev-jobs.json" -ErrorAction SilentlyContinue
    Write-Host "✅ 服务已停止" -ForegroundColor Green
}

