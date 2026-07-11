/**
 * Main Application Coordinator (Tabs, Pricing Toggle, FAQ Accordion, Preloader, Typing, Particles)
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. PRELOADER SCREEN REMOVAL
    // ==========================================================================
    const preloader = document.getElementById('preloader');
    
    window.addEventListener('load', () => {
        if (preloader) {
            preloader.classList.add('fade-out');
            // Remove from DOM after opacity transition complete
            setTimeout(() => {
                preloader.remove();
            }, 800);
        }
    });

    // Fallback if load event takes too long
    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.remove(), 800);
        }
    }, 3000);

    // ==========================================================================
    // 2. DASHBOARD PREVIEW TAB SWITCHER
    // ==========================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const previewPanes = document.querySelectorAll('.preview-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPaneId = btn.getAttribute('data-tab');

            // Toggle Active Tab Button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle Active Preview Pane
            previewPanes.forEach(pane => {
                if (pane.id === targetPaneId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });

    // ==========================================================================
    // 3. PRICING TOGGLE (MONTHLY / YEARLY)
    // ==========================================================================
    const priceToggle = document.getElementById('price-toggle');
    const monthlyLabel = document.getElementById('monthly-lbl');
    const yearlyLabel = document.getElementById('yearly-lbl');
    const priceAmounts = document.querySelectorAll('.price-amount');
    const pricePeriods = document.querySelectorAll('.price-period');

    if (priceToggle) {
        priceToggle.addEventListener('click', () => {
            priceToggle.classList.toggle('active');
            const isYearly = priceToggle.classList.contains('active');

            if (isYearly) {
                monthlyLabel.classList.remove('active');
                yearlyLabel.classList.add('active');
            } else {
                monthlyLabel.classList.add('active');
                yearlyLabel.classList.remove('active');
            }

            // Animate price updates
            priceAmounts.forEach(amt => {
                const card = amt.closest('.pricing-card');
                const monthlyPrice = parseInt(card.getAttribute('data-monthly'), 10);
                const yearlyPrice = parseInt(card.getAttribute('data-yearly'), 10);
                const targetPrice = isYearly ? yearlyPrice : monthlyPrice;

                // Scale down slightly and fade out, change price, scale up and fade in
                amt.style.transform = 'scale(0.8) translateY(-10px)';
                amt.style.opacity = '0';
                
                setTimeout(() => {
                    amt.textContent = targetPrice;
                    amt.style.transform = 'scale(1) translateY(0)';
                    amt.style.opacity = '1';
                }, 150);
            });

            // Update periods texts
            pricePeriods.forEach(period => {
                period.textContent = isYearly ? '/ yr' : '/ mo';
            });
        });
    }

    // ==========================================================================
    // 4. FAQ ACCORDION TRANSITION
    // ==========================================================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        const body = item.querySelector('.faq-body');

        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all active items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-body').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                // Calculate actual content height for smooth sliding reveal
                body.style.maxHeight = `${body.scrollHeight}px`;
            }
        });
    });

    // ==========================================================================
    // 5. HERO TYPING ANIMATION (E.G. AI PREDICTIONS IN THE MOCKUP)
    // ==========================================================================
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const words = [
            "Syncing Google Calendar...", 
            "Categorizing high-priority tasks...", 
            "Optimizing your morning schedule...", 
            "Predicting daily productivity score..."
        ];
        let wordIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let typeSpeed = 80;

        function type() {
            const currentWord = words[wordIdx];
            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, charIdx - 1);
                charIdx--;
                typeSpeed = 40; // delete faster
            } else {
                typingElement.textContent = currentWord.substring(0, charIdx + 1);
                charIdx++;
                typeSpeed = 85;
            }

            if (!isDeleting && charIdx === currentWord.length) {
                // Pause at the end of word
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                wordIdx = (wordIdx + 1) % words.length;
                typeSpeed = 500; // pause before typing next word
            }

            setTimeout(type, typeSpeed);
        }

        // Start typing delay
        setTimeout(type, 1500);
    }

    // ==========================================================================
    // 6. FLOATING PARTICLES GENERATOR (HERO BACKGROUND CANVAS)
    // ==========================================================================
    const heroBg = document.querySelector('.hero-shapes');
    if (heroBg) {
        const particleCount = 25;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'shape';
            
            // Random sizes, colors, positions, and drift times
            const size = Math.random() * 80 + 30; // 30px to 110px
            const color = Math.random() > 0.5 ? 'var(--primary)' : 'var(--accent)';
            const x = Math.random() * 100; // %
            const y = Math.random() * 100; // %
            const duration = Math.random() * 15 + 15; // 15s to 30s
            const delay = Math.random() * -20; // negative delay so they start scattered

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = color;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.filter = 'blur(60px)';
            particle.style.opacity = '0.07';
            particle.style.animation = `blobDrift${Math.random() > 0.5 ? '1' : '2'} ${duration}s ease-in-out infinite`;
            particle.style.animationDelay = `${delay}s`;

            heroBg.appendChild(particle);
        }
    }
});
