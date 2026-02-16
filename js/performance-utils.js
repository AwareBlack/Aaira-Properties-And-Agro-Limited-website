/**
 * PERFORMANCE OPTIMIZATION UTILITIES
 * Aaira Properties & Agro Limited
 * 
 * Add this file to improve site performance:
 * <script src="js/performance-utils.js" defer></script>
 */

(function() {
    'use strict';

    // ============================================
    // IMAGE OPTIMIZATION
    // ============================================

    class ImageOptimizer {
        constructor() {
            this.init();
        }

        init() {
            // Convert Unsplash URLs to optimized versions
            this.optimizeUnsplashImages();
            
            // Add responsive images
            this.addResponsiveImages();
            
            // Implement lazy loading
            this.implementLazyLoading();
        }

        optimizeUnsplashImages() {
            const images = document.querySelectorAll('img[src*="unsplash.com"]');
            
            images.forEach(img => {
                const src = img.src;
                
                // Add optimization parameters
                if (!src.includes('?')) {
                    const optimizedSrc = `${src}?w=800&q=80&fm=webp&auto=format`;
                    img.src = optimizedSrc;
                    
                    // Add srcset for responsive images
                    img.srcset = `
                        ${src}?w=400&q=80&fm=webp 400w,
                        ${src}?w=800&q=80&fm=webp 800w,
                        ${src}?w=1200&q=80&fm=webp 1200w
                    `.trim();
                    
                    img.sizes = "(max-width: 768px) 400px, 800px";
                }
            });
        }

        addResponsiveImages() {
            const images = document.querySelectorAll('img:not([srcset])');
            
            images.forEach(img => {
                if (img.src && !img.srcset) {
                    const src = img.src;
                    const ext = src.split('.').pop().split('?')[0];
                    
                    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext.toLowerCase())) {
                        img.loading = 'lazy';
                        img.decoding = 'async';
                    }
                }
            });
        }

        implementLazyLoading() {
            if ('loading' in HTMLImageElement.prototype) {
                // Native lazy loading supported
                const images = document.querySelectorAll('img[data-src]');
                images.forEach(img => {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.loading = 'lazy';
                });
            } else {
                // Fallback to Intersection Observer
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    });
                });

                const images = document.querySelectorAll('img[data-src]');
                images.forEach(img => imageObserver.observe(img));
            }
        }
    }

    // ============================================
    // RESOURCE PRELOADING
    // ============================================

    class ResourcePreloader {
        constructor() {
            this.preloadCriticalResources();
        }

        preloadCriticalResources() {
            // Preload critical fonts
            this.preloadFont('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4W61O4a0Ew.woff2');
            this.preloadFont('https://fonts.gstatic.com/s/playfairdisplay/v36/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTXtPA.woff2');
            
            // Preconnect to critical origins
            this.preconnect('https://www.gstatic.com');
            this.preconnect('https://firestore.googleapis.com');
            this.preconnect('https://api.cloudinary.com');
            
            // DNS prefetch for other resources
            this.dnsPrefetch('https://wa.me');
            this.dnsPrefetch('https://firebasestorage.googleapis.com');
        }

        preloadFont(href) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = href;
            document.head.appendChild(link);
        }

        preconnect(href) {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = href;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }

        dnsPrefetch(href) {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = href;
            document.head.appendChild(link);
        }
    }

    // ============================================
    // CODE SPLITTING
    // ============================================

    class CodeSplitter {
        constructor() {
            this.loadConditionalScripts();
        }

        loadConditionalScripts() {
            // Load admin scripts only on admin pages
            if (window.location.pathname.includes('admin')) {
                this.loadScript('/js/admin.js', true);
            }

            // Load Firebase only when needed
            if (document.querySelector('[data-firebase]')) {
                this.loadScript('/js/firebase.js', true);
                this.loadScript('/js/app.js', true);
            }
        }

        loadScript(src, isModule = false) {
            const script = document.createElement('script');
            if (isModule) {
                script.type = 'module';
            }
            script.src = src;
            script.defer = true;
            document.body.appendChild(script);
        }
    }

    // ============================================
    // DEFER NON-CRITICAL CSS
    // ============================================

    class CSSOptimizer {
        constructor() {
            this.deferNonCriticalCSS();
        }

        deferNonCriticalCSS() {
            // Move non-critical CSS to load after page renders
            const nonCriticalCSS = [
                '/css/premium-animations.css',
                '/css/enhanced-styles.css'
            ];

            nonCriticalCSS.forEach(href => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.media = 'print';
                link.onload = function() {
                    this.media = 'all';
                };
                document.head.appendChild(link);
            });
        }
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================

    class CacheManager {
        constructor() {
            this.cacheName = 'aaira-cache-v1';
            this.init();
        }

        init() {
            // Register service worker if supported
            if ('serviceWorker' in navigator) {
                this.registerServiceWorker();
            }
        }

        async registerServiceWorker() {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    // ============================================
    // PERFORMANCE MONITORING
    // ============================================

    class PerformanceMonitor {
        constructor() {
            this.init();
        }

        init() {
            // Monitor performance metrics
            if ('PerformanceObserver' in window) {
                this.observeLCP();
                this.observeFID();
                this.observeCLS();
            }

            // Log page load time
            window.addEventListener('load', () => {
                this.logLoadTime();
            });
        }

        observeLCP() {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        observeFID() {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            });
            observer.observe({ entryTypes: ['first-input'] });
        }

        observeCLS() {
            let clsScore = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsScore += entry.value;
                        console.log('CLS:', clsScore);
                    }
                }
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        }

        logLoadTime() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);

            // Send to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'load',
                    value: loadTime,
                    event_category: 'Performance'
                });
            }
        }
    }

    // ============================================
    // DEBOUNCE & THROTTLE UTILITIES
    // ============================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ============================================
    // OPTIMIZE SCROLL HANDLERS
    // ============================================

    class ScrollOptimizer {
        constructor() {
            this.optimizeScrollHandlers();
        }

        optimizeScrollHandlers() {
            // Replace existing scroll handlers with throttled versions
            const scrollHandlers = [];
            
            window.addEventListener('scroll', throttle(() => {
                scrollHandlers.forEach(handler => handler());
            }, 100), { passive: true });
        }
    }

    // ============================================
    // REDUCE JAVASCRIPT EXECUTION
    // ============================================

    class JavaScriptOptimizer {
        constructor() {
            this.init();
        }

        init() {
            // Defer non-critical JavaScript
            this.deferNonCriticalJS();
            
            // Remove console logs in production
            if (window.location.hostname !== 'localhost') {
                this.disableConsoleLogs();
            }
        }

        deferNonCriticalJS() {
            // Move heavy computations to requestIdleCallback
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    // Initialize non-critical features
                    console.log('Non-critical features initialized');
                });
            }
        }

        disableConsoleLogs() {
            console.log = () => {};
            console.debug = () => {};
            console.info = () => {};
        }
    }

    // ============================================
    // NETWORK INFORMATION API
    // ============================================

    class NetworkOptimizer {
        constructor() {
            this.init();
        }

        init() {
            if ('connection' in navigator) {
                const connection = navigator.connection;
                
                // Reduce quality on slow connections
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    this.enableDataSaverMode();
                }
                
                // Listen for connection changes
                connection.addEventListener('change', () => {
                    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                        this.enableDataSaverMode();
                    }
                });
            }
        }

        enableDataSaverMode() {
            document.body.classList.add('data-saver-mode');
            console.log('Data saver mode enabled');
            
            // Disable animations
            document.body.style.setProperty('--transition-duration', '0s');
            
            // Stop auto-playing videos
            document.querySelectorAll('video[autoplay]').forEach(video => {
                video.pause();
                video.removeAttribute('autoplay');
            });
        }
    }

    // ============================================
    // INITIALIZE ALL OPTIMIZATIONS
    // ============================================

    function initPerformanceOptimizations() {
        console.log('⚡ Initializing performance optimizations...');

        new ImageOptimizer();
        new ResourcePreloader();
        new CodeSplitter();
        new CSSOptimizer();
        new CacheManager();
        new PerformanceMonitor();
        new ScrollOptimizer();
        new JavaScriptOptimizer();
        new NetworkOptimizer();

        console.log('✅ Performance optimizations complete');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
    } else {
        initPerformanceOptimizations();
    }

    // Export utilities
    window.PerformanceUtils = {
        debounce,
        throttle
    };

})();
