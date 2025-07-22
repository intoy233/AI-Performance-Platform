# 智能交互平台 - 打包部署指南

## 概述

本指南将帮助您将智能交互平台打包成可执行文件，使其能够在任何Windows电脑上独立运行，无需额外的环境配置。

## 系统要求

### 开发环境要求
- Windows 10/11
- Node.js 16.0 或更高版本
- Python 3.7 或更高版本
- 至少 2GB 可用磁盘空间

### 目标运行环境
- Windows 10/11 (64位)
- 至少 1GB 可用内存
- 摄像头设备（可选）
- 网络连接（用于访问Coze智能体）

## 快速开始

### 方法一：使用自动构建脚本（推荐）

1. **双击运行 `build.bat`**
   ```
   双击 build.bat 文件，脚本将自动：
   - 检查环境依赖
   - 安装必要的包
   - 构建可执行文件
   ```

2. **获取安装文件**
   ```
   构建完成后，在 dist 目录下找到：
   智能交互平台 Setup 1.0.0.exe
   ```

### 方法二：手动构建

1. **安装依赖**
   ```bash
   npm install
   ```

2. **构建应用**
   ```bash
   # Windows安装包
   npm run build-win
   
   # 或者只打包不制作安装程序
   npm run pack
   ```

## 构建选项

### 不同平台构建
```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# Linux
npm run build-linux

# 所有平台
npm run dist
```

### 开发模式运行
```bash
# 开发模式（用于测试）
npm start
```

## 文件结构

```
智能交互平台/
├── dist/                          # 构建输出目录
│   ├── 智能交互平台 Setup 1.0.0.exe  # Windows安装程序
│   └── win-unpacked/              # 未打包的应用文件
├── assets/                        # 应用资源
│   └── icon.svg                   # 应用图标
├── main.js                        # Electron主进程
├── package.json                   # 项目配置
├── build.bat                      # 自动构建脚本
└── [其他Web文件]                   # HTML/CSS/JS文件
```

## 部署说明

### 安装程序特性
- **一键安装**：双击即可安装，无需额外配置
- **桌面快捷方式**：自动创建桌面和开始菜单快捷方式
- **自动卸载**：支持通过控制面板卸载
- **更新支持**：支持应用更新机制

### 分发方式
1. **直接分发安装程序**
   - 将 `智能交互平台 Setup 1.0.0.exe` 发送给用户
   - 用户双击安装即可使用

2. **绿色版分发**
   - 压缩 `dist/win-unpacked/` 目录
   - 用户解压后直接运行 `智能交互平台.exe`

## 功能特性

### 内置功能
- ✅ **内置HTTP服务器**：无需外部Web服务器
- ✅ **摄像头支持**：自动检测和使用摄像头
- ✅ **Coze智能体集成**：嵌入式智能对话
- ✅ **用户认证**：Supabase集成的用户系统
- ✅ **主题切换**：多种界面主题
- ✅ **响应式设计**：适配不同屏幕尺寸

### 桌面应用特性
- 🖥️ **原生窗口**：完整的桌面应用体验
- ⌨️ **快捷键支持**：Ctrl+R刷新、F11全屏等
- 📱 **缩放支持**：Ctrl+Plus/Minus调整界面大小
- 🔧 **开发者工具**：F12打开调试工具
- 📋 **应用菜单**：完整的菜单栏功能

## 故障排除

### 常见问题

1. **构建失败**
   ```
   问题：npm install 失败
   解决：检查网络连接，尝试使用国内镜像
   npm config set registry https://registry.npmmirror.com
   ```

2. **Python环境问题**
   ```
   问题：找不到Python
   解决：安装Python并添加到系统PATH
   下载：https://www.python.org/downloads/
   ```

3. **Node.js版本问题**
   ```
   问题：Node.js版本过低
   解决：升级到Node.js 16+
   下载：https://nodejs.org/
   ```

4. **应用启动失败**
   ```
   问题：应用无法启动
   解决：检查防火墙设置，允许应用访问网络
   ```

### 性能优化

1. **减小安装包大小**
   ```bash
   # 只构建当前平台
   npm run build-win
   
   # 排除开发依赖
   npm prune --production
   ```

2. **启动速度优化**
   - 应用使用内置服务器，启动速度已优化
   - 首次启动可能需要2-3秒加载时间

## 高级配置

### 自定义构建选项

编辑 `package.json` 中的 `build` 配置：

```json
{
  "build": {
    "appId": "com.yourcompany.intelligent-platform",
    "productName": "智能交互平台",
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    }
  }
}
```

### 添加代码签名
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password"
    }
  }
}
```

## 技术支持

如果在构建或部署过程中遇到问题，请检查：

1. **环境要求**：确保满足所有系统要求
2. **网络连接**：确保能够下载依赖包
3. **权限设置**：确保有足够的文件系统权限
4. **防病毒软件**：某些防病毒软件可能阻止构建过程

## 更新日志

### v1.0.0
- 初始版本发布
- 支持Windows平台打包
- 集成Electron桌面应用框架
- 内置HTTP服务器
- 完整的用户界面和功能

---

**注意**：首次构建可能需要下载较多依赖包，请确保网络连接稳定。构建完成后，生成的安装程序可以在任何Windows电脑上独立运行。