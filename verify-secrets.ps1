# 验证GitHub Secrets配置脚本
Write-Host "`n=== GitHub Secrets 配置验证 ===" -ForegroundColor Cyan

Write-Host "`n这个脚本将帮助你验证GitHub Secrets配置" -ForegroundColor Yellow
Write-Host "`n请按照以下步骤操作:" -ForegroundColor White

Write-Host "`n步骤1: 获取Cloudflare API Token" -ForegroundColor Yellow
Write-Host "1. 访问: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor White
Write-Host "2. 点击 'Create Token'" -ForegroundColor White
Write-Host "3. 使用 'Edit Cloudflare Workers' 模板" -ForegroundColor White
Write-Host "4. 添加权限: Workers:Edit, D1:Edit" -ForegroundColor White
Write-Host "5. 复制Token（只显示一次！）" -ForegroundColor Red

$apiToken = Read-Host "`n请输入你的Cloudflare API Token（或按Enter跳过）"
if ($apiToken) {
    if ($apiToken.Length -lt 40) {
        Write-Host "⚠️  Token长度似乎不正确，请检查" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Token格式看起来正确" -ForegroundColor Green
    }
}

Write-Host "`n步骤2: 获取Cloudflare Account ID" -ForegroundColor Yellow
Write-Host "1. 访问: https://dash.cloudflare.com/" -ForegroundColor White
Write-Host "2. 在右侧边栏找到 'Account ID'" -ForegroundColor White
Write-Host "3. 复制Account ID" -ForegroundColor White

$accountId = Read-Host "`n请输入你的Cloudflare Account ID（或按Enter跳过）"
if ($accountId) {
    if ($accountId.Length -lt 30) {
        Write-Host "⚠️  Account ID长度似乎不正确，请检查" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Account ID格式看起来正确" -ForegroundColor Green
    }
}

Write-Host "`n步骤3: 在GitHub配置Secrets" -ForegroundColor Yellow
Write-Host "1. 访问: https://github.com/NS0729/NUEVO/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "2. 点击 'New repository secret'" -ForegroundColor White
Write-Host "3. 添加以下Secrets:" -ForegroundColor White

if ($apiToken) {
    Write-Host "`n   Name: CLOUDFLARE_API_TOKEN" -ForegroundColor Green
    Write-Host "   Value: $apiToken" -ForegroundColor Gray
} else {
    Write-Host "`n   Name: CLOUDFLARE_API_TOKEN" -ForegroundColor Green
    Write-Host "   Value: [你的API Token]" -ForegroundColor Gray
}

if ($accountId) {
    Write-Host "`n   Name: CLOUDFLARE_ACCOUNT_ID" -ForegroundColor Green
    Write-Host "   Value: $accountId" -ForegroundColor Gray
} else {
    Write-Host "`n   Name: CLOUDFLARE_ACCOUNT_ID" -ForegroundColor Green
    Write-Host "   Value: [你的Account ID]" -ForegroundColor Gray
}

Write-Host "`n步骤4: 验证配置" -ForegroundColor Yellow
Write-Host "1. 访问: https://github.com/NS0729/NUEVO/actions" -ForegroundColor Cyan
Write-Host "2. 点击 'Database Migration' 工作流" -ForegroundColor White
Write-Host "3. 点击 'Run workflow' → 'Run workflow'" -ForegroundColor White
Write-Host "4. 查看运行结果" -ForegroundColor White

Write-Host "`n=== 配置完成后的操作 ===" -ForegroundColor Cyan
Write-Host "`n当推送迁移文件到main分支时，GitHub Actions会自动执行数据库迁移" -ForegroundColor White
Write-Host "`n查看详细指南: 打开 SETUP_GITHUB_SECRETS.md 文件" -ForegroundColor Yellow

