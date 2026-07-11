/**
 * Theme Management Script - TaskFlow Navbar Redesign
 * Controls light/dark modes, track switch thumb animation support, and accessibility aria-checked states.
 */

(function() {
    // 1. Immediate Theme Application (Executes instantly to prevent layout flash)
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
    
    if (initialTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Helper to update track switch ARIA attributes
    function updateSwitchAccessibility(theme) {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
        const isChecked = theme === 'light';

        [themeToggleBtn, themeToggleMobileBtn].forEach(btn => {
            if (btn) {
                btn.setAttribute('aria-checked', isChecked ? 'true' : 'false');
            }
        });
    }

    // Helper function to apply theme and update states
    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
        updateSwitchAccessibility(theme);
    }

    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    }

    // 2. Attach Event Listeners on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');

        // Set initial ARIA state on load
        const activeTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        updateSwitchAccessibility(activeTheme);

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                // Trigger pull-down animation
                themeToggleBtn.classList.add('pulling');
                toggleTheme();
                
                // Remove class to trigger spring snap-back bounce
                setTimeout(() => {
                    themeToggleBtn.classList.remove('pulling');
                }, 250);
            });
        }
        if (themeToggleMobileBtn) {
            themeToggleMobileBtn.addEventListener('click', toggleTheme);
        }
    });

    // Expose utility globally
    window.NavbarTheme = {
        applyTheme,
        toggleTheme,
        getCurrentTheme: () => localStorage.getItem('theme') || 'dark'
    };
})();
