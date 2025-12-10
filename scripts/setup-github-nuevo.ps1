# GitHub仓库NUEVO设置脚本
param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername = "",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl = ""
)

Write-Host "`n=== GitHub仓库 'NUEVO' 设置 ===" -ForegroundColor Cyan

# 如果没有提供URL，尝试构建
if ([string]::IsNullOrEmpty($RepoUrl)) {
    if ([string]::IsNullOrEmpty($GitHubUsername)) {
        Write-Host "`n请提供以下信息之一:" -ForegroundColor Yellow
        Write-Host "1. GitHub用户名（将自动构建URL）" -ForegroundColor White
        Write-Host "2. 完整的仓库URL" -ForegroundColor White
        Write-Host "`n示例:" -ForegroundColor Gray
        Write-Host "  .\setup-github-nuevo.ps1 -GitHubUsername yourusername" -ForegroundColor Green
        Write-Host "  或" -ForegroundColor Gray
        Write-Host "  .\setup-github-nuevo.ps1 -RepoUrl https://github.com/yourusername/NUEVO.git" -ForegroundColor Green
        exit
    } else {
        $RepoUrl = "https://github.com/$GitHubUsername/NUEVO.git"
    }
}

Write-Host "`n仓库URL: $RepoUrl" -ForegroundColor Green

# 检查是否已存在远程仓库
$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n⚠️  已存在远程仓库: $existingRemote" -ForegroundColor Yellow
    $replace = Read-Host "是否替换为新的远程仓库? (y/n)"
    if ($replace -eq "y" -or $replace -eq "Y") {
        git remote remove origin
        Write-Host "✅ 已移除旧的远程仓库" -ForegroundColor Green
    } else {
        Write-Host "取消操作" -ForegroundColor Yellow
        exit
    }
}

Write-Host "`n添加远程仓库..." -ForegroundColor Cyan
git remote add origin $RepoUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 远程仓库已添加" -ForegroundColor Green
    
    Write-Host "`n推送到GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ 代码已成功推送到GitHub!" -ForegroundColor Green
        Write-Host "`n仓库地址: https://github.com/$($RepoUrl -replace '.*github\.com/([^/]+)/.*', '$1')/NUEVO" -ForegroundColor Cyan
        
        Write-Host "`n=== 下一步: 配置GitHub Secrets ===" -ForegroundColor Yellow
        Write-Host "1. 进入仓库 Settings → Secrets and variables → Actions" -ForegroundColor White
        Write-Host "2. 点击 'New repository secret'" -ForegroundColor White
        Write-Host "3. 添加以下Secrets:" -ForegroundColor White
        Write-Host "   - Name: CLOUDFLARE_API_TOKEN" -ForegroundColor Green
        Write-Host "     Value: 你的Cloudflare API Token" -ForegroundColor Gray
        Write-Host "   - Name: CLOUDFLARE_ACCOUNT_ID" -ForegroundColor Green
        Write-Host "     Value: 你的Cloudflare Account ID" -ForegroundColor Gray
        Write-Host "`n获取Cloudflare API Token:" -ForegroundColor Yellow
        Write-Host "1. 访问 https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor White
        Write-Host "2. 创建Token，权限包括: Workers:Edit, D1:Edit" -ForegroundColor White
    } else {
        Write-Host "`n❌ 推送失败" -ForegroundColor Red
        Write-Host "可能的原因:" -ForegroundColor Yellow
        Write-Host "1. 仓库尚未在GitHub创建" -ForegroundColor White
        Write-Host "2. 认证失败（需要配置Git凭据）" -ForegroundColor White
        Write-Host "3. 仓库URL不正确" -ForegroundColor White
        Write-Host "`n请检查:" -ForegroundColor Yellow
        Write-Host "- 确保已在GitHub创建名为'NUEVO'的仓库" -ForegroundColor White
        Write-Host "- 确保仓库URL正确" -ForegroundColor White
        Write-Host "- 如果使用HTTPS，可能需要配置Git凭据" -ForegroundColor White
    }
} else {
    Write-Host "❌ 添加远程仓库失败" -ForegroundColor Red
}


