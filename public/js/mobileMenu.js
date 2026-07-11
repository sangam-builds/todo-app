/**
 * Mobile Navigation Drawer Script - TaskFlow Navbar Redesign
 * Implements:
 * 1. Hamburger click and state animation toggle (bars to 'X')
 * 2. Sliding glass side drawer menu toggle
 * 3. Accessibility support (focus management, ARIA expanded state, and Escape to close)
 * 4. Body scroll locking to prevent viewport shifting when menu is active
 * 5. Clicks on section links, overlays, and document body outer-clicks close drawer automatically
 */

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.getElementById('nav-links'); // Unique ID for target links
        const navOverlay = document.getElementById('nav-overlay');
        const body = document.body;

        if (!navToggle || !navLinks) return;

        // Open mobile navigation menu
        function openMobileMenu() {
            navToggle.classList.add('open');
            navLinks.classList.add('open');
            if (navOverlay) navOverlay.classList.add('open');
            
            navToggle.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden'; // Lock background scrolling
            
            // Move keyboard focus to the first active link inside the drawer
            const firstLink = navLinks.querySelector('a');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 150);
            }
        }

        // Close mobile navigation menu
        function closeMobileMenu() {
            navToggle.classList.remove('open');
            navLinks.classList.remove('open');
            if (navOverlay) navOverlay.classList.remove('open');
            
            navToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = ''; // Unlock background scrolling
            
            // Return focus to the toggle button
            navToggle.focus();
        }

        // Toggle action trigger
        function handleToggleClick(e) {
            e.stopPropagation();
            if (navLinks.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }

        // Register event listeners
        navToggle.addEventListener('click', handleToggleClick);

        if (navOverlay) {
            navOverlay.addEventListener('click', closeMobileMenu);
        }

        // Close menu when clicking section links
        const linkItems = navLinks.querySelectorAll('a');
        linkItems.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close menu on hitting Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                closeMobileMenu();
            }
        });

        // Close menu if user clicks outside of the drawer contents
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open') && 
                !navLinks.contains(e.target) && 
                !navToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
    });
})();
