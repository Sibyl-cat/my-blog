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
    }
};

window.GameUtils = GameUtils;
