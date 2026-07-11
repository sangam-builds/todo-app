(function() {
    let isTicking = false;

    function updateCardStack() {
        const wrapper = document.querySelector('.features-pinned-wrapper');
        const sticky = document.querySelector('.features-sticky-container');
        if (!wrapper || !sticky) return;

        const cards = document.querySelectorAll('.features-deck-card');
        const texts = document.querySelectorAll('.feature-desc-item');
        if (cards.length === 0 || texts.length === 0) return;

        // Calculate scroll bounds
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperTop = window.scrollY + wrapperRect.top;
        const totalScrollRange = wrapper.scrollHeight - window.innerHeight;

        // Calculate percentage (0 to 1) of scroll progress
        let progress = 0;
        if (totalScrollRange > 0) {
            progress = (window.scrollY - wrapperTop) / totalScrollRange;
            progress = Math.max(0, Math.min(1, progress));
        } else {
            // Mobile viewport relative scroll tracking
            const viewportHeight = window.innerHeight;
            progress = (viewportHeight - wrapperRect.top) / (wrapperRect.height + viewportHeight);
            progress = Math.max(0, Math.min(1, progress));
        }

        const totalItems = cards.length;
        
        // Mobile layout check (we turn off card stacking on viewports <= 1024px)
        const isMobile = window.innerWidth <= 1024;

        if (isMobile) {
            // For mobile, display cards one by one as they scroll in
            let activeIdx = Math.min(Math.floor(progress * totalItems), totalItems - 1);
            activeIdx = Math.max(0, activeIdx);

            cards.forEach((card, idx) => {
                if (idx === activeIdx) {
                    card.classList.add('active');
                    card.classList.remove('slid-up');
                } else {
                    card.classList.remove('active');
                    card.classList.remove('slid-up');
                }
            });

            texts.forEach((text, idx) => {
                if (idx === activeIdx) {
                    text.classList.add('active');
                } else {
                    text.classList.remove('active');
                }
            });
            return;
        }

        // Desktop stacked scroll logic
        // We partition the progress range [0, 1] into sections
        // Each card represents a slice: Card 0, Card 1, Card 2, Card 3
        // If progress goes past the threshold, the card flies out (gets .slid-up)
        // Card 0 active: 0 to 0.22
        // Card 1 active: 0.22 to 0.47
        // Card 2 active: 0.47 to 0.72
        // Card 3 active: 0.72 to 1.00
        
        let activeIndex = 0;
        if (progress > 0.22 && progress <= 0.47) {
            activeIndex = 1;
        } else if (progress > 0.47 && progress <= 0.72) {
            activeIndex = 2;
        } else if (progress > 0.72) {
            activeIndex = 3;
        }

        cards.forEach((card, idx) => {
            // Cards index below the active index fly out
            if (idx < activeIndex) {
                card.classList.add('slid-up');
                card.classList.remove('active');
            } 
            // The active card is scaled and centered
            else if (idx === activeIndex) {
                card.classList.add('active');
                card.classList.remove('slid-up');
            } 
            // Later cards remain stacked behind
            else {
                card.classList.remove('active', 'slid-up');
            }
        });

        texts.forEach((text, idx) => {
            if (idx === activeIndex) {
                text.classList.add('active');
            } else {
                text.classList.remove('active');
            }
        });

        isTicking = false;
    }

    function onScroll() {
        if (!isTicking) {
            window.requestAnimationFrame(updateCardStack);
            isTicking = true;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Run immediately to set states on reload
        updateCardStack();
        
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => {
            updateCardStack();
        }, { passive: true });
    });
})();
