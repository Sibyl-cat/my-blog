# 小电视の日常 · 粉系毛玻璃博客

一个功能完整的个人博客系统，基于 Cloudflare Pages + D1 数据库构建，支持多作者、Markdown 渲染、用户管理、文章管理等功能。界面采用哔哩哔哩主题色 (#FB7299) 搭配毛玻璃效果，适配移动端。

## ✨ 功能特性

- **多用户支持**：普通用户（user）和管理员（admin）角色分离，各自管理自己的文章
- **文章管理**：新建、编辑、删除文章，支持 Markdown 上传与渲染
- **用户管理**：管理员可查看、修改密码、删除用户（普通用户无权限）
- **注册与登录**：注册页面集成 Cloudflare Turnstile 验证码，防止恶意注册
- **作者归档**：按作者查看文章列表
- **毛玻璃 UI**：统一的设计语言，响应式适配手机端
- **动态内容**：所有文章、用户数据由 Cloudflare D1 数据库驱动

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript (原生)
- **图标库**：Font Awesome 6
- **Markdown 渲染**：[marked](https://cdn.jsdelivr.net/npm/marked/marked.min.js)
- **后端**：Cloudflare Pages Functions (Node.js 环境)
- **数据库**：Cloudflare D1 (SQLite)
- **部署**：Cloudflare Pages (Git 集成)

## 📁 文件结构详解

项目根目录下的主要文件及文件夹说明：
```
├── index.html               # 博客首页，动态加载所有文章卡片
├── post.html                # 文章详情页，使用 marked 渲染 Markdown
├── authors.html             # 作者列表页，显示所有注册作者
├── author.html              # 单个作者的文章列表页
├── tags.html                # 标签云页面，显示按人气排序的标签
├── tag.html                 # 标签分类页，显示特定标签下的文章
├── admin.html               # 管理后台首页（仅 admin 可访问）
├── users.html               # 用户管理页面（仅 admin 可访问）
├── register.html            # 公开注册页面，包含 Turnstile 验证码
├── admin/                   # 存放受保护的管理页面
│   └── login.html           # 管理员登录页
├── functions/               # Cloudflare Pages Functions 目录
│   ├── api/                 # 公开 API 路由
│   │   ├── posts.js         # 获取所有文章（首页用）
│   │   ├── post/            # 单篇文章相关
│   │   │   └── [slug].js    # 根据 slug 获取单篇文章
│   │   ├── authors.js       # 获取所有作者列表
│   │   ├── author/          # 单个作者相关
│   │   │   └── [username].js # 根据用户名获取该作者所有文章
│   │   ├── register.js      # 用户注册（包含 Turnstile 验证）
│   │   ├── user/            # 用户信息
│   │   │   └── me.js        # 获取当前登录用户信息
│   │   ├── login.js         # 登录 API（验证密码，创建会话）
│   │   ├── logout.js        # 注销 API（删除会话）
│   │   └── utils/           # 工具函数
│   │       ├── auth.js      # 密码哈希、验证、获取当前用户 ID
│   │       ├── generateSlug.js # 生成文章 slug (post1, post2...)
│   │       └── slugify.js   # 将标题转换为 slug 字符串
│   └── admin/               # 受保护的管理 API（需登录）
│       ├── _middleware.js   # 中间件：检查登录状态及角色权限
│       ├── posts.js         # 获取当前用户自己的文章列表
│       ├── post.js          # 新增/更新文章（自动生成 slug，检查权限）
│       ├── post/            # 文章相关操作
│       │   └── delete.js    # 删除文章（检查权限）
│       ├── users.js         # 获取所有用户列表（仅 admin）
│       └── user/            # 用户管理操作
│           ├── add.js       # 新增用户（仅 admin，但注册页已独立）
│           ├── update.js    # 修改用户密码（仅 admin）
│           └── delete.js    # 删除用户（仅 admin，禁止删除自己）
├── style.css                # 全局样式（毛玻璃、响应式、主色调）
├── components.js            # 独立的 Web Components 模块（侧边栏、精简导航栏）
├── schema.sql               # 数据库建表语句（users, sessions, posts）
└── README.md                # 本文档
```

## 🗄️ 数据库设计

数据库使用 Cloudflare D1，包含三张表：

### `users` 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY | 用户 ID |
| username | TEXT UNIQUE | 用户名 |
| password_hash | TEXT | PBKDF2 哈希值 |
| salt | TEXT | 随机盐 |
| role | TEXT | 'admin' 或 'user'，默认 'user' |
| created_at | DATETIME | 注册时间 |

### `sessions` 会话表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | 随机会话 ID |
| user_id | INTEGER | 关联 users.id |
| role | TEXT | 冗余用户角色，方便中间件快速判断 |
| expires_at | DATETIME | 会话过期时间 |

### `posts` 文章表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY | 文章 ID |
| slug | TEXT UNIQUE | 文章标识（如 post1） |
| title | TEXT | 标题 |
| content | TEXT | 正文（Markdown 格式） |
| excerpt | TEXT | 摘要 |
| tags | TEXT | 逗号分隔的标签 |
| author_id | INTEGER | 关联 users.id |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 最后更新时间（自动更新） |

## 🔧 部署指南

### 前提条件
- 拥有 [Cloudflare 账号](https://dash.cloudflare.com/)
- 项目代码已托管至 GitHub（或其他 Git 仓库）

### 步骤

1. **创建 D1 数据库**
   - 在 Cloudflare 控制台进入 **Workers & Pages** → **D1** → **创建数据库**，命名为 `my-blog-db`
   - 记录数据库 ID

2. **导入表结构**
   - 进入数据库控制台，执行 `schema.sql` 中的 SQL 语句
   - 手动插入一个管理员账号（需使用工具生成盐和哈希，或通过注册页面注册后手动修改 role）

3. **创建 Pages 项目**
   - 在 Cloudflare Pages 中点击 **创建项目** → **连接到 Git** → 选择本仓库
   - 构建设置：框架预设选择“无”，构建命令留空，输出目录填当前目录 `.`
   - 点击 **保存并部署**

4. **绑定 D1 数据库**
   - 在项目详情页 → **设置** → **绑定** → **添加绑定**
   - 变量名称填 `DB`，选择刚刚创建的 D1 数据库

5. **配置环境变量**
   - 在项目 **设置** → **环境变量** 中添加：
     - `TURNSTILE_SECRET`：从 Cloudflare Turnstile 获取的秘密密钥（用于注册页验证）

6. **配置 Turnstile**
   - 在 Cloudflare 控制台进入 **Turnstile** → **添加站点**
   - 域名填写您的 Pages 域名（如 `xxx.pages.dev` 或自定义域名）
   - 获取站点密钥，填入 `register.html` 的 `data-sitekey` 中

7. **重新部署**
   - 以上配置完成后，手动触发一次部署或推送代码更新

## 🔐 权限说明

- **未登录用户**：可访问首页、文章详情、作者页、注册页
- **普通用户 (role='user')**：登录后可管理自己的文章（`admin.html` 对其不可见，中间件会重定向到首页）
- **管理员 (role='admin')**：可访问所有管理页面（`admin.html`, `users.html`），管理所有文章和用户

## 📝 使用说明

- **注册**：访问 `/register.html` 填写信息，完成 Turnstile 验证后提交
- **登录**：访问 `/admin/login.html` 输入用户名密码
- **管理文章**：登录后访问 `/admin.html` 可新建/编辑/删除文章（仅自己或管理员）
- **管理用户**：管理员访问 `/users.html` 可查看所有用户、修改密码、删除用户
- **按作者浏览**：访问 `/authors.html` 点击作者进入该作者的文章列表

## 🤝 贡献

欢迎通过 Issue 或 Pull Request 提出改进建议。

## 📄 许可证

MIT License © 2025 小电视の日常