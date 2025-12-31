/**
 * Shared Theme Logic for RepurposeAI
 * Handles Dark Mode initialization and toggling.
 */

// Tailwind Configuration
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
                brand: { DEFAULT: '#1E40AF', dark: '#1E3A8A' },
                dark: { bg: '#111827', card: '#1F2937', border: '#374151' }
            }
        }
    }
};

// Theme Initialization
function initTheme() {
    if (localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// Run immediately
initTheme();

// Expose toggle function if needed (used in index.html)
window.toggleTheme = function () {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    // Refresh icons if lucide is present
    if (window.lucide) lucide.createIcons();
};
