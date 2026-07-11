/**
 * Advanced Animations Module (Scroll Reveals, 3D Parallax & SVG Path Drawing)
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. SCROLL REVEALS USING INTERSECTION OBSERVER
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal-el, .stagger-container');

    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // Trigger slightly before element enters view
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it's a stagger container, mark it active to trigger children delay
                if (entry.target.classList.contains('stagger-container')) {
                    entry.target.classList.add('active');
                }
                
                // Once revealed, we don't need to observe it again
                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================================================
    // 2. HERO MOCKUP 3D TILT EFFECT
    // ==========================================================================
    const mockupWrapper = document.querySelector('.hero-mockup-wrapper');
    const mockupCard = document.querySelector('.hero-dashboard-mockup');

    if (mockupWrapper && mockupCard) {
        mockupWrapper.addEventListener('mousemove', (e) => {
            const rect = mockupWrapper.getBoundingClientRect();
            // Mouse coordinates relative to mockupWrapper center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Rotation multipliers (smaller value = less rotation)
            const rotateX = -y / (rect.height / 15);
            const rotateY = x / (rect.width / 15);

            requestAnimationFrame(() => {
                mockupCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                mockupCard.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        });

        mockupWrapper.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                mockupCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
                mockupCard.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        });
    }

    // ==========================================================================
    // 3. SVG CONNECTOR PATH LINE DRAWING (CALENDAR INTEGRATION)
    // ==========================================================================
    const integrationSection = document.querySelector('.integration');
    const pathLine = document.querySelector('.connector-line-active');

    if (integrationSection && pathLine) {
        // Calculate path length dynamically
        const pathLength = pathLine.getTotalLength();
        
        // Setup initial dash array properties to conceal path
        pathLine.style.strokeDasharray = pathLength;
        pathLine.style.strokeDashoffset = pathLength;

        const pathObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger path drawing transition
                    setTimeout(() => {
                        pathLine.style.transition = 'stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1)';
                        pathLine.style.strokeDashoffset = '0';
                    }, 400);

                    pathObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        pathObserver.observe(integrationSection);
    }
});
