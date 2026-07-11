/**
 * Navbar Orchestrator Script - TaskFlow Navbar Redesign
 * Handles:
 * 1. Magnetic Hover Effect on the Get Started CTA button (attracts button and icon towards cursor)
 * 2. SVG path length measurements and path drawing transitions for the logo icon checkmark
 * 3. Tactile button ripples on click interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('TaskFlow Cinematic Navbar initialized.');

    // 1. Logo SVG Checkmark Drawing micro-interaction
    const logoEl = document.querySelector('.logo');
    const logoCheckmark = document.querySelector('.logo-checkmark');
    
    if (logoEl && logoCheckmark) {
        // Measure paths dynamically
        const pathLength = logoCheckmark.getTotalLength();
        logoCheckmark.style.strokeDasharray = pathLength;
        logoCheckmark.style.strokeDashoffset = pathLength;

        logoEl.addEventListener('mouseenter', () => {
            logoCheckmark.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            logoCheckmark.style.strokeDashoffset = '0';
        });

        logoEl.addEventListener('mouseleave', () => {
            logoCheckmark.style.transition = 'stroke-dashoffset 0.4s ease';
            logoCheckmark.style.strokeDashoffset = pathLength;
        });
    }

    // 2. Magnetic Attraction Hover Effect on Get Started CTA
    const magneticBtn = document.querySelector('.btn-get-started');
    
    if (magneticBtn) {
        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            
            // Calculate cursor offset relative to the button center
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;
            
            // Apply magnetic push offset (22% pull strength)
            const strength = 0.22;
            magneticBtn.style.transform = `translate(${mouseX * strength}px, ${mouseY * strength}px) scale(1.02)`;
            
            // Push internal chevron arrow slightly further
            const arrowIcon = magneticBtn.querySelector('i');
            if (arrowIcon) {
                arrowIcon.style.transform = `translateX(${4 + mouseX * 0.05}px) translateY(${mouseY * 0.05}px)`;
            }
        });

        magneticBtn.addEventListener('mouseleave', () => {
            // Transition back smoothly to origin
            magneticBtn.style.transform = '';
            const arrowIcon = magneticBtn.querySelector('i');
            if (arrowIcon) {
                arrowIcon.style.transform = '';
            }
        });
    }

    // 3. Tactile Button Click Ripples
    const rippleButtons = document.querySelectorAll('.btn-get-started, .theme-toggle-switch, .login-link');
    rippleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const circle = document.createElement('span');
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            
            const rect = this.getBoundingClientRect();
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple');

            const ripple = this.querySelector('.ripple');
            if (ripple) {
                ripple.remove();
            }

            this.appendChild(circle);
        });
    });
});
