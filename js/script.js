/**
 * つぼ焼き芋 火乃蔵 LP - JavaScript
 * レスポンシブ対応・アクセシビリティ配慮・パフォーマンス最適化
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeSmoothScroll();
    initializeAnalytics();
    checkViewport();
});

/**
 * アニメーション初期化
 * prefers-reduced-motionを尊重
 */
function initializeAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        // モーション無効の場合、すべての要素を即座に表示
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
        return;
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 初期状態でアニメーションを一時停止
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });

    // Sweetness meter animation
    const meterFills = document.querySelectorAll('.meter-fill');
    const meterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 300);
                meterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    meterFills.forEach(fill => {
        meterObserver.observe(fill);
    });
}

/**
 * スムーススクロール機能
 */
function initializeSmoothScroll() {
    // ページ内アンカーリンクの処理
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // ヘッダーの高さを考慮
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // フォーカス管理
                target.focus();
                
                // アナリティクストラッキング
                trackEvent('Navigation', 'anchor_click', href);
            }
        });
    });
}

/**
 * ビューポート検出とクラス追加
 */
function checkViewport() {
    function updateViewportClass() {
        const body = document.body;
        const width = window.innerWidth;
        
        // 既存のビューポートクラスを削除
        body.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop');
        
        // 新しいビューポートクラスを追加
        if (width < 768) {
            body.classList.add('viewport-mobile');
        } else if (width < 1024) {
            body.classList.add('viewport-tablet');
        } else {
            body.classList.add('viewport-desktop');
        }
    }
    
    // 初期実行
    updateViewportClass();
    
    // リサイズ時に更新（デバウンス処理）
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateViewportClass, 100);
    });
}

/**
 * 簡易アナリティクス
 */
function initializeAnalytics() {
    // CTAボタンのクリック追跡
    const ctaButtons = document.querySelectorAll('[class*="btn"]');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const href = this.getAttribute('href');
            
            if (href && href.includes('instagram.com')) {
                trackEvent('Social', 'instagram_click', buttonText);
            } else if (href && href.includes('maps.app.goo.gl')) {
                trackEvent('Location', 'map_click', buttonText);
            } else {
                trackEvent('CTA', 'click', buttonText);
            }
        });
    });

    // ページビュー
    trackEvent('Page', 'view', 'hinokura_lp');
    
    // スクロール深度追跡
    initializeScrollTracking();
}

/**
 * スクロール深度追跡
 */
function initializeScrollTracking() {
    let maxScroll = 0;
    const scrollDepths = [25, 50, 75, 100];
    const trackedDepths = new Set();
    
    function trackScrollDepth() {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                    trackedDepths.add(depth);
                    trackEvent('Scroll', 'depth', `${depth}%`);
                }
            });
        }
    }
    
    // スクロールイベントのスロットリング
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(trackScrollDepth, 100);
    });
}

/**
 * イベント追跡関数
 */
function trackEvent(category, action, label) {
    // 開発環境でのログ出力
    if (window.console && console.log) {
        console.log(`Analytics: ${category} - ${action} - ${label}`);
    }
    
    // Google Analytics 4 連携例（実装時に有効化）
    // if (typeof gtag === 'function') {
    //     gtag('event', action, {
    //         event_category: category,
    //         event_label: label
    //     });
    // }
}

/**
 * レスポンシブ画像の最適化
 */
function optimizeImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    // Intersection Observer for lazy loading fallback
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/**
 * エラーハンドリング
 */
window.addEventListener('error', function(e) {
    trackEvent('Error', 'javascript', e.message);
});

/**
 * パフォーマンス計測
 */
function measurePerformance() {
    window.addEventListener('load', function() {
        // ページロード時間を計測
        const loadTime = performance.now();
        trackEvent('Performance', 'load_time', Math.round(loadTime));
        
        // Core Web Vitals の計測
        if ('PerformanceObserver' in window) {
            // First Contentful Paint
            const fcpObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        trackEvent('Performance', 'FCP', Math.round(entry.startTime));
                    }
                });
            });
            
            try {
                fcpObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                // Performance API 未対応ブラウザでは無視
            }
        }
    });
}

/**
 * モバイルデバイス検出
 */
function isMobileDevice() {
    return window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * タッチデバイス最適化
 */
function optimizeForTouch() {
    if (isMobileDevice()) {
        // タッチデバイス用のクラスを追加
        document.body.classList.add('touch-device');
        
        // iOS Safariのバウンススクロール無効化
        document.addEventListener('touchmove', function(e) {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

/**
 * 外部リンクの安全性確保
 */
function secureExternalLinks() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        // rel属性がない場合は追加
        if (!link.getAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
        
        // セキュリティ強化
        link.addEventListener('click', function() {
            const href = this.getAttribute('href');
            if (href && (href.includes('instagram.com') || href.includes('maps.app.goo.gl'))) {
                // 公式リンクのみ許可
                return true;
            }
        });
    });
}

/**
 * デバッグ用ユーティリティ（開発環境のみ）
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.HINOKURA_DEBUG = {
        trackEvent,
        isMobileDevice,
        checkViewport
    };
    
    // デバッグ情報をコンソールに出力
    console.log('🍠 つぼ焼き芋 火乃蔵 LP - Debug Mode');
    console.log('Viewport:', isMobileDevice() ? 'Mobile' : 'Desktop');
    console.log('Screen Size:', `${window.innerWidth}x${window.innerHeight}`);
}

// 初期化実行
optimizeImages();
measurePerformance();
optimizeForTouch();
secureExternalLinks();