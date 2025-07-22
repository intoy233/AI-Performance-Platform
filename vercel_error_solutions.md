# Vercel 部署常见错误解决指南

## 🚨 错误类型与解决方案

### 1. Function Runtimes 错误

#### 错误信息
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

#### 原因分析
- `vercel.json` 中配置了不必要的 `functions` 字段
- 静态网站项目不需要服务器端函数配置
- 运行时版本格式不正确

#### 解决方案

**方案一：移除 functions 配置（推荐）**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**方案二：如果确实需要函数功能**
```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    },
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 2. 构建失败错误

#### 错误信息
```
Error: Build failed with exit code 1
```

#### 常见原因与解决方案

**原因1：HTML 语法错误**
```bash
# 检查 HTML 文件语法
# 确保所有标签正确闭合
# 检查特殊字符是否正确转义
```

**原因2：CSS 语法错误**
```bash
# 检查 CSS 文件
# 确保所有括号匹配
# 检查属性值格式
```

**原因3：JavaScript 语法错误**
```bash
# 检查 JS 文件
# 确保所有函数正确定义
# 检查变量声明
```

### 3. 页面 404 错误

#### 错误信息
```
404 - This page could not be found
```

#### 解决方案

**添加重写规则**
```json
{
  "rewrites": [
    {
      "source": "/settings",
      "destination": "/settings.html"
    },
    {
      "source": "/auth",
      "destination": "/auth.html"
    },
    {
      "source": "/profile",
      "destination": "/profile.html"
    }
  ]
}
```

### 4. 环境变量错误

#### 错误信息
```
ReferenceError: process is not defined
```

#### 解决方案

**前端环境变量配置**
```javascript
// 不要在前端直接使用 process.env
// 使用构建时替换或运行时配置

// 错误方式
const apiKey = process.env.API_KEY;

// 正确方式
const apiKey = window.ENV?.API_KEY || 'default-key';
```

### 5. CORS 跨域错误

#### 错误信息
```
Access to fetch at 'xxx' from origin 'xxx' has been blocked by CORS policy
```

#### 解决方案

**添加 CORS 头**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

---

## 🔧 调试步骤

### 1. 检查部署日志

1. **进入 Vercel 项目页面**
2. **点击 "Deployments"**
3. **选择失败的部署**
4. **查看详细日志**

### 2. 本地测试

```bash
# 安装 Vercel CLI
npm i -g vercel

# 本地运行
vercel dev

# 检查是否有错误
```

### 3. 文件检查清单

- [ ] `vercel.json` 语法正确
- [ ] 所有 HTML 文件语法正确
- [ ] CSS 文件无语法错误
- [ ] JavaScript 文件无语法错误
- [ ] 文件路径使用正斜杠 `/`
- [ ] 所有引用的文件都存在

---

## 📋 最佳实践

### 1. vercel.json 配置模板

**纯静态网站**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**包含 API 的项目**
```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
```

### 2. 部署前检查

```bash
# 1. 检查文件结构
ls -la

# 2. 验证 JSON 格式
cat vercel.json | python -m json.tool

# 3. 检查 HTML 语法
# 使用在线 HTML 验证器

# 4. 测试本地运行
python -m http.server 8000
```

### 3. 错误预防

1. **使用代码格式化工具**
   - Prettier for HTML/CSS/JS
   - ESLint for JavaScript

2. **定期备份**
   - Git 版本控制
   - 定期推送到 GitHub

3. **渐进式部署**
   - 先部署基础功能
   - 逐步添加复杂功能

---

## 🆘 紧急修复步骤

如果部署完全失败，按以下步骤操作：

### 1. 回滚到最简配置

创建最小化的 `vercel.json`：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ]
}
```

### 2. 逐步添加配置

1. 先确保基础部署成功
2. 逐个添加 headers
3. 最后添加复杂功能

### 3. 联系支持

如果问题仍然存在：
- Vercel 官方文档：[vercel.com/docs](https://vercel.com/docs)
- GitHub Issues：[github.com/vercel/vercel](https://github.com/vercel/vercel)
- 社区论坛：[github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## ✅ 成功部署检查清单

部署成功后，确认以下项目：

- [ ] 网站可以正常访问
- [ ] 所有页面都能加载
- [ ] CSS 样式正确显示
- [ ] JavaScript 功能正常
- [ ] 表单可以提交
- [ ] 移动端适配正常
- [ ] HTTPS 证书有效
- [ ] 性能指标良好

---

记住：大多数 Vercel 部署错误都是配置问题，仔细检查 `vercel.json` 文件通常能解决 90% 的问题！