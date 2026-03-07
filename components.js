// components.js - 独立的 Web Components 模块

class BlogSidebar extends HTMLElement {
    connectedCallback() {
        this.style.display = 'block';
        this.innerHTML = `
        <!-- 侧边栏 (毛玻璃) -->
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <span class="sidebar-title">导航</span>
                <button class="close-btn" id="closeSidebar"><i class="fas fa-times"></i></button>
            </div>
            <ul class="sidebar-menu">
                <li><a href="./index.html"><i class="fas fa-house"></i> 首页</a></li>
                <li><a href="./authors.html"><i class="fas fa-users"></i> 作者</a></li>
                <li><a href="./register.html"><i class="fas fa-user-plus"></i> 注册</a></li>
                <li><a href="./tags.html"><i class="fas fa-magnifying-glass"></i> 搜索</a></li>
                <li><a href="./admin.html"><i class="fa-solid fa-blog"></i> 管理</a></li>
            </ul>
            <div class="sidebar-footer">
                <p>© 2025 小电视の日常</p>
            </div>
        </div>
        <!-- 遮罩层 -->
        <div class="overlay" id="overlay"></div>
        `;

        const sidebar = this.querySelector('#sidebar');
        const overlay = this.querySelector('#overlay');
        const closeBtn = this.querySelector('#closeSidebar');

        if (!sidebar || !overlay || !closeBtn) return;

        // 全局挂载开关方法
        window.openSidebar = () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        window.closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', window.closeSidebar);
        overlay.addEventListener('click', window.closeSidebar);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                window.closeSidebar();
            }
        });
    }
}
customElements.define('blog-sidebar', BlogSidebar);

class BlogNavbarSecondary extends HTMLElement {
    connectedCallback() {
        this.style.display = 'block';
        this.innerHTML = `
        <!-- 二级页面专用精简导航栏 -->
        <nav class="navbar glass" style="justify-content: flex-start;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="logo" style="display: flex; align-items: center; gap: 12px;">
                    <i class="fab fa-bilibili" id="sidebarToggle" style="color: #FB7299; cursor: pointer; padding: 4px;" title="打开侧边栏"></i>
                    <a href="./index.html" style="text-decoration: none; color: inherit; cursor: pointer;" title="返回首页">
                        <span>小电视の日常</span>
                    </a>
                </div>
            </div>
        </nav>
        `;
    }
}
customElements.define('blog-navbar-secondary', BlogNavbarSecondary);

// 全局事件代理处理侧边栏唤出
document.addEventListener('click', (e) => {
    // 只要点到了 id 为 sidebarToggle 的元素或是其子元素
    const toggle = e.target.closest('#sidebarToggle');
    if (toggle && typeof window.openSidebar === 'function') {
        window.openSidebar();
    }
});
