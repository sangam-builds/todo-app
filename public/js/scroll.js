/**
 * Scroll Behavior Script - TaskFlow Navbar Redesign
 * Implements:
 * 1. Hero vs Scrolled (Floating Capsule) state toggling
 * 2. Scroll speed/direction hide-on-down-scroll, reveal-on-up-scroll behavior
 * 3. 60 FPS performance optimizations using requestAnimationFrame
 * 4. Scroll progress bar indicator updates
 */

(function() {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let isTicking = false;

    // Main scroll handler
    function processScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        const currentScrollY = window.scrollY;
        const currentTime = performance.now();
        const timeDiff = Math.max(currentTime - lastTime, 1); // Avoid division by zero
        const scrollDiff = currentScrollY - lastScrollY;

        // 1. Scrolled State Toggle (Y-threshold)
        if (currentScrollY > 45) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Keep navbar visible at all times (scrolled state capsule remains active on downscroll)
        navbar.classList.remove('navbar-hidden');

        // Update progress bar
        updateProgressBar(currentScrollY);

        lastScrollY = currentScrollY;
        lastTime = currentTime;
        isTicking = false;
    }

    // Update scroll progress bar at the top of the viewport
    function updateProgressBar(currentScrollY) {
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (!progressBar) return;

        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progressPercentage = (currentScrollY / totalHeight) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
    }

    // Scroll listener using ticking to schedule animation frames
    function onScroll() {
        if (!isTicking) {
            window.requestAnimationFrame(processScroll);
            isTicking = true;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Run immediately to initialize page position on refresh
        processScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    });
})();
