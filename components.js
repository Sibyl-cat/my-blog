// components.js - 独立的 Web Components 模块

// ========== 侧边栏组件 ==========
class BlogSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.initSidebar();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* 侧边栏样式 */
                .sidebar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 280px;
                    height: 100vh;
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(16px) saturate(180%);
                    -webkit-backdrop-filter: blur(16px) saturate(180%);
                    border-right: 1px solid rgba(251, 114, 153, 0.3);
                    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                    transform: translateX(-100%);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem 1rem;
                    color: #2a2a2a;
                }
                .sidebar.open {
                    transform: translateX(0);
                }
                .sidebar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(251, 114, 153, 0.3);
                }
                .sidebar-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #FB7299;
                }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #FB7299;
                    cursor: pointer;
                    transition: transform 0.2s;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .close-btn:hover {
                    background: rgba(251, 114, 153, 0.2);
                    transform: rotate(90deg);
                }
                .sidebar-menu {
                    list-style: none;
                    padding: 0;
                    flex: 1;
                }
                .sidebar-menu li {
                    margin-bottom: 0.5rem;
                }
                .sidebar-menu a {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0.8rem 1rem;
                    border-radius: 30px;
                    color: #2a2a2a;
                    text-decoration: none;
                    font-size: 1.1rem;
                    transition: all 0.25s;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid transparent;
                }
                .sidebar-menu a:hover {
                    background: rgba(251, 114, 153, 0.15);
                    border-color: rgba(251, 114, 153, 0.3);
                    transform: translateX(6px);
                    color: #FB7299;
                }
                .sidebar-menu i {
                    width: 24px;
                    color: #FB7299;
                    font-size: 1.2rem;
                }
                .sidebar-footer {
                    padding-top: 1rem;
                    border-top: 1px solid rgba(251, 114, 153, 0.3);
                    font-size: 0.9rem;
                    text-align: center;
                    color: #5a5a5a;
                }
                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(2px);
                    z-index: 999;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s, visibility 0.3s;
                }
                .overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                @media (max-width: 680px) {
                    .sidebar {
                        width: 240px;
                    }
                }
            </style>
            <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css">
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
                    <li><a href="./about.html"><i class="fas fa-code"></i> 关于</a></li>
                </ul>
                <div class="sidebar-footer">
                    <p>© 2026 星辰空间站</p>
                </div>
            </div>
            <div class="overlay" id="overlay"></div>
        `;
    }

    initSidebar() {
        const sidebar = this.shadowRoot.getElementById('sidebar');
        const overlay = this.shadowRoot.getElementById('overlay');
        const closeBtn = this.shadowRoot.getElementById('closeSidebar');

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

// ========== 二级页面精简导航栏 ==========
class BlogNavbarSecondary extends HTMLElement {
    connectedCallback() {
        this.style.display = 'block';
        this.innerHTML = `
        <nav class="navbar glass" style="justify-content: flex-start;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="logo" style="display: flex; align-items: center; gap: 12px;">
                    <i class="fab fa-bilibili" id="sidebarToggle" style="color: #FB7299; cursor: pointer; padding: 4px;" title="打开侧边栏"></i>
                    <a href="./index.html" style="text-decoration: none; color: inherit; cursor: pointer;" title="返回首页">
                        <span>星辰空间站</span>
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
    const toggle = e.target.closest('#sidebarToggle');
    if (toggle && typeof window.openSidebar === 'function') {
        window.openSidebar();
    }
});

// ========== 用户菜单组件（气泡个人主页） ==========
class UserMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.loadUserInfo();
        this.bindEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    position: relative;
                    margin-left: 1rem;
                    z-index: 1;
                }
                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid #FB7299;
                    position: relative;
                    z-index: 2;
                }
                .user-avatar i {
                    font-size: 1.5rem;
                    color: #FB7299;
                }
                .user-avatar:hover {
                    background: rgba(251,114,153,0.3);
                    transform: scale(1.05);
                }
                .user-bubble {
                    position: absolute;
                    top: 50px;
                    right: 0;
                    width: 280px;
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    border: 1px solid rgba(251,114,153,0.3);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    padding: 1rem;
                    z-index: 1001;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s ease;
                }
                .user-bubble.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                .user-bubble-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    border-bottom: 1px solid rgba(251,114,153,0.3);
                    padding-bottom: 0.8rem;
                    margin-bottom: 0.8rem;
                }
                .user-bubble-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: rgba(251,114,153,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #FB7299;
                }
                .user-bubble-avatar i {
                    font-size: 2.5rem;
                    color: #FB7299;
                }
                .user-bubble-info {
                    flex: 1;
                }
                .user-bubble-name {
                    font-weight: 600;
                    color: #2a2a2a;
                    font-size: 1.1rem;
                }
                .user-bubble-role {
                    font-size: 0.8rem;
                    color: #FB7299;
                }
                .user-bubble-menu {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .user-bubble-menu li {
                    margin: 0.5rem 0;
                }
                .user-bubble-menu a, .user-bubble-menu button {
                    display: block;
                    width: 100%;
                    text-align: left;
                    padding: 0.5rem 0.8rem;
                    border-radius: 30px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: #2a2a2a;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .user-bubble-menu a:hover, .user-bubble-menu button:hover {
                    background: rgba(251,114,153,0.1);
                    color: #FB7299;
                }
                .user-bubble-menu .divider {
                    height: 1px;
                    background: rgba(251,114,153,0.2);
                    margin: 0.5rem 0;
                }
                @media (max-width: 768px) {
                    .user-avatar {
                        width: 32px;
                        height: 32px;
                    }
                    .user-avatar i {
                        font-size: 1.2rem;
                    }
                    .user-bubble {
                        width: 240px;
                        right: -5px;
                        top: 48px;
                    }
                    .user-bubble-header {
                        gap: 0.5rem;
                    }
                    .user-bubble-avatar {
                        width: 48px;
                        height: 48px;
                    }
                    .user-bubble-avatar i {
                        font-size: 2rem;
                    }
                    .user-bubble-name {
                        font-size: 1rem;
                    }
                    .user-bubble-role {
                        font-size: 0.7rem;
                    }
                    .user-bubble-menu a, .user-bubble-menu button {
                        padding: 0.4rem 0.6rem;
                        font-size: 0.85rem;
                    }
                }
            </style>
            <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css">
            <div class="user-avatar" id="avatarTrigger">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-bubble" id="bubble"></div>
        `;
    }

    async loadUserInfo() {
        const bubble = this.shadowRoot.getElementById('bubble');
        const avatarElem = this.shadowRoot.getElementById('avatarTrigger');
        try {
            const res = await fetch('/api/user/me');
            if (res.ok) {
                const user = await res.json();
                let roleText = '';
                if (user.role === 'admin') roleText = '管理员';
                else if (user.role === 'superadmin') roleText = '超级管理员';
                else roleText = '普通用户';

                if (avatarElem) {
                    if (user.avatar) {
                        avatarElem.innerHTML = `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                    } else {
                        avatarElem.innerHTML = `<i class="fas fa-user-circle"></i>`;
                    }
                }

                bubble.innerHTML = `
                    <div class="user-bubble-header">
                        <div class="user-bubble-avatar">
                            ${user.avatar ? `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : '<i class="fas fa-user-circle"></i>'}
                        </div>
                        <div class="user-bubble-info">
                            <div class="user-bubble-name">${escapeHtml(user.username)}</div>
                            <div class="user-bubble-role">${roleText}</div>
                        </div>
                    </div>
                    <ul class="user-bubble-menu">
                        <li><a href="/profile.html"><i class="fas fa-user"></i> 个人主页</a></li>
                        <li><button id="uploadAvatarBtn"><i class="fas fa-camera"></i> 上传头像</button></li>
                        <li><a href="/change-password.html"><i class="fas fa-key"></i> 修改密码</a></li>
                        <li><a href="/admin.html"><i class="fas fa-cog"></i> 管理后台</a></li>
                        <li><div class="divider"></div></li>
                        <li><button id="bubbleLogoutBtn"><i class="fas fa-sign-out-alt"></i> 退出登录</button></li>
                    </ul>
                `;

                const uploadBtn = bubble.querySelector('#uploadAvatarBtn');
                if (uploadBtn) {
                    uploadBtn.addEventListener('click', () => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/jpeg,image/png,image/gif,image/webp';
                        fileInput.onchange = async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('avatar', file);
                            try {
                                const uploadRes = await fetch('/api/user/avatar', {
                                    method: 'POST',
                                    body: formData
                                });
                                const data = await uploadRes.json();
                                if (uploadRes.ok) {
                                    if (avatarElem) {
                                        avatarElem.innerHTML = `<img src="${data.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                                    }
                                    const bubbleAvatar = bubble.querySelector('.user-bubble-avatar');
                                    if (bubbleAvatar) {
                                        bubbleAvatar.innerHTML = `<img src="${data.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                                    }
                                    alert('头像上传成功');
                                } else {
                                    alert(data.error || '上传失败');
                                }
                            } catch (err) {
                                alert('网络错误');
                            }
                        };
                        fileInput.click();
                    });
                }
                const logoutBtn = bubble.querySelector('#bubbleLogoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const res = await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
                        if (res.ok) {
                            window.location.reload();
                        } else {
                            alert('退出失败');
                        }
                    });
                }
            } else {
                bubble.innerHTML = `
                    <div class="user-bubble-header">
                        <div class="user-bubble-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-bubble-info">
                            <div class="user-bubble-name">游客</div>
                        </div>
                    </div>
                    <ul class="user-bubble-menu">
                        <li><a href="/admin/login.html"><i class="fas fa-sign-in-alt"></i> 登录</a></li>
                        <li><a href="/register.html"><i class="fas fa-user-plus"></i> 注册</a></li>
                    </ul>
                `;
            }
        } catch (err) {
            console.error('加载用户信息失败', err);
            bubble.innerHTML = `
                <div class="user-bubble-header">
                    <div class="user-bubble-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-bubble-info">
                        <div class="user-bubble-name">未登录</div>
                    </div>
                </div>
                <ul class="user-bubble-menu">
                    <li><a href="/admin/login.html"><i class="fas fa-sign-in-alt"></i> 登录</a></li>
                    <li><a href="/register.html"><i class="fas fa-user-plus"></i> 注册</a></li>
                </ul>
            `;
        }
    }

    bindEvents() {
        const avatarTrigger = this.shadowRoot.getElementById('avatarTrigger');
        const bubble = this.shadowRoot.getElementById('bubble');

        const showBubble = () => bubble.classList.add('show');
        const hideBubble = () => bubble.classList.remove('show');

        avatarTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bubble.classList.contains('show')) {
                hideBubble();
            } else {
                showBubble();
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                hideBubble();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && bubble.classList.contains('show')) {
                hideBubble();
            }
        });
    }
}
customElements.define('user-menu', UserMenu);

// 辅助函数：防止 XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== 网站运行时长组件 ==========
class RuntimeDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.startTime = new Date(2026, 1, 25, 9, 7, 0);
        this.timer = null;
    }

    connectedCallback() {
        this.render();
        this.startTimer();
    }

    disconnectedCallback() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    font-size: 0.9rem;
                    color: #333;
                }
                .runtime {
                    white-space: nowrap;
                }
                .pink-number {
                    color: #FB7299;
                    font-weight: 500;
                }
            </style>
            <span class="runtime" id="runtime">加载中...</span>
        `;
    }

    startTimer() {
        const update = () => {
            const runtimeSpan = this.shadowRoot.getElementById('runtime');
            if (!runtimeSpan) return;

            const now = new Date();
            const diff = now - this.startTime;
            if (diff < 0) {
                runtimeSpan.textContent = '即将上线';
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const html = `
                <span class="pink-number">${days}</span><span style="color: #333;">天</span>
                <span class="pink-number">${hours}</span><span style="color: #333;">小时</span>
                <span class="pink-number">${minutes}</span><span style="color: #333;">分</span>
                <span class="pink-number">${seconds}</span><span style="color: #333;">秒</span>
            `;
            runtimeSpan.innerHTML = html;
        };
        update();
        this.timer = setInterval(update, 1000);
    }
}
customElements.define('runtime-display', RuntimeDisplay);

// ========== 页脚组件 ==========
class BlogFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.6rem 2.5rem;
                    border-radius: 60px;
                    background: rgba(255, 255, 255, 0.18);
                    backdrop-filter: blur(12px);
                    margin-top: 1rem;
                    border: 1px solid rgba(255,255,255,0.4);
                    animation: fadeUp 0.8s 0.3s both;
                }
                @keyframes fadeUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .copyright {
                    color: #3d3d3d;
                    font-size: 1.1rem;
                }
                .copyright i {
                    color: #FB7299;
                    margin: 0 4px;
                }
                .runtime {
                    color: #3d3d3d;
                    font-size: 1rem;
                }
                @media (max-width: 680px) {
                    .footer {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }
            </style>
            <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css">
            <footer class="footer">
                <div class="copyright">
                    <i class="fas fa-copyright"></i> 2026 星辰空间站 · 星辰大海
                    <i class="fas fa-heart" style="color: #FB7299;"></i>
                </div>
                <div class="runtime">
                    网站已运行 <runtime-display></runtime-display>
                </div>
            </footer>
        `;
    }
}
customElements.define('blog-footer', BlogFooter);

// ========== 夜间模式切换组件 ==========
class NightModeToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.init();
        this.bindEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    margin-left: 0.5rem;
                }
                .toggle-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    color: #FB7299;
                    background: rgba(255,255,255,0.2);
                }
                .toggle-btn:hover {
                    background: rgba(251,114,153,0.3);
                    transform: scale(1.05);
                }
            </style>
            <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css">
            <button class="toggle-btn" id="nightModeBtn">
                <i class="fas fa-moon"></i>
            </button>
        `;
    }

    init() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
            this.setIcon('moon');
        } else {
            this.setIcon('sun');
        }
    }

    bindEvents() {
        const btn = this.shadowRoot.getElementById('nightModeBtn');
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            this.setIcon(isDark ? 'moon' : 'sun');
        });
    }

    setIcon(icon) {
        const btn = this.shadowRoot.getElementById('nightModeBtn');
        if (!btn) return;
        btn.innerHTML = `<i class="fas fa-${icon === 'moon' ? 'moon' : 'sun'}"></i>`;
    }
}
customElements.define('night-mode-toggle', NightModeToggle);


// ========== 主页导航栏组件（无悬浮条） ==========
class BlogNavbarHome extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.initEvents();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* 导航栏样式 */
                .navbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.8rem 2rem;
                    margin: 0 auto 2rem auto;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(12px);
                    border-radius: 60px;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    transition: all 0.3s ease;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    width: auto;
                    max-width: 90%;
                }
                .navbar-scrolled {
                    padding: 0.5rem 2rem;
                    background: rgba(255, 255, 255, 0.3);
                    backdrop-filter: blur(16px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                }
                .navbar-brand .logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.7rem;
                    font-weight: 700;
                    color: #FB7299;
                    text-decoration: none;
                    text-shadow: 2px 2px 6px rgba(255, 255, 255, 0.7);
                }
                .navbar-brand .logo i {
                    font-size: 2rem;
                    color: #FB7299;
                    filter: drop-shadow(0 2px 4px rgba(251, 114, 153, 0.4));
                }
                .navbar-links {
                    display: flex;
                    gap: 2rem;
                }
                .navbar-links a {
                    text-decoration: none;
                    color: #2e2e2e;
                    font-weight: 500;
                    font-size: 1.1rem;
                    padding: 0.5rem 0;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .navbar-links a i {
                    color: #FB7299;
                    margin-right: 0.3rem;
                }
                .navbar-links a:hover {
                    color: #FB7299;
                    border-bottom-color: #FB7299;
                }
                .navbar-tools {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                @media (max-width: 768px) {
                    .navbar {
                        padding: 0.6rem 1rem;
                    }
                    .navbar-links {
                        display: none;
                    }
                    .navbar-tools {
                        gap: 0.5rem;
                    }
                }
            </style>
            <link rel="stylesheet" href="/assets/fontawesome/css/all.min.css">
            <nav class="navbar" id="mainNavbar">
                <div class="navbar-brand">
                    <a href="./index.html" class="logo">
                        <i class="fab fa-bilibili" id="sidebarToggle" style="color: #FB7299; cursor: pointer; padding: 4px;" title="打开侧边栏"></i>
                        <span>星辰空间站</span>
                    </a>
                </div>
                <div class="navbar-links">
                    <a href="authors.html"><i class="fas fa-users"></i> 作者</a>
                    <a href="register.html"><i class="fas fa-user-plus"></i> 注册</a>
                    <a href="tags.html"><i class="fas fa-magnifying-glass"></i> 搜索</a>
                </div>
                <div class="navbar-tools">
                    <user-menu></user-menu>
                    <night-mode-toggle></night-mode-toggle>
                </div>
            </nav>
        `;
    }

    initEvents() {
        this.navbar = this.shadowRoot.getElementById('mainNavbar');
        // 滚动时添加背景加深效果（可选）
        window.addEventListener('scroll', () => {
            if (!this.navbar) return;
            if (window.scrollY > 50) {
                this.navbar.classList.add('navbar-scrolled');
            } else {
                this.navbar.classList.remove('navbar-scrolled');
            }
        });
        // 确保侧边栏触发正常
        const sidebarToggle = this.shadowRoot.querySelector('#sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof window.openSidebar === 'function') {
                    window.openSidebar();
                }
            });
        }
    }
}
customElements.define('blog-navbar-home', BlogNavbarHome);
