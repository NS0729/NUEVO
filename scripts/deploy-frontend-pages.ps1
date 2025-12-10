# 部署前端到 Cloudflare Pages 脚本
# 自动部署 frontend/dist 到 Cloudflare Pages

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  部署前端到 Cloudflare Pages" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查是否在项目根目录
if (-not (Test-Path "frontend" -PathType Container)) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# 检查 dist 目录
if (-not (Test-Path "frontend\dist" -PathType Container)) {
    Write-Host "❌ Error: frontend/dist directory not found" -ForegroundColor Red
    Write-Host "   Please run 'cd frontend && npm run build' first" -ForegroundColor Yellow
    exit 1
}

# 检查构建文件
$jsFiles = Get-ChildItem "frontend\dist\assets\*.js" | Where-Object { $_.Name -like "index-*.js" }
if ($jsFiles.Count -eq 0) {
    Write-Host "❌ Error: No JavaScript files found in frontend/dist/assets" -ForegroundColor Red
    exit 1
}

$newFile = $jsFiles | Where-Object { $_.Name -like "*MSIUPEA0*" }
if ($newFile) {
    Write-Host "✅ 找到新构建文件: $($newFile.Name)" -ForegroundColor Green
} else {
    Write-Host "⚠️  警告: 未找到新构建文件，可能仍在使用旧版本" -ForegroundColor Yellow
}

Write-Host "`n部署选项:" -ForegroundColor Cyan
Write-Host "1. 使用 Wrangler Pages CLI 部署（推荐）" -ForegroundColor White
Write-Host "2. 手动上传到 Cloudflare Dashboard" -ForegroundColor White
Write-Host "3. 显示部署说明" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请选择 (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n使用 Wrangler Pages CLI 部署..." -ForegroundColor Cyan
        
        # 检查是否已登录
        Write-Host "  检查 Cloudflare 登录状态..." -ForegroundColor Yellow
        try {
            npx wrangler whoami | Out-Null
            Write-Host "  ✅ 已登录 Cloudflare" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  未登录，正在登录..." -ForegroundColor Yellow
            npx wrangler login
        }
        
        # 获取项目名称
        Write-Host "`n  请输入 Cloudflare Pages 项目名称:" -ForegroundColor Yellow
        Write-Host "  (如果不知道，可以在 Cloudflare Dashboard 中查看)" -ForegroundColor Gray
        $projectName = Read-Host "  项目名称"
        
        if (-not $projectName) {
            Write-Host "  ❌ 项目名称不能为空" -ForegroundColor Red
            exit 1
        }
        
        # 部署
        Write-Host "`n  正在部署到 Cloudflare Pages..." -ForegroundColor Yellow
        Push-Location frontend
        
        try {
            npx wrangler pages deploy dist --project-name=$projectName
            Write-Host "`n  ✅ 部署成功！" -ForegroundColor Green
        } catch {
            Write-Host "`n  ❌ 部署失败: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "`n  请尝试方法 2: 手动上传" -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
        
        Pop-Location
        
        Write-Host "`n  等待几秒钟让部署生效..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host "`n  清除 Cloudflare 缓存..." -ForegroundColor Yellow
        Write-Host "  (请在 Cloudflare Dashboard 中手动清除缓存)" -ForegroundColor Gray
    }
    
    "2" {
        Write-Host "`n手动上传步骤:" -ForegroundColor Cyan
        Write-Host "1. 打开浏览器访问: https://dash.cloudflare.com" -ForegroundColor White
        Write-Host "2. 进入 Workers & Pages → Pages" -ForegroundColor White
        Write-Host "3. 找到您的项目（mundo.guacara.app 或相关名称）" -ForegroundColor White
        Write-Host "4. 点击项目 → Upload assets 或 Deploy site" -ForegroundColor White
        Write-Host "5. 选择 frontend/dist 目录中的所有文件" -ForegroundColor White
        Write-Host "6. 点击 Deploy" -ForegroundColor White
        Write-Host ""
        Write-Host "构建文件位置: $PSScriptRoot\frontend\dist" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "按任意键打开 Cloudflare Dashboard..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Start-Process "https://dash.cloudflare.com"
    }
    
    "3" {
        Write-Host "`n=== Cloudflare Pages 部署说明 ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "方法 1: 使用 Wrangler CLI（推荐）" -ForegroundColor Yellow
        Write-Host "  命令: npx wrangler pages deploy dist --project-name=YOUR_PROJECT_NAME" -ForegroundColor White
        Write-Host ""
        Write-Host "方法 2: 通过 Dashboard 上传" -ForegroundColor Yellow
        Write-Host "  1. 登录 https://dash.cloudflare.com" -ForegroundColor White
        Write-Host "  2. Workers & Pages → Pages" -ForegroundColor White
        Write-Host "  3. 选择项目 → Upload assets" -ForegroundColor White
        Write-Host "  4. 上传 frontend/dist 目录" -ForegroundColor White
        Write-Host ""
        Write-Host "方法 3: 使用 Git 连接（如果已配置）" -ForegroundColor Yellow
        Write-Host "  - 推送代码到 Git 仓库" -ForegroundColor White
        Write-Host "  - Cloudflare Pages 会自动部署" -ForegroundColor White
        Write-Host ""
        Write-Host "部署后操作:" -ForegroundColor Yellow
        Write-Host "  1. 等待 1-2 分钟让部署完成" -ForegroundColor White
        Write-Host "  2. 在 Cloudflare Dashboard 中清除缓存" -ForegroundColor White
        Write-Host "  3. 清除浏览器缓存（Ctrl+Shift+R）" -ForegroundColor White
        Write-Host "  4. 访问 https://mundo.guacara.app 验证" -ForegroundColor White
    }
    
    default {
        Write-Host "`n无效选择，退出" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  部署完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "验证步骤:" -ForegroundColor Cyan
Write-Host "1. 等待 1-2 分钟" -ForegroundColor White
Write-Host "2. 访问 https://mundo.guacara.app" -ForegroundColor White
Write-Host "3. 打开开发者工具（F12）→ Network 标签" -ForegroundColor White
Write-Host "4. 检查是否加载 index-MSIUPEA0.js（新文件）" -ForegroundColor White
Write-Host "5. 检查产品是否正常显示" -ForegroundColor White
Write-Host ""

Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

