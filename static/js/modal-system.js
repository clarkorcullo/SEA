/**
 * Professional Modal System for Social Engineering Awareness Program
 * Replaces browser alerts and confirms with branded, user-friendly modals
 */

class ModalSystem {
    constructor() {
        this.modals = new Map();
        this.init();
    }

    init() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('modal-container')) {
            this.createModalContainer();
        }
    }

    createModalContainer() {
        const container = document.createElement('div');
        container.id = 'modal-container';
        container.innerHTML = `
            <div id="modal-overlay" class="modal-overlay" style="display: none;">
                <div class="modal-wrapper">
                    <div class="modal-content" id="modal-content">
                        <!-- Modal content will be inserted here -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }

            .modal-wrapper {
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease-out;
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                position: relative;
            }

            .modal-header {
                padding: 24px 24px 16px;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .modal-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: white;
            }

            .modal-icon.success {
                background: linear-gradient(135deg, #28a745, #20c997);
            }

            .modal-icon.warning {
                background: linear-gradient(135deg, #ffc107, #fd7e14);
            }

            .modal-icon.error {
                background: linear-gradient(135deg, #dc3545, #e74c3c);
            }

            .modal-icon.info {
                background: linear-gradient(135deg, #17a2b8, #6f42c1);
            }

            .modal-title {
                font-size: 20px;
                font-weight: 600;
                color: #2c3e50;
                margin: 0;
            }

            .modal-body {
                padding: 16px 24px 24px;
                color: #495057;
                line-height: 1.6;
            }

            .modal-footer {
                padding: 16px 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .modal-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                min-width: 80px;
            }

            .modal-btn-primary {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
            }

            .modal-btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }

            .modal-btn-secondary {
                background: #6c757d;
                color: white;
            }

            .modal-btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-1px);
            }

            .modal-btn-danger {
                background: linear-gradient(135deg, #dc3545, #c82333);
                color: white;
            }

            .modal-btn-danger:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
            }

            .modal-btn-success {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
            }

            .modal-btn-success:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            }

            .modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                font-size: 24px;
                color: #6c757d;
                cursor: pointer;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .modal-close:hover {
                background: #f8f9fa;
                color: #495057;
            }

            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 8px;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Responsive design */
            @media (max-width: 576px) {
                .modal-wrapper {
                    width: 95%;
                    margin: 20px;
                }
                
                .modal-header {
                    padding: 20px 20px 12px;
                }
                
                .modal-body {
                    padding: 12px 20px 20px;
                }
                
                .modal-footer {
                    padding: 12px 20px 20px;
                    flex-direction: column;
                }
                
                .modal-btn {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Success modal
    success(title, message, options = {}) {
        return this.showModal({
            type: 'success',
            title: title,
            message: message,
            icon: 'fas fa-check-circle',
            buttons: [
                {
                    text: options.confirmText || 'OK',
                    class: 'modal-btn modal-btn-success',
                    action: options.onConfirm || (() => this.close())
                }
            ]
        });
    }

    // Error modal
    error(title, message, options = {}) {
        return this.showModal({
            type: 'error',
            title: title,
            message: message,
            icon: 'fas fa-exclamation-triangle',
            buttons: [
                {
                    text: options.confirmText || 'OK',
                    class: 'modal-btn modal-btn-danger',
                    action: options.onConfirm || (() => this.close())
                }
            ]
        });
    }

    // Warning modal
    warning(title, message, options = {}) {
        return this.showModal({
            type: 'warning',
            title: title,
            message: message,
            icon: 'fas fa-exclamation-circle',
            buttons: [
                {
                    text: options.confirmText || 'OK',
                    class: 'modal-btn modal-btn-warning',
                    action: options.onConfirm || (() => this.close())
                }
            ]
        });
    }

    // Info modal
    info(title, message, options = {}) {
        return this.showModal({
            type: 'info',
            title: title,
            message: message,
            icon: 'fas fa-info-circle',
            buttons: [
                {
                    text: options.confirmText || 'OK',
                    class: 'modal-btn modal-btn-primary',
                    action: options.onConfirm || (() => this.close())
                }
            ]
        });
    }

    // Confirmation modal
    confirm(title, message, options = {}) {
        return new Promise((resolve) => {
            this.showModal({
                type: 'warning',
                title: title,
                message: message,
                icon: 'fas fa-question-circle',
                buttons: [
                    {
                        text: options.cancelText || 'Cancel',
                        class: 'modal-btn modal-btn-secondary',
                        action: () => {
                            this.close();
                            resolve(false);
                        }
                    },
                    {
                        text: options.confirmText || 'Confirm',
                        class: 'modal-btn modal-btn-danger',
                        action: () => {
                            this.close();
                            resolve(true);
                        }
                    }
                ]
            });
        });
    }

    // Loading modal
    loading(title, message = 'Please wait...') {
        return this.showModal({
            type: 'info',
            title: title,
            message: message,
            icon: 'fas fa-spinner fa-spin',
            buttons: [],
            closable: false
        });
    }

    // Custom modal
    showModal(config) {
        const modalId = 'modal-' + Date.now();
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');

        const modalHTML = `
            <div class="modal-header">
                <div class="modal-icon ${config.type}">
                    <i class="${config.icon}"></i>
                </div>
                <h3 class="modal-title">${config.title}</h3>
                ${config.closable !== false ? '<button class="modal-close" onclick="modalSystem.close()">&times;</button>' : ''}
            </div>
            <div class="modal-body">
                ${config.message}
            </div>
            ${config.buttons && config.buttons.length > 0 ? `
                <div class="modal-footer">
                    ${config.buttons.map(btn => `
                        <button class="${btn.class}" onclick="modalSystem.handleButtonClick('${modalId}', '${btn.text}')">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        content.innerHTML = modalHTML;
        overlay.style.display = 'flex';

        // Store modal configuration
        this.modals.set(modalId, {
            config: config,
            overlay: overlay,
            content: content
        });

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && config.closable !== false) {
                this.close();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return modalId;
    }

    handleButtonClick(modalId, buttonText) {
        const modal = this.modals.get(modalId);
        if (modal) {
            const button = modal.config.buttons.find(btn => btn.text === buttonText);
            if (button && button.action) {
                button.action();
            }
        }
    }

    close() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.modals.clear();
    }

    // Replace browser alert
    static alert(message, title = 'Alert') {
        if (window.modalSystem) {
            return window.modalSystem.info(title, message);
        } else {
            return alert(message);
        }
    }

    // Replace browser confirm
    static confirm(message, title = 'Confirm') {
        if (window.modalSystem) {
            return window.modalSystem.confirm(title, message);
        } else {
            return confirm(message);
        }
    }
}

// Initialize modal system
window.modalSystem = new ModalSystem();

// Global functions to replace browser alerts
window.customAlert = ModalSystem.alert;
window.customConfirm = ModalSystem.confirm;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalSystem;
}
