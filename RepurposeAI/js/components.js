/**
 * Layout Components
 * Centralizes the HTML for Sidebar and Header to ensure consistency across pages.
 * Works without a server (file:// protocol friendly).
 */

// Expose to window for app.js access
window.Components = {
    // --- Icons (Lucide names) ---
    icons: {
        logo: 'sparkles',
        home: 'home',
        dashboard: 'history',
        analytics: 'bar-chart-2',
        menu: 'menu',
        moon: 'moon',
        sun: 'sun',
        logout: 'log-out',
        user: 'user'
    },

    // --- Sidebar Component ---
    renderSidebar: function (activePage = 'home') {
        const isHomeActive = activePage === 'home'
            ? 'bg-brand text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group';

        const homeIconClass = activePage === 'home' ? '' : 'group-hover:text-brand dark:group-hover:text-brand-light transition-colors';

        const isDashActive = activePage === 'dashboard'
            ? 'bg-brand text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group';

        const dashIconClass = activePage === 'dashboard' ? '' : 'group-hover:text-brand dark:group-hover:text-brand-light transition-colors';

        return `
        <!-- Mobile Overlay -->
        <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 hidden opacity-0 transition-opacity duration-300 md:hidden glassmorphism-overlay"></div>

        <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border transform -translate-x-full md:translate-x-0 transition-transform duration-300 md:transition-none flex flex-col justify-between">
            
            <!-- Logo Area -->
            <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-dark-border">
                <a href="#home" class="flex items-center gap-2.5 group">
                    <div class="bg-brand text-white p-2 rounded-lg shadow-sm group-hover:bg-brand-dark transition-colors">
                        <i data-lucide="${this.icons.logo}" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold tracking-tight text-brand dark:text-brand-light">RepurposeAI</h1>
                        <p class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">Creator Tools</p>
                    </div>
                </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-grow p-4 space-y-1 overflow-y-auto">
                <a href="#home" class="flex items-center gap-3 px-3 py-2.5 rounded-lg ${isHomeActive} transition-all font-medium">
                    <i data-lucide="${this.icons.home}" class="w-5 h-5 ${homeIconClass}"></i>
                    홈 (생성하기)
                </a>
                <a href="#dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg ${isDashActive} transition-all font-medium">
                    <i data-lucide="${this.icons.dashboard}" class="w-5 h-5 ${dashIconClass}"></i>
                    대시보드
                </a>
                <a href="#brands" class="flex items-center gap-3 px-3 py-2.5 rounded-lg ${activePage === 'brands' ? 'bg-brand text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group'} transition-all font-medium">
                    <i data-lucide="briefcase" class="w-5 h-5 ${activePage === 'brands' ? '' : 'group-hover:text-brand dark:group-hover:text-brand-light transition-colors'}"></i>
                    브랜드 프로필
                </a>
                <a href="#settings" class="flex items-center gap-3 px-3 py-2.5 rounded-lg ${activePage === 'settings' ? 'bg-brand text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 group'} transition-all font-medium">
                    <i data-lucide="${this.icons.settings || 'settings'}" class="w-5 h-5 ${activePage === 'settings' ? '' : 'group-hover:text-brand dark:group-hover:text-brand-light transition-colors'}"></i>
                    설정
                </a>
                
                <!-- Future Menu Item Placeholder -->
                <div class="pt-4 mt-4 border-t border-gray-100 dark:border-dark-border">
                    <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Coming Soon</p>
                    <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60">
                        <i data-lucide="${this.icons.analytics}" class="w-5 h-5"></i>
                         분석 (준비중)
                    </button>
                </div>
            </nav>

            <!-- Sidebar Footer -->
            <div class="p-4 border-t border-gray-200 dark:border-dark-border">
                <div class="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-dark-border">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-brand dark:text-brand-light text-xs font-bold">
                        AI
                    </div>
                    <div class="flex-grow min-w-0">
                        <p id="sidebar-user-name" class="text-sm font-medium truncate text-gray-700 dark:text-gray-200">Guest</p>
                        <p class="text-[10px] text-gray-500 truncate">Free Plan</p>
                    </div>
                </div>
            </div>
        </aside>
        `;
    },

    // --- Header Component ---
    renderHeader: function () {
        return `
        <header class="bg-white/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-dark-border transition-colors duration-300 h-16">
            <div class="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                
                <!-- Left: Hamburger (Mobile) & Title -->
                <div class="flex items-center gap-3">
                    <button id="sidebar-toggle" class="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors">
                        <i data-lucide="${this.icons.menu}" class="w-6 h-6"></i>
                    </button>
                    <!-- Mobile Logo (Simplified) -->
                    <div class="md:hidden flex items-center gap-2">
                        <i data-lucide="${this.icons.logo}" class="w-5 h-5 text-brand"></i>
                        <span class="font-bold text-gray-900 dark:text-white">RepurposeAI</span>
                    </div>
                </div>

                <!-- Right: Global Actions -->
                <div class="flex items-center gap-2 md:gap-4">
                    <button id="theme-toggle" class="p-2 text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand-light transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle Dark Mode">
                         <i data-lucide="${this.icons.moon}" class="w-5 h-5 hidden dark:block"></i>
                         <i data-lucide="${this.icons.sun}" class="w-5 h-5 block dark:hidden"></i>
                    </button>

                    <!-- Auth Buttons -->
                    <div id="auth-container" class="flex items-center">
                        <a href="login.html" id="login-btn" class="hidden text-sm font-medium text-gray-600 hover:text-brand dark:text-gray-300 dark:hover:text-white transition-colors">
                            로그인
                        </a>

                        <button id="logout-btn" class="hidden text-sm font-medium text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 ml-2">
                             로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </header>
        `;
    },

    // --- Global Modal Component ---
    renderGlobalModal: function () {
        return `
        <div id="app-modal" class="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300">
            <div class="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 rounded-2xl shadow-2xl max-w-sm w-[90%] transform scale-95 transition-all duration-300" id="app-modal-content">
                <div class="flex items-start gap-4">
                    <div id="modal-icon-container" class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-brand/10 text-brand">
                        <i data-lucide="alert-circle" id="modal-icon" class="w-6 h-6"></i>
                    </div>
                    <div class="flex-grow">
                        <h3 id="modal-title" class="text-lg font-bold text-gray-900 dark:text-white mb-1">안내</h3>
                        <p id="modal-message" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"></p>
                    </div>
                </div>
                <div id="modal-footer" class="flex gap-3 justify-end mt-8">
                    <button id="modal-cancel-btn" class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors hidden">
                        취소
                    </button>
                    <button id="modal-confirm-btn" class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark text-sm font-medium shadow-lg shadow-brand/20 transition-all active:scale-95">
                        확인
                    </button>
                </div>
            </div>
        </div>
        `;
    },

    // --- Initialization ---
    init: function () {
        // Use hash for routing (SPA), default to 'home'
        const hash = window.location.hash.substring(1) || 'home';
        let activePage = 'home';
        if (hash === 'dashboard') activePage = 'dashboard';

        // Inject Sidebar
        const sidebarContainer = document.getElementById('layout-sidebar');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = this.renderSidebar(activePage);
        }

        // Inject Header
        const headerContainer = document.getElementById('layout-header');
        if (headerContainer) {
            headerContainer.innerHTML = this.renderHeader();
        }

        // Inject Global Modal if it doesn't exist
        if (!document.getElementById('app-modal')) {
            const modalWrapper = document.createElement('div');
            modalWrapper.innerHTML = this.renderGlobalModal();
            document.body.appendChild(modalWrapper.firstElementChild);
        }

        // Refresh Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // --- Global Modal Service Logic ---
        window.showAppModal = function ({ title, message, type = 'alert', confirmText = '확인', cancelText = '취소' }) {
            return new Promise((resolve) => {
                const modal = document.getElementById('app-modal');
                const modalContent = document.getElementById('app-modal-content');
                const modalTitle = document.getElementById('modal-title');
                const modalMessage = document.getElementById('modal-message');
                const modalCancelBtn = document.getElementById('modal-cancel-btn');
                const modalConfirmBtn = document.getElementById('modal-confirm-btn');
                const modalIcon = document.getElementById('modal-icon');
                const modalIconContainer = document.getElementById('modal-icon-container');

                if (!modal) return resolve(false);

                modalTitle.innerText = title;
                modalMessage.innerText = message;
                modalConfirmBtn.innerText = confirmText;
                modalCancelBtn.innerText = cancelText;

                // Type handling
                if (type === 'confirm') {
                    modalCancelBtn.classList.remove('hidden');
                    modalIconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-red-50 text-red-500 dark:bg-red-900/20';
                    modalIcon.setAttribute('data-lucide', 'alert-triangle');
                } else {
                    modalCancelBtn.classList.add('hidden');
                    modalIconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-brand/10 text-brand dark:bg-brand/20';
                    modalIcon.setAttribute('data-lucide', 'info');
                }
                if (window.lucide) lucide.createIcons();

                // Show animation
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    if (modalContent) modalContent.classList.remove('scale-95');
                }, 10);

                const handleConfirm = () => {
                    cleanup();
                    resolve(true);
                };

                const handleCancel = () => {
                    cleanup();
                    resolve(false);
                };

                const cleanup = () => {
                    modal.classList.add('opacity-0');
                    if (modalContent) modalContent.classList.add('scale-95');
                    setTimeout(() => {
                        modal.classList.add('hidden');
                        modalConfirmBtn.removeEventListener('click', handleConfirm);
                        modalCancelBtn.removeEventListener('click', handleCancel);
                    }, 300);
                };

                modalConfirmBtn.addEventListener('click', handleConfirm, { once: true });
                modalCancelBtn.addEventListener('click', handleCancel, { once: true });
            });
        };

        window.showAppConfirm = function (title, message, confirmText = '확인') {
            return window.showAppModal({ title, message, type: 'confirm', confirmText });
        };

        window.showAppAlert = function (title, message) {
            return window.showAppModal({ title, message, type: 'alert' });
        };
    }
};

// Auto-init if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Components.init());
} else {
    Components.init();
}
