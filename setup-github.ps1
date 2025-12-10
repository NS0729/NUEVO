# GitHub仓库设置脚本
Write-Host "`n=== GitHub仓库设置 ===" -ForegroundColor Cyan
Write-Host "`n步骤1: 在GitHub创建新仓库" -ForegroundColor Yellow
Write-Host "1. 访问 https://github.com/new" -ForegroundColor White
Write-Host "2. 填写仓库名称（例如: jewelry-app）" -ForegroundColor White
Write-Host "3. 选择 Public 或 Private" -ForegroundColor White
Write-Host "4. 不要勾选 'Initialize this repository with a README'" -ForegroundColor White
Write-Host "5. 点击 'Create repository'" -ForegroundColor White
Write-Host "`n步骤2: 复制仓库URL" -ForegroundColor Yellow
Write-Host "创建仓库后，GitHub会显示仓库URL，格式如下:" -ForegroundColor White
Write-Host "https://github.com/你的用户名/jewelry-app.git" -ForegroundColor Green
Write-Host "`n步骤3: 运行以下命令（替换为你的实际URL）:" -ForegroundColor Yellow
Write-Host "git remote add origin https://github.com/你的用户名/jewelry-app.git" -ForegroundColor Green
Write-Host "git push -u origin main" -ForegroundColor Green
Write-Host "`n或者，如果你已经创建了仓库，请输入仓库URL:" -ForegroundColor Yellow
$repoUrl = Read-Host "GitHub仓库URL"
if ($repoUrl) {
    Write-Host "`n添加远程仓库..." -ForegroundColor Cyan
    git remote add origin $repoUrl
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 远程仓库已添加" -ForegroundColor Green
        Write-Host "`n推送到GitHub..." -ForegroundColor Cyan
        git push -u origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ 代码已成功推送到GitHub!" -ForegroundColor Green
            Write-Host "`n下一步: 配置GitHub Secrets" -ForegroundColor Yellow
            Write-Host "1. 进入仓库 Settings → Secrets and variables → Actions" -ForegroundColor White
            Write-Host "2. 添加以下Secrets:" -ForegroundColor White
            Write-Host "   - CLOUDFLARE_API_TOKEN" -ForegroundColor Green
            Write-Host "   - CLOUDFLARE_ACCOUNT_ID" -ForegroundColor Green
        } else {
            Write-Host "❌ 推送失败，请检查仓库URL和权限" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 添加远程仓库失败" -ForegroundColor Red
    }
}

