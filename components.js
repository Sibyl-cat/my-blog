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
                <li><a href="./about.html"><i class="fas fa-code"></i> 关于</a></li>
            </ul>
            <div class="sidebar-footer">
                <p>© 2026 星辰空间站</p>
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
    // 只要点到了 id 为 sidebarToggle 的元素或是其子元素
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
                    top: 50px;           /* 根据头像高度微调 */
                    right: 0;
                    width: 280px;
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    border: 1px solid rgba(251,114,153,0.3);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    padding: 1rem;
                    z-index: 1001;       /* 确保高于侧边栏（1000） */
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
               /* 移动端适配 */
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

            // 更新头像显示
            if (avatarElem) {
                if (user.avatar) {
                    avatarElem.innerHTML = `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                } else {
                    avatarElem.innerHTML = `<i class="fas fa-user-circle"></i>`;
                }
            }

            // 气泡内容
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
                    <li><a href="/admin.html"><i class="fas fa-cog"></i> 管理后台</a></li>
                    <li><div class="divider"></div></li>
                    <li><button id="bubbleLogoutBtn"><i class="fas fa-sign-out-alt"></i> 退出登录</button></li>
                </ul>
            `;

            // 绑定上传头像事件
            const uploadBtn = bubble.querySelector('#uploadAvatarBtn');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => {
                    // 创建隐藏文件输入框
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
                                // 更新头像显示
                                if (avatarElem) {
                                    avatarElem.innerHTML = `<img src="${data.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                                }
                                // 更新气泡内头像
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
                // 未登录状态
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

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                hideBubble();
            }
        });

        // ESC 键关闭
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
        // 首次部署时间：2026年2月25日 9:07 AM
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
            // 每次更新时重新获取元素，防止元素被意外移除
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

            // 构建带颜色分隔的HTML
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
