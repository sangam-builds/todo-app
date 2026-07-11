/**
 * Testimonial Carousel Module
 */
document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.querySelector('.testimonials-slider-container');
    if (!sliderContainer) return;

    const wrapper = sliderContainer.querySelector('.testimonials-wrapper');
    const slides = sliderContainer.querySelectorAll('.testimonial-slide');
    const prevBtn = sliderContainer.querySelector('.carousel-control.prev');
    const nextBtn = sliderContainer.querySelector('.carousel-control.next');
    const dotsContainer = sliderContainer.querySelector('.carousel-dots');

    let currentIndex = 0;
    let autoplayInterval = null;
    const slideDelay = 6000; // 6 seconds auto-slide

    // 1. Initialize Navigation Dots
    if (dotsContainer && slides.length > 0) {
        dotsContainer.innerHTML = ''; // Clear fallback
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                goToSlide(idx);
            });
            dotsContainer.appendChild(dot);
        });
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    // 2. Go to specific slide function
    function goToSlide(index) {
        // Bounds checking
        if (index < 0) {
            currentIndex = slides.length - 1;
        } else if (index >= slides.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        // Translate wrapper
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update active slide class
        slides.forEach((slide, idx) => {
            if (idx === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update dots state
        if (dots.length > 0) {
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    // 3. Slide controls listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });
    }

    // 4. Autoplay functions
    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, slideDelay);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    // Autoplay trigger
    startAutoplay();

    // Hover listeners to pause/play autoplay
    sliderContainer.addEventListener('mouseenter', stopAutoplay);
    sliderContainer.addEventListener('mouseleave', startAutoplay);

    // 5. Swipe Gestures (Touch Events)
    let startX = 0;
    let isSwiping = false;

    sliderContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isSwiping = true;
        stopAutoplay();
    }, { passive: true });

    sliderContainer.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        const currentX = e.touches[0].clientX;
        const diffX = startX - currentX;

        // Minimum swipe distance
        if (Math.abs(diffX) > 60) {
            if (diffX > 0) {
                // Swipe left -> Next slide
                goToSlide(currentIndex + 1);
            } else {
                // Swipe right -> Prev slide
                goToSlide(currentIndex - 1);
            }
            isSwiping = false;
        }
    }, { passive: true });

    sliderContainer.addEventListener('touchend', () => {
        isSwiping = false;
        startAutoplay();
    }, { passive: true });
});
