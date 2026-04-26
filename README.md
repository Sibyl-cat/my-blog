# 📺 小电视の日常 · 粉系毛玻璃全栈博客

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.2.0-FB7299?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Backend-Cloudflare_Pages_Functions-orange?style=for-the-badge" alt="Backend">
  <img src="https://img.shields.io/badge/Database-Cloudflare_D1-skyblue?style=for-the-badge" alt="Database">
</p>

---

**小电视の日常** 是一个纯粹基于 **Cloudflare 边缘计算生态** 构建的高性能、全栈式个人/多作者博客系统。本项目深度融合了 **哔哩哔哩主题色 (#FB7299)** 与 **毛玻璃（Glassmorphism）** 设计语言，采用无框架（Vanilla JS）开发，通过 Web Components 实现高度组件化，提供极致的加载速度与视觉体验。

> [!IMPORTANT]
> 本项目核心逻辑完全运行在 Cloudflare 边缘节点，通过 D1 数据库存储数据，利用 Web Crypto API 确保账户安全，是一个真正意义上的 Serverless 云原生应用。

## ✨ 核心特性 (基于代码实现)

- **🎭 三级权限体系**：
  - `SuperAdmin`：拥有系统最高权限，可管理所有用户、文章及系统设置。
  - `Admin`：管理后台访问权限，管理自身文章及基础用户操作。
  - `User`：标准作者角色，专注于内容创作。
- **🔧 动态维护模式**：内置系统级开关，开启后仅管理员可绕过拦截访问，普通用户将被引导至美化的维护页面。
- **📊 实时访问日志**：中间件自动记录访客地理位置（国家/城市）、IP、User-Agent 等多维度数据，支持管理员后台实时审计。
- **🖼️ 个人中心与头像系统**：支持用户自定义头像上传（Base64 存储或对象存储对接），提供完善的个人信息与密码管理界面。
- **🌓 智能深色模式**：支持跟随系统自动切换或手动永久锁定，基于 CSS 变量实现的无闪烁主题切换。
- **🛡️ 极致安全**：
  - 密码采用 **PBKDF2 + SHA-256** 高强度哈希存储（100,000 次迭代）。
- **⏱️ 网站运行统计**：内置 Web Components 驱动的运行时长计数器及全站统计看板。

## 🛠️ 技术架构

- **前端**：原生 HTML5 / CSS3 / ES6+。
- **组件化**：自定义 Web Components (`blog-sidebar`, `blog-navbar-secondary`, `user-menu`, `runtime-display` 等)。
- **后端**：Cloudflare Pages Functions (V8 Worker 运行时)。
- **数据库**：Cloudflare D1 (基于 SQLite 的分布式数据库)。
- **安全**：Web Crypto API (哈希加密) + Cloudflare 中间件 (请求拦截)。

## 📁 核心文件结构

```text
.
├── index.html           # 门户首页
├── admin.html           # 管理中心 (受保护)
├── editor.html          # Markdown 编辑器
├── users.html           # 用户管理 (仅 SuperAdmin)
├── profile.html         # 个人设置中心
├── components.js        # Web Components 组件库核心
├── style.css            # 全局毛玻璃主题样式
├── functions/           # 边缘函数逻辑
│   ├── _middleware.js   # 全局拦截器 (权限、维护模式、日志)
│   └── api/
│       ├── admin/       # 后台 API (受身份验证保护)
│       ├── user/        # 用户相关 API
│       └── stats/       # 数据统计相关 API
└── schema.sql           # [推荐] 数据库初始化脚本
```

## 🗄️ 数据库设计 (基于实测推断)

### `users` 用户表
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | INTEGER | 主键 ID |
| `username` | TEXT | 唯一用户名 |
| `password_hash` | TEXT | PBKDF2 哈希值 |
| `salt` | TEXT | 16字节随机盐 |
| `role` | TEXT | `superadmin` / `admin` / `user` |
| `avatar` | TEXT | 头像 URL 或 Base64 |
| `is_active` | INTEGER | 是否启用 (1/0) |

### `posts` 文章表
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | INTEGER | 主键 ID |
| `slug` | TEXT | 唯一路径标识 |
| `title` | TEXT | 文章标题 |
| `content` | TEXT | Markdown 内容 |
| `is_published` | INTEGER | 发布状态 (1/0) |
| `author_id` | INTEGER | 关联用户 ID |

### `access_logs` 访问日志表
记录 `path`, `ip`, `country`, `city`, `user_agent`, `created_at` 等访客特征。

## 🚀 部署与配置

1. **D1 绑定**：在 Cloudflare Pages 设置中将 D1 数据库命名绑定为 `DB`。
2. **环境变量**：
   - `TURNSTILE_SECRET`：用于后端 API 校验验证码。
3. **前端配置**：
   - 在 `register.html` 中填入您的 Turnstile `Site Key`。
4. **初始化**：通过 Cloudflare 控制台或 Wrangler 执行 `schema.sql` 建立表结构。

---

<p align="center">
  由 <b>星辰空间站团队</b> 驱动 · 探索边缘计算的无限可能
</p>
