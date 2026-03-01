<div align="center">
<picture>
  <source media="(prefers-color-scheme: light)" srcset="/images/avatar.jpg">
  <img alt="avatar" src="/images/avatar.jpg" width="50%" height="50%">
</picture>
</div>
<p align="center">小电视の日常 · 粉系毛玻璃博客。</p>

---

一个部署在 Cloudflare Pages 上的个人博客，采用 $\color{#FB7299}{哔哩哔哩主题色}$  搭配毛玻璃效果，动效流畅，支持文章详情页和 B站主页跳转。
本项目是完全静态的 HTML/CSS/JS 实现，可轻松扩展为动态博客（结合 Cloudflare D1 / KV）。

## ✨ 功能特点

- **🎨 哔哩哔哩主题色**：主色调 $\color{#FB7299}{\blacksquare}$ 贯穿始终，搭配柔和的渐变背景。
- **🥛 毛玻璃设计**：导航、卡片、页脚均采用 backdrop-filter 模糊，质感通透。
- **📱 响应式布局**：完美适配手机、平板和桌面端。
- **✨ 流畅动效**：卡片加载动画、悬停放大、图标旋转等微交互。
- **🔗 文章详情页**：每篇文章独立页面，支持从首页卡片点击进入。
- **🌐 一键部署**：可快速部署到 Cloudflare Pages，并绑定自定义域名。

## 🧱 技术栈

- **HTML5**：页面结构。
- **CSS3**：Flex/Grid 布局、毛玻璃效果、动画、响应式设计。
- **Font Awesome 6**：图标库（免费版）。
- **Cloudflare Pages**：托管与部署。
- **Cloudflare D1/KV**：用于扩展为动态博客（、阅读量等）。

## 📁 项目结构

```
my-blog/
├── index.html               # 博客首页（文章列表）
├── style.css                 # 全局样式（从 index.html 提取）
├── images/                   # 存放图片资源
│   └── avatar.jpg            # 个人头像（示例）
├── post1.html                # 文章详情页1
├── post2.html                # 文章详情页2
├── post3.html                # 文章详情页3
├── ...                        # 其他文章页
└── README.md                  # 本文档
```
<p align="center"><em>
说明：如果您有更多文章，只需按 postX.html 的模板继续创建即可。
</em></p>

---

## ☁️ 部署到 Cloudflare Pages

将本项目部署到Cloudflare有许多种方法。
### 方法一：通过 Git 自动部署

1. 将本项目推送到您的 GitHub/GitLab 仓库。
2. 登录 Cloudflare 控制台 → Workers & Pages → 创建应用程序 → Pages → 连接到 Git。
3. 选择仓库，设置如下：
   - 项目名称：自定义
   - 生产分支：main
   - 框架预设：无
   - 构建命令：exit 0（或留空）
   - 构建输出目录：.（根目录）
4. 点击保存并部署，稍等片刻即可访问 https://<项目名>.pages.dev。

### 方法二：直接上传

1. 在 Cloudflare Pages 中创建项目，选择“直接上传”。
2. 将本地 my-blog 文件夹拖拽到上传区域。
3. 点击部署，获得预览链接。
4. 绑定自定义域名：在项目详情页 → 自定义域 → 设置自定义域，输入您的域名并按提示添加 CNAME 记录即可（DNS 托管在 Cloudflare 时可自动完成）。

---

## 🔌 扩展为动态博客（可选）

如果您希望添加评论、阅读量统计等动态功能，可以结合 Cloudflare D1（关系型数据库）和 Pages Functions 实现。

示例：添加阅读量

1. 在 D1 中创建表 page_views。
2. 创建 /functions/api/views.js 处理计数逻辑。
3. 在文章页调用 fetch('/api/views?id=post1') 显示阅读数。

详细文档可参考 Cloudflare D1 文档 和 Pages Functions 文档。

---

## 🎨 自定义样式

所有样式集中在 style.css 中，您可以轻松修改：

- 主题色：搜索 #FB7299 替换为您喜欢的颜色。
- 毛玻璃透明度：调整 background: rgba(255,255,255,0.2) 中的 0.2 值。
- 动画时长：修改 transition 和 animation 中的时间参数。

---

## 📝 文章模板

新建文章页时，复制以下模板并修改内容：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>>🌼标签页的题目</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="blog-container">
    <!-- 导航栏 (与 index.html 相同) -->
    <nav class="navbar glass" style="background: rgba(255,255,240,0.2);">
      <div class="logo">
        <i class="fab fa-bilibili"></i>
        <span>小电视の日常</span>
      </div>
    </nav>

    <!-- 文章详情 -->
    <div class="profile-card glass" style="flex-direction: column; align-items: flex-start;">
        <h1 style="font-size: 2.5rem; color: #FB7299; margin-bottom: 0.5rem;">这里是文章标题</h1>
        <div class="card-meta" style="margin: 1rem 0; width: 100%;">
            <span><i class="far fa-calendar"></i> 这里是日期</span>
            <span><i class="far fa-clock"></i> 这里是时间(假的)</span>
            <span><i class="fas fa-tag"></i> 这里是标签</span>
        </div>
        <div class="post-content" style="font-size: 1.2rem; line-height: 1.8; color: #2a2a2a;">
            <p>文章梗概</p>
            <h2 style="color: #FB7299; margin: 1.5rem 0 0.5rem;">1. 小标题一</h2>
            <p>文本1</p>
            <h2 style="color: #FB7299; margin: 1.5rem 0 0.5rem;">2. 小标题二</h2>
            <p>文本2</p>
            <h2 style="color: #FB7299; margin: 1.5rem 0 0.5rem;">3. 小标题三</h2>
            <p>文本3</p>
            <p>更多细节可以看我的其他文章，或者直接查看 <a href="https://developers.cloudflare.com/pages/" target="_blank" style="color: #FB7299;">Cloudflare Pages 官方文档</a>。</p>
        </div>
        <a href="index.html" class="load-more" style="margin: 2rem 0; align-self: center;">← 返回首页</a>
    </div>

    <!-- 页脚 (与 index.html 相同) -->
    <footer class="footer glass">
        <div class="copyright">
            <i class="fas fa-copyright"></i> 2025 小电视の日常 · 粉系毛玻璃博客
            <i class="fas fa-heart" style="color: #FB7299;"></i>
        </div>
    </footer>
</div>
</body>
</html>
```

---

## 🤝 贡献

如果您有任何改进建议，欢迎提交 Issue 或 Pull Request。

---

## 📄 许可证

本项目采用 MIT 许可证，您可以自由使用、修改和分发。

---

祝您使用愉快！
如果您在部署或自定义过程中遇到问题，欢迎随时提问。