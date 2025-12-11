# 测试移动端自动缩放功能

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  移动端自动缩放功能测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "..\frontend"
$errors = @()

# 1. 检查新增的工具文件
Write-Host "1. 检查工具文件..." -ForegroundColor Yellow
$files = @(
    "src\utils\mobileScale.js",
    "src\utils\viewportFix.js"
)

foreach ($file in $files) {
    $filePath = Join-Path $frontendPath $file
    if (Test-Path $filePath) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] $file 不存在" -ForegroundColor Red
        $errors += $file
    }
}

# 2. 检查 index.html 中的 viewport 配置
Write-Host ""
Write-Host "2. 检查 viewport 配置..." -ForegroundColor Yellow
$indexHtml = Join-Path $frontendPath "index.html"
if (Test-Path $indexHtml) {
    $content = Get-Content $indexHtml -Raw
    if ($content -match 'viewport.*initial-scale') {
        Write-Host "  [OK] viewport meta 标签已配置" -ForegroundColor Green
        if ($content -match 'viewport-fit=cover') {
            Write-Host "  [OK] viewport-fit=cover 已设置" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] viewport-fit=cover 未设置" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [ERROR] viewport meta 标签未找到" -ForegroundColor Red
        $errors += "index.html viewport"
    }
} else {
    Write-Host "  [ERROR] index.html 不存在" -ForegroundColor Red
    $errors += "index.html"
}

# 3. 检查 main.js 中的导入
Write-Host ""
Write-Host "3. 检查 main.js 导入..." -ForegroundColor Yellow
$mainJs = Join-Path $frontendPath "src\main.js"
if (Test-Path $mainJs) {
    $content = Get-Content $mainJs -Raw
    if ($content -match 'mobileScale') {
        Write-Host "  [OK] mobileScale 已导入" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] mobileScale 未导入" -ForegroundColor Red
        $errors += "main.js mobileScale"
    }
    
    if ($content -match 'viewportFix') {
        Write-Host "  [OK] viewportFix 已导入" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] viewportFix 未导入" -ForegroundColor Red
        $errors += "main.js viewportFix"
    }
    
    if ($content -match 'initMobileScale') {
        Write-Host "  [OK] initMobileScale 已调用" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] initMobileScale 未调用" -ForegroundColor Red
        $errors += "main.js initMobileScale"
    }
    
    if ($content -match 'initViewportFix') {
        Write-Host "  [OK] initViewportFix 已调用" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] initViewportFix 未调用" -ForegroundColor Red
        $errors += "main.js initViewportFix"
    }
} else {
    Write-Host "  [ERROR] main.js 不存在" -ForegroundColor Red
    $errors += "main.js"
}

# 4. 检查样式文件中的移动端优化
Write-Host ""
Write-Host "4. 检查样式文件..." -ForegroundColor Yellow
$mainScss = Join-Path $frontendPath "src\styles\main.scss"
if (Test-Path $mainScss) {
    $content = Get-Content $mainScss -Raw
    if ($content -match 'text-size-adjust') {
        Write-Host "  [OK] text-size-adjust 已设置" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] text-size-adjust 未设置" -ForegroundColor Yellow
    }
    
    if ($content -match 'clamp\(') {
        Write-Host "  [OK] clamp() 响应式字体已使用" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] clamp() 未使用" -ForegroundColor Yellow
    }
    
    if ($content -match '@media.*max-width.*768px') {
        Write-Host "  [OK] 移动端媒体查询已配置" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] 移动端媒体查询未找到" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [ERROR] main.scss 不存在" -ForegroundColor Red
    $errors += "main.scss"
}

# 5. 检查工具函数导出
Write-Host ""
Write-Host "5. 检查工具函数..." -ForegroundColor Yellow
$mobileScaleJs = Join-Path $frontendPath "src\utils\mobileScale.js"
if (Test-Path $mobileScaleJs) {
    $content = Get-Content $mobileScaleJs -Raw
    $functions = @(
        "detectDevice",
        "autoScalePage",
        "initMobileScale",
        "getCurrentScale"
    )
    
    foreach ($func in $functions) {
        if ($content -match "export.*function.*$func|export function $func") {
            Write-Host "  [OK] $func 函数已导出" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] $func 函数未找到" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  [ERROR] mobileScale.js 不存在" -ForegroundColor Red
    $errors += "mobileScale.js"
}

# 总结
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "所有检查通过！" -ForegroundColor Green
    Write-Host ""
    Write-Host "测试建议:" -ForegroundColor Yellow
    Write-Host "  1. 启动前端服务: cd frontend; npm run dev" -ForegroundColor White
    Write-Host "  2. 打开浏览器开发者工具 (F12)" -ForegroundColor White
    Write-Host "  3. 切换到设备模式 (Ctrl+Shift+M)" -ForegroundColor White
    Write-Host "  4. 选择不同设备测试缩放效果" -ForegroundColor White
    Write-Host "  5. 在控制台运行: window.__mobileUtils.detectDevice()" -ForegroundColor White
    Write-Host "  6. 测试横竖屏切换" -ForegroundColor White
} else {
    Write-Host "发现 $($errors.Count) 个问题:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
