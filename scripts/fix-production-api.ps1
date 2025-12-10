# 修复生产环境 API URL 配置脚本
# 用于解决前端访问 localhost 的问题

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  修复生产环境 API URL 配置" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查是否在项目根目录
if (-not (Test-Path "backend" -PathType Container) -or -not (Test-Path "frontend" -PathType Container)) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# 步骤 1: 尝试从 Cloudflare 获取 Workers URL
Write-Host "步骤 1: 查找 Cloudflare Workers URL..." -ForegroundColor Cyan
Push-Location backend

# 尝试获取 Workers 信息
Write-Host "  正在检查 Workers 部署..." -ForegroundColor Yellow
$workersName = "jewelry-app-api"

# 尝试常见的 Workers URL 格式
$possibleUrls = @(
    "https://$workersName.workers.dev",
    "https://$workersName.fengzhihong1994.workers.dev",
    "https://$workersName.$(whoami).workers.dev"
)

$workersUrl = $null
foreach ($url in $possibleUrls) {
    Write-Host "  测试: $url" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri "$url/api/health" -Method GET -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $workersUrl = $url
            Write-Host "  ✅ 找到有效的 Workers URL: $url" -ForegroundColor Green
            break
        }
    } catch {
        # 继续尝试下一个
    }
}

Pop-Location

# 如果自动检测失败，让用户手动输入
if (-not $workersUrl) {
    Write-Host "`n⚠️  无法自动检测 Workers URL" -ForegroundColor Yellow
    Write-Host "`n请按照以下步骤查找您的 Workers URL:" -ForegroundColor Cyan
    Write-Host "1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com" -ForegroundColor White
    Write-Host "2. 进入 Workers & Pages" -ForegroundColor White
    Write-Host "3. 找到名为 'jewelry-app-api' 的 Worker" -ForegroundColor White
    Write-Host "4. 复制其 URL（格式: https://jewelry-app-api.xxx.workers.dev）" -ForegroundColor White
    Write-Host ""
    $workersUrl = Read-Host "请输入您的 Workers URL"
    
    if (-not $workersUrl -or -not $workersUrl.StartsWith("https://")) {
        Write-Host "❌ 无效的 URL，退出" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✅ Workers URL: $workersUrl" -ForegroundColor Green

# 步骤 2: 创建或更新 .env.production 文件
Write-Host "`n步骤 2: 配置前端环境变量..." -ForegroundColor Cyan
Push-Location frontend

$envContent = @"
VITE_API_URL=$workersUrl
VITE_WHATSAPP_PHONE=8613800138000
"@

$envFile = ".env.production"
if (Test-Path $envFile) {
    Write-Host "  ⚠️  .env.production 已存在，将更新..." -ForegroundColor Yellow
    $backupFile = ".env.production.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $envFile $backupFile
    Write-Host "  📋 已备份到: $backupFile" -ForegroundColor Gray
} else {
    Write-Host "  📝 创建新的 .env.production 文件..." -ForegroundColor Yellow
}

$envContent | Out-File -FilePath $envFile -Encoding UTF8 -NoNewline
Write-Host "  ✅ 环境变量配置完成" -ForegroundColor Green
Write-Host "  📋 API URL: $workersUrl" -ForegroundColor White

Pop-Location

# 步骤 3: 重新构建前端
Write-Host "`n步骤 3: 重新构建前端..." -ForegroundColor Cyan
Push-Location frontend

Write-Host "  运行构建命令..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ 前端构建成功" -ForegroundColor Green
    Write-Host "  📦 构建输出: frontend/dist" -ForegroundColor White
} else {
    Write-Host "  ❌ 前端构建失败" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# 总结
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  修复完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "配置信息:" -ForegroundColor Cyan
Write-Host "  Workers URL: $workersUrl" -ForegroundColor White
Write-Host "  前端构建: frontend/dist" -ForegroundColor White
Write-Host ""

Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "1. 将 frontend/dist 目录重新部署到您的静态托管服务" -ForegroundColor White
Write-Host "2. 清除浏览器缓存并刷新页面" -ForegroundColor White
Write-Host "3. 访问 https://mundo.guacara.app/admin/login 测试" -ForegroundColor White
Write-Host ""

Write-Host "默认登录信息:" -ForegroundColor Cyan
Write-Host "  用户名: admin" -ForegroundColor White
Write-Host "  密码: admin123" -ForegroundColor White
Write-Host ""

Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

