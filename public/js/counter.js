/**
 * Numeric Counter and Progress Circle Animation Module
 */
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10) || 0;
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000; // Animation duration in ms
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function (easeOutQuad)
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * target);
        
        // Update text with locale formatting if appropriate
        if (target >= 1000) {
            element.textContent = `${prefix}${currentValue.toLocaleString()}${suffix}`;
        } else {
            element.textContent = `${prefix}${currentValue}${suffix}`;
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
        }
    }

    window.requestAnimationFrame(step);
}

function animateProgressCircle(svgContainer) {
    const circle = svgContainer.querySelector('.progress-ring-circle');
    if (!circle) return;

    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    // Set initial dasharray and offset
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    const targetPercent = parseInt(svgContainer.getAttribute('data-percent'), 10) || 0;
    const offset = circumference - (targetPercent / 100) * circumference;

    // Trigger transition
    setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)';
        circle.style.strokeDashoffset = offset;
    }, 150);
}

document.addEventListener('DOMContentLoaded', () => {
    // Setup Intersection Observer for Stats Section
    const statsSection = document.querySelector('.stats-section, #productivity-stats');
    if (!statsSection) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                
                // Animate numbers
                const counters = entry.target.querySelectorAll('.counter-val');
                counters.forEach(counter => {
                    animateCounter(counter);
                });

                // Animate progress circles
                const circles = entry.target.querySelectorAll('.progress-circle-svg');
                circles.forEach(circle => {
                    animateProgressCircle(circle);
                });

                // Unobserve after running animations once
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.25 // Trigger when 25% of the section is visible
    });

    observer.observe(statsSection);
});
