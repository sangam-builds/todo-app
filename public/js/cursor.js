document.addEventListener('DOMContentLoaded', () => {
    // 1. Create and Append Cursor Glow Overlay
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
        // Use requestAnimationFrame for smooth GPU-accelerated drawing
        requestAnimationFrame(() => {
            cursorGlow.style.left = `${e.clientX}px`;
            cursorGlow.style.top = `${e.clientY}px`;
        });
    });

    // 2. Card Spotlight Glow Effect (Feature Cards, Pricing, etc.)
    const glowCards = document.querySelectorAll('.feature-card, .pricing-card, .step-card, .stat-item, .faq-item, .cta-box');
    
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 3. Magnetic Buttons Implementation
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .logo-icon, .social-link, .carousel-control');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // Calculate distance from center of the button
            const btnX = rect.left + rect.width / 2;
            const btnY = rect.top + rect.height / 2;

            const distanceX = e.clientX - btnX;
            const distanceY = e.clientY - btnY;

            // Apply a magnetic pull factor (adjust divisor to increase/decrease magnetic strength)
            const strength = 0.25; 
            const pullX = distanceX * strength;
            const pullY = distanceY * strength;

            requestAnimationFrame(() => {
                btn.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.03)`;
                btn.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        });

        btn.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                btn.style.transform = 'translate(0px, 0px) scale(1)';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        });
    });

    // 4. Button Hover Ripple Effect
    const rippleButtons = document.querySelectorAll('.btn');

    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Find or create ripple canvas
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            // Remove ripple after animation complete
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});
