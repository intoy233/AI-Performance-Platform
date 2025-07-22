@echo off
echo ========================================
echo 智能交互平台 - 构建脚本
echo ========================================
echo.

echo 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Python，请先安装Python
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo 安装依赖包...
call npm install

if %errorlevel% neq 0 (
    echo 错误: 依赖包安装失败
    pause
    exit /b 1
)

echo.
echo 开始构建应用...
call npm run build-win

if %errorlevel% neq 0 (
    echo 错误: 应用构建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 构建完成！
echo 安装文件位置: dist\智能交互平台 Setup 1.0.0.exe
echo ========================================
echo.
pause