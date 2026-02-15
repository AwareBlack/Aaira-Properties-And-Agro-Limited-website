/**
 * PREMIUM ANIMATIONS JAVASCRIPT
 * Aaira Properties & Agro Limited
 * 
 * Add this after main.js:
 * <script src="js/premium-animations.js"></script>
 */

(function() {
    'use strict';

    // ============================================
    // SCROLL-TRIGGERED ANIMATIONS
    // ============================================

    class ScrollAnimations {
        constructor() {
            this.elements = document.querySelectorAll('[data-animate]');
            this.observer = null;
            this.init();
        }

        init() {
            // Add data-animate to elements that should animate
            this.autoDetectElements();
            
            // Create intersection observer
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    threshold: 0.15,
                    rootMargin: '0px 0px -50px 0px'
                }
            );

            // Observe all elements
            this.elements.forEach(el => this.observer.observe(el));
        }

        autoDetectElements() {
            // Auto-add animation attributes to key elements
            const selectors = [
                '.business-card',
                '.service-card-dual',
                '.product-card',
                '.project-card',
                '.qurbani-card',
                '.advantage-item',
                '.contact-method',
                '.section-header',
                '.about-content',
                '.why-item'
            ];

            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (!el.hasAttribute('data-animate')) {
                        el.setAttribute('data-animate', 'fade-up');
                    }
                });
            });

            // Refresh elements list
            this.elements = document.querySelectorAll('[data-animate]');
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Optionally unobserve after animation
                    // this.observer.unobserve(entry.target);
                }
            });
        }
    }

    // ============================================
    // SCROLL PROGRESS INDICATOR
    // ============================================

    class ScrollProgress {
        constructor() {
            this.progressBar = this.createProgressBar();
            this.init();
        }

        createProgressBar() {
            const bar = document.createElement('div');
            bar.className = 'scroll-progress';
            document.body.appendChild(bar);
            return bar;
        }

        init() {
            window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
        }

        updateProgress() {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            this.progressBar.style.width = scrolled + '%';
        }
    }

    // ============================================
    // COUNTER ANIMATION
    // ============================================

    class CounterAnimation {
        constructor() {
            this.counters = document.querySelectorAll('[data-counter]');
            this.init();
        }

        init() {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateCounter(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.5 }
            );

            this.counters.forEach(counter => observer.observe(counter));
        }

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-counter'));
            const duration = 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);
        }
    }

    // ============================================
    // PARALLAX EFFECT
    // ============================================

    class ParallaxEffect {
        constructor() {
            this.elements = document.querySelectorAll('[data-parallax]');
            this.init();
        }

        init() {
            if (this.elements.length === 0) return;

            window.addEventListener('scroll', () => this.update(), { passive: true });
        }

        update() {
            const scrolled = window.pageYOffset;

            this.elements.forEach(element => {
                const speed = element.getAttribute('data-parallax') || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        }
    }

    // ============================================
    // SMOOTH SCROLL TO ANCHOR
    // ============================================

    class SmoothScroll {
        constructor() {
            this.links = document.querySelectorAll('a[href^="#"]');
            this.init();
        }

        init() {
            this.links.forEach(link => {
                link.addEventListener('click', (e) => this.handleClick(e));
            });
        }

        handleClick(e) {
            const href = e.currentTarget.getAttribute('href');
            
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    // ============================================
    // CARD TILT EFFECT (PREMIUM)
    // ============================================

    class CardTilt {
        constructor() {
            this.cards = document.querySelectorAll('.business-card, .service-card-dual');
            this.init();
        }

        init() {
            this.cards.forEach(card => {
                card.addEventListener('mousemove', (e) => this.handleTilt(e, card));
                card.addEventListener('mouseleave', () => this.resetTilt(card));
            });
        }

        handleTilt(e, card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        }

        resetTilt(card) {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        }
    }

    // ============================================
    // IMAGE LAZY LOADING WITH FADE
    // ============================================

    class LazyLoadImages {
        constructor() {
            this.images = document.querySelectorAll('img[data-src]');
            this.init();
        }

        init() {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: '50px' }
            );

            this.images.forEach(img => {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.6s ease';
                observer.observe(img);
            });
        }

        loadImage(img) {
            const src = img.getAttribute('data-src');
            if (!src) return;

            img.src = src;
            img.removeAttribute('data-src');
            
            img.onload = () => {
                img.style.opacity = '1';
            };
        }
    }

    // ============================================
    // TYPING EFFECT (OPTIONAL)
    // ============================================

    class TypingEffect {
        constructor(element, words, speed = 100) {
            this.element = element;
            this.words = words;
            this.speed = speed;
            this.wordIndex = 0;
            this.charIndex = 0;
            this.isDeleting = false;
            this.init();
        }

        init() {
            if (!this.element) return;
            this.type();
        }

        type() {
            const currentWord = this.words[this.wordIndex];
            
            if (this.isDeleting) {
                this.element.textContent = currentWord.substring(0, this.charIndex - 1);
                this.charIndex--;
            } else {
                this.element.textContent = currentWord.substring(0, this.charIndex + 1);
                this.charIndex++;
            }

            let typeSpeed = this.speed;

            if (this.isDeleting) {
                typeSpeed /= 2;
            }

            if (!this.isDeleting && this.charIndex === currentWord.length) {
                typeSpeed = 2000;
                this.isDeleting = true;
            } else if (this.isDeleting && this.charIndex === 0) {
                this.isDeleting = false;
                this.wordIndex = (this.wordIndex + 1) % this.words.length;
                typeSpeed = 500;
            }

            setTimeout(() => this.type(), typeSpeed);
        }
    }

    // ============================================
    // BUTTON RIPPLE EFFECT
    // ============================================

    class ButtonRipple {
        constructor() {
            this.buttons = document.querySelectorAll('.btn, .btn-card, .btn-product, button');
            this.init();
        }

        init() {
            this.buttons.forEach(button => {
                button.addEventListener('click', (e) => this.createRipple(e, button));
            });
        }

        createRipple(e, button) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                top: ${y}px;
                left: ${x}px;
                pointer-events: none;
                animation: ripple 0.6s ease-out;
            `;

            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        }
    }

    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ============================================
    // NAVBAR BACKGROUND BLUR
    // ============================================

    class NavbarEnhancement {
        constructor() {
            this.navbar = document.querySelector('.navbar');
            this.init();
        }

        init() {
            if (!this.navbar) return;

            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 100) {
                    this.navbar.style.backdropFilter = 'blur(20px) saturate(180%)';
                    this.navbar.style.background = 'rgba(255, 255, 255, 0.9)';
                } else {
                    this.navbar.style.backdropFilter = 'none';
                    this.navbar.style.background = 'white';
                }
            }, { passive: true });
        }
    }

    // ============================================
    // INITIALIZE ALL ANIMATIONS
    // ============================================

    function initPremiumAnimations() {
        // Check if reduced motion is preferred
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            console.log('Reduced motion preferred - animations minimized');
            return;
        }

        // Initialize all animation classes
        new ScrollAnimations();
        new ScrollProgress();
        new CounterAnimation();
        new ParallaxEffect();
        new SmoothScroll();
        new CardTilt();
        new LazyLoadImages();
        new ButtonRipple();
        new NavbarEnhancement();

        // Optional: Typing effect for hero
        // const typingElement = document.querySelector('[data-typing]');
        // if (typingElement) {
        //     new TypingEffect(typingElement, ['Premium Land', 'Fresh Dairy', 'Quality Service'], 150);
        // }

        console.log('✨ Premium animations initialized');
    }

    // ============================================
    // AUTO-INITIALIZE ON DOM READY
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPremiumAnimations);
    } else {
        initPremiumAnimations();
    }

    // ============================================
    // PERFORMANCE MONITORING (OPTIONAL)
    // ============================================

    if ('PerformanceObserver' in window) {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                    console.warn('Long task detected:', entry.duration + 'ms');
                }
            }
        });

        perfObserver.observe({ entryTypes: ['longtask'] });
    }

})();
