// SalonEase Toast Notification System
class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease-in-out;
            min-width: 250px;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                ${this.getIcon(type)}
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            this.dismissToast(toast);
        }, 3000);
    }

    getIcon(type) {
        if (type === 'success') {
            return '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 010-1.414 1.414l-5-5a1 1 0 010-1.414 1.414L10 11.586l-5 5a1 1 0 010-1.414 1.414L8.586 11l5-5z"/></svg>';
        } else if (type === 'error') {
            return '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 0116 8zm0-14a6 6 0 100-12 6 6 0 0112 6zm0-10a4 4 0 100-8 4 4 0 018 4z"/></svg>';
        }
        return '';
    }

    dismissToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global instance
const toastManager = new ToastManager();

// Global helper functions
function showToast(message, type = 'success') {
    toastManager.showToast(message, type);
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showWarning(message) {
    showToast(message, 'warning');
}

function showInfo(message) {
    showToast(message, 'info');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showToast, showSuccess, showError, showWarning, showInfo };
}