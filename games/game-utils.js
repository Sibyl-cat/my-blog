/**
 * Starry Arcade Game Utilities
 * Handles high scores, mobile detection, and shared UI helpers.
 */

const GameUtils = {
    /**
     * Get the highest score for a specific game
     * @param {string} gameId Unique ID for the game (e.g., 'star2048')
     * @returns {number} The high score
     */
    getHighScore: function(gameId) {
        const scores = JSON.parse(localStorage.getItem('starry_arcade_scores') || '{}');
        return scores[gameId] || 0;
    },

    /**
     * Save a new score and update high score if necessary
     * @param {string} gameId Unique ID for the game
     * @param {number} score The score to save
     * @returns {boolean} True if a new high score was set
     */
    saveScore: function(gameId, score) {
        const scores = JSON.parse(localStorage.getItem('starry_arcade_scores') || '{}');
        const currentHigh = scores[gameId] || 0;
        if (score > currentHigh) {
            scores[gameId] = score;
            localStorage.setItem('starry_arcade_scores', JSON.stringify(scores));
            return true;
        }
        return false;
    },

    /**
     * Detect if the user is on a mobile device
     */
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Simple swipe detection for mobile
     * @param {HTMLElement} element The element to attach listeners to
     * @param {Function} callback Function(direction) where direction is 'up', 'down', 'left', 'right'
     */
    initSwipe: function(element, callback) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        element.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        element.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleGesture();
        }, { passive: true });

        function handleGesture() {
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) > 30) { // Threshold
                if (absDx > absDy) {
                    callback(dx > 0 ? 'right' : 'left');
                } else {
                    callback(dy > 0 ? 'down' : 'up');
                }
            }
        }
    },

    /**
     * Create a simple toast message
     */
    showToast: function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `game-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Add styles if not present
        if (!document.getElementById('game-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'game-toast-styles';
            style.textContent = `
                .game-toast {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 50px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    z-index: 1000;
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    font-weight: 600;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .game-toast.show { transform: translateX(-50%) translateY(0); }
                .game-toast.success { border-color: #00f2ff; color: #00f2ff; }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    // 移动端支持检测与拦截
    checkMobileSupport: function(gameName, desktopOnly = false) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        if (isMobile && desktopOnly) {
            this.showMobileBlocker(gameName);
            return false;
        }
        return true;
    },

    showMobileBlocker: function(gameName) {
        const blocker = document.createElement('div');
        blocker.id = 'mobile-blocker';
        blocker.style.cssText = `
            position: fixed;
            inset: 0;
            background: #050510;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
            color: white;
            font-family: 'Outfit', sans-serif;
        `;

        blocker.innerHTML = `
            <div style="font-size: 5rem; color: #ff4757; margin-bottom: 2rem;">
                <i class="fas fa-desktop"></i>
            </div>
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">建议在电脑端游玩</h2>
            <p style="opacity: 0.7; line-height: 1.6; max-width: 400px; margin-bottom: 2rem;">
                《${gameName}》包含复杂的精细操作，在小屏触控设备上体验较差。为了保证你的游戏体验，请切换至桌面浏览器开启挑战。
            </p>
            <a href="index.html" style="
                padding: 1rem 2.5rem;
                background: rgba(255,255,255,0.1);
                color: white;
                text-decoration: none;
                border-radius: 50px;
                border: 1px solid rgba(255,255,255,0.2);
                transition: 0.3s;
            ">返回游艺场</a>
        `;

        document.body.appendChild(blocker);
    }
};

window.GameUtils = GameUtils;
