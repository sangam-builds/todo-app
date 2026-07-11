/**
 * Active Section Tracker Script - TaskFlow Navbar Redesign
 * Implements:
 * 1. Intersection Observer set precisely at the center of the viewport (-45% margins)
 * 2. Absolute positioning and dimensions calculation of the sliding capsule background (.nav-active-pill)
 * 3. Resize listener to keep pill aligned during viewport updates
 * 4. Fade, shrink, and blur animations when no section is active (e.g. Hero section)
 */

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const sections = document.querySelectorAll('section[id], header[id]');
        const navLinks = document.querySelectorAll('.nav-links a');
        const activePill = document.querySelector('.nav-active-pill');
        const navLinksContainer = document.querySelector('.nav-links');

        if (sections.length === 0 || navLinks.length === 0) return;

        // 1. Sliding Capsule Pill Repositioning function
        function updatePillPosition() {
            if (!activePill || !navLinksContainer) return;

            // Only position the pill on desktop screens (hidden on mobile CSS)
            if (window.innerWidth <= 768) {
                activePill.classList.remove('visible');
                return;
            }

            const activeLink = document.querySelector('.nav-links a.active');

            if (activeLink) {
                const activeRect = activeLink.getBoundingClientRect();
                const containerRect = navLinksContainer.getBoundingClientRect();

                // Compute offsets relative to the parent UL container
                const leftOffset = activeRect.left - containerRect.left;
                const topOffset = activeRect.top - containerRect.top;

                // Apply styles to the pill
                activePill.style.width = `${activeRect.width}px`;
                activePill.style.height = `${activeRect.height}px`;
                activePill.style.left = `${leftOffset}px`;
                activePill.style.top = `${topOffset}px`;
                activePill.classList.add('visible');
            } else {
                // Fade and shrink out when no section is active (e.g., in Hero state)
                activePill.classList.remove('visible');
            }
        }

        // 2. Intersection Observer targeting the center slice of viewport
        const observerOptions = {
            root: null,
            rootMargin: '-45% 0px -45% 0px' // Targets a 10% center strip
        };

        const observerCallback = (entries) => {
            let activeFound = false;

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        
                        if (href === `#${currentId}`) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'page');
                            activeFound = true;
                        } else {
                            link.classList.remove('active');
                            link.removeAttribute('aria-current');
                        }
                    });
                }
            });

            // Trigger active pill sliding adjustments
            updatePillPosition();
        };

        const centerObserver = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach(section => {
            centerObserver.observe(section);
        });

        // 3. Keep pill aligned on viewport resizes
        window.addEventListener('resize', () => {
            requestAnimationFrame(updatePillPosition);
        });

        // Expose update function globally for trigger overrides
        window.NavbarActiveSection = {
            updatePillPosition
        };
    });
})();
