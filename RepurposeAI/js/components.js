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

        // Refresh Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

// Auto-init if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Components.init());
} else {
    Components.init();
}
