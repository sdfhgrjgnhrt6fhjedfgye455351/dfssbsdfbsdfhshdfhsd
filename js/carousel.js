/**
 * 3D Coverflow Showcase Carousel for Lightcord
 * Features: 3D perspective transforms, circular navigation arrows, captions, touch swipe, keyboard nav
 */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.carousel-card'));
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    const captionTitle = document.getElementById('carousel-caption-title');
    const captionDesc = document.getElementById('carousel-caption-desc');

    let currentIndex = 0;
    const total = cards.length;

    // Slide metadata
    const slideInfo = [
        {
            title: "Client Engine & Power Controls",
            desc: "Full mastery over Discord internals. Configure custom Rich Presence, freeze battery-draining animations with Motion Pause, hide cosmetic clutter, and streamline your client experience."
        },
        {
            title: "350+ Built-In Plugins Ecosystem",
            desc: "Zero installation headaches. Access 350 curated plugins directly from your client settings. Instant toggles for MusicBot, BetterImages, ServerStats, and real-time ChatFilters."
        },
        {
            title: "Next-Gen Themes & Dynamic CSS Engine",
            desc: "Unmatched aesthetic customization. Load themes instantly via URL or BetterDiscord, live-edit with QuickCSS, and transform your Discord workspace with zero reload lag."
        }
    ];

    // Create dot indicators
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        cards.forEach((_, idx) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
            dot.addEventListener('click', () => goToSlide(idx));
            dotsContainer.appendChild(dot);
        });
    }

    function updateCarousel() {
        cards.forEach((card, idx) => {
            card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');

            // Calculate cyclic offset
            let offset = idx - currentIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            if (offset === 0) {
                card.classList.add('active');
            } else if (offset === -1 || (offset === total - 1 && total > 2)) {
                card.classList.add('prev');
            } else if (offset === 1 || (offset === -(total - 1) && total > 2)) {
                card.classList.add('next');
            } else if (offset < 0) {
                card.classList.add('hidden-left');
            } else {
                card.classList.add('hidden-right');
            }
        });

        // Update dots
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }

        // Update caption text with smooth fade
        if (captionTitle && captionDesc && slideInfo[currentIndex]) {
            captionTitle.style.opacity = '0';
            captionDesc.style.opacity = '0';
            setTimeout(() => {
                captionTitle.textContent = slideInfo[currentIndex].title;
                captionDesc.textContent = slideInfo[currentIndex].desc;
                captionTitle.style.opacity = '1';
                captionDesc.style.opacity = '1';
            }, 180);
        }
    }

    function goToSlide(index) {
        currentIndex = (index + total) % total;
        updateCarousel();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Click card directly to bring it to center
    cards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active')) {
                // Open fullscreen lightbox if active card is clicked
                openLightbox(card.querySelector('img').src, slideInfo[idx].title);
            } else {
                goToSlide(idx);
            }
        });
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        const carouselSection = document.getElementById('showcase');
        if (!carouselSection) return;
        const rect = carouselSection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInView) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        }
    });

    // Touch / Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 45) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }
    }

    // Lightbox modal logic
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(src, title) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        if (lightboxTitle) lightboxTitle.textContent = title;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
                closeLightbox();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Initial render
    updateCarousel();
});
