# 简单启动脚本 - 启动前端和后端

# 获取脚本所在目录的父目录（项目根目录）
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

Write-Host "`n启动开发环境...`n" -ForegroundColor Cyan

# 启动后端（新窗口）
Write-Host "启动后端服务器 (端口 8787)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; npm run dev"

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端（新窗口）
Write-Host "启动前端服务器 (端口 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"

Write-Host "`n✅ 开发环境已启动！" -ForegroundColor Green
Write-Host "  前端: http://localhost:3000" -ForegroundColor White
Write-Host "  后端: http://localhost:8787`n" -ForegroundColor White

