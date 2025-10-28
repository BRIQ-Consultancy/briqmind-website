'use strict';

// ======================== VIDEO & OBSERVER YONETIMI ========================
const resourceManager = {
    videos: new Set(),
    observers: new Set(),
    
    registerVideo(video) {
        this.videos.add(video);
    },
    
    registerObserver(observer) {
        this.observers.add(observer);
    },
    
    cleanup() {
        this.videos.forEach(video => {
            video.pause();
            video.removeAttribute('src');
            video.load();
        });
        this.observers.forEach(observer => observer.disconnect());
        this.videos.clear();
        this.observers.clear();
    }
};

// Global state for video controls
const heroSliderState = {
    currentIndex: 0,
    playActiveVideo: null
};

document.addEventListener('DOMContentLoaded', () => {

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.querySelector('.nav__overlay');
    const body = document.body;

    // ======================== NAVBAR MENU RESPONSIVE ========================
    const toggleNav = (forceClose = false) => {
    const isActive = body.classList.contains('nav-active');
    const html = document.documentElement;

    if (forceClose || isActive) {
        body.classList.remove('nav-active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Menüyü aç');
        
        html.style.overflow = '';
        body.style.overflow = '';

    } else {
        body.classList.add('nav-active');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Menüyü kapat');

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
    }
    };

    if (navToggle) {
        navToggle.addEventListener('click', () => toggleNav());
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => toggleNav(true));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('nav-active')) {
            toggleNav(true);
        }
    });

    // ======================== DÜZGÜN SMOOTH SCROLL ========================
    const scrollToSection = (targetId) => {
        const target = document.querySelector(targetId);
        if (!target) return;

        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        // ÖNCE GÖRSELLERE YÜKSEKLİK VER (lazy load için)
        const images = target.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            if (!img.style.minHeight && img.getAttribute('height')) {
                img.style.minHeight = img.getAttribute('height') + 'px';
            }
        });
        
        // SCROLL ET (düzeltme ile)
        const doScroll = () => {
            const targetPosition = target.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = targetPosition - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        };
        
        // İLK SCROLL
        doScroll();
        
        // GÖRSELLER YÜKLENİRKEN DÜZELT (1 kere)
        setTimeout(() => {
            doScroll();
        }, 500);
    };

    // HASH DEĞİŞİNCE GİT
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash) {
            scrollToSection(hash);
        }
    });

    // SAYFA YÜKLENDİĞİNDE HASH VARSA GİT
    const handleHashOnLoad = () => {
        const hash = window.location.hash;
        
        if (hash) {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
            
            window.scrollTo(0, 0);
            
            // SAYFA TAMAMEN HAZIR OLUNCA GİT
            const scrollWhenReady = () => {
                // Tüm görseller yüklendi mi kontrol et
                const images = document.querySelectorAll('img');
                const allLoaded = Array.from(images).every(img => img.complete);
                
                if (allLoaded || document.readyState === 'complete') {
                    setTimeout(() => scrollToSection(hash), 300);
                } else {
                    window.addEventListener('load', () => {
                        setTimeout(() => scrollToSection(hash), 300);
                    });
                }
            };
            
            scrollWhenReady();
        }
    };

    handleHashOnLoad();

    // NAV MENU CLICK - SMOOTH SCROLL
    if (navMenu) {
        navMenu.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            const parentItem = link.closest('.nav__item');
            const isDropdown = parentItem && parentItem.classList.contains('dropdown');

            // Aynı sayfa içi linkler (#contact gibi)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                if (window.innerWidth <= 768) {
                    if (isDropdown && link.classList.contains('nav__link')) {
                        parentItem.classList.toggle('is-open');
                        return;
                    }
                    toggleNav(true);
                }
                
                // HASH'İ GÜNCELLE
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    window.location.hash = href;
                }
                
                // SMOOTH SCROLL
                scrollToSection(href);
                
                return;
            }

            if (window.innerWidth <= 768) {
                if (isDropdown && link.classList.contains('nav__link')) {
                    e.preventDefault();
                    parentItem.classList.toggle('is-open');
                } else {
                    toggleNav(true);
                }
            }
        });
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768 && body.classList.contains('nav-active')) {
                toggleNav(true);
            }
        }, 150);
    });


// ======================== DIL DEGISTIRME (LANGUAGE SWITCHER) ========================

// Bu fonksiyon, sayfa yüklendiğinde aktif dili algılayıp buton ve menüyü günceller.
const updateLangSwitcherDisplay = () => {
    const langSwitcher = document.querySelector('.footer .lang-switcher');
    if (!langSwitcher) return;

    const button = langSwitcher.querySelector('.lang-switcher__button');
    const langItem = langSwitcher.querySelector('.lang-switcher__item');

    // Her iki dil için buton ve menü HTML içerikleri
    const tr_button_html = `<svg class="lang-switcher__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 341"><rect width="512" height="341" fill="#E30A17"/><circle cx="258" cy="170.5" r="102" fill="#fff"/><circle cx="275" cy="170.5" r="85" fill="#E30A17"/><path fill="#fff" d="m320 161-28 18 11-29-28-18h34l11-29 11 29h34l-28 18 11 29z"/></svg> <span>TR</span> <i class='bx bx-chevron-down lang-switcher__arrow'></i>`;
    const en_item_html = `<svg class="lang-switcher__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 341"><rect width="512" height="341" fill="#012169"/><path fill="#FFF" d="M0 0l512 341M512 0L0 341"/><path fill="#FFF" d="M213 0h86v341h-86z"/><path fill="#FFF" d="M0 114h512v113H0z"/><path fill="#C8102E" d="M0 137h512v68H0z"/><path fill="#C8102E" d="M230 0h52v341h-52z"/><path stroke="#FFF" stroke-width="64" d="M0 0l512 341M512 0L0 341"/><path stroke="#C8102E" stroke-width="43" d="M0 0l512 341M512 0L0 341"/></svg> <span>EN</span>`;
    
    const en_button_html = `<svg class="lang-switcher__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 341"><rect width="512" height="341" fill="#012169"/><path fill="#FFF" d="M0 0l512 341M512 0L0 341"/><path fill="#FFF" d="M213 0h86v341h-86z"/><path fill="#FFF" d="M0 114h512v113H0z"/><path fill="#C8102E" d="M0 137h512v68H0z"/><path fill="#C8102E" d="M230 0h52v341h-52z"/><path stroke="#FFF" stroke-width="64" d="M0 0l512 341M512 0L0 341"/><path stroke="#C8102E" stroke-width="43" d="M0 0l512 341M512 0L0 341"/></svg> <span>EN</span> <i class='bx bx-chevron-down lang-switcher__arrow'></i>`;
    const tr_item_html = `<svg class="lang-switcher__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 341"><rect width="512" height="341" fill="#E30A17"/><circle cx="258" cy="170.5" r="102" fill="#fff"/><circle cx="275" cy="170.5" r="85" fill="#E30A17"/><path fill="#fff" d="m320 161-28 18 11-29-28-18h34l11-29 11 29h34l-28 18 11 29z"/></svg> <span>TR</span>`;

    // DÜZELTME: URL'deki dosya adının "_eng.html" ile bitip bitmediğini kontrol et
    const isEnglish = window.location.pathname.endsWith('_eng.html');

    if (isEnglish) {
        button.innerHTML = en_button_html;
        langItem.innerHTML = tr_item_html;
    } else {
        button.innerHTML = tr_button_html;
        langItem.innerHTML = en_item_html;
    }
};

// Sayfa yüklendiğinde gösterimi güncelle
updateLangSwitcherDisplay();

// Bu bölüm, dropdown menüsünün açılıp kapanma işlevselliğini yönetir.
const langSwitcher = document.querySelector('.footer .lang-switcher');
    
if (langSwitcher) {
    const button = langSwitcher.querySelector('.lang-switcher__button');
    const langItem = langSwitcher.querySelector('.lang-switcher__item');

    const closeDropdown = () => {
        langSwitcher.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleEscapeKey);
    };

    const openDropdown = () => {
        langSwitcher.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleEscapeKey);
    };

    const handleOutsideClick = (event) => {
        if (!langSwitcher.contains(event.target)) {
            closeDropdown();
        }
    };

    const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
            closeDropdown();
        }
    };

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = langSwitcher.classList.contains('is-open');
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    // Bu fonksiyon, diller arasında geçiş yapar.
    const switchLanguage = () => {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        // DÜZELTME: Dosya adını path'den alıyoruz.
        const fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
        const isEnglish = fileName.endsWith('_eng.html');
        
        let newFileName;
        
        if (isEnglish) {
            // İngilizceden Türkçeye geçiş: "_eng.html" kısmını ".html" ile değiştir.
            newFileName = fileName.replace('_eng.html', '.html');
        } else {
            // Türkçeden İngilizceye geçiş: ".html" kısmını "_eng.html" ile değiştir.
            newFileName = fileName.replace('.html', '_eng.html');
        }
        
        // DÜZELTME: Yalnızca dosya adını kullanarak yönlendirme yap, klasör ekleme.
        window.location.href = newFileName + currentHash;
    };

    if (langItem) {
        langItem.addEventListener('click', (e) => {
            e.preventDefault();
            switchLanguage();
        });
    }
}
    
    // ======================== VIDEO SLIDER ========================
    const sliderContainer = document.querySelector('.hero__slider-container');
    if (sliderContainer) {
        const slides = document.querySelectorAll('.hero__slide');
        const videos = document.querySelectorAll('.hero__video');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        const totalSlides = slides.length;

        sliderContainer.style.width = `${totalSlides * 100}%`;

        slides.forEach(slide => {
            slide.style.width = `${100 / totalSlides}%`;
        });

        videos.forEach(v => resourceManager.registerVideo(v));

        const playActiveVideo = (index) => {
            videos.forEach((video, i) => {
                if (i === index) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        };

        heroSliderState.playActiveVideo = playActiveVideo;

        const goToSlide = (index) => {
            heroSliderState.currentIndex = index;
            requestAnimationFrame(() => {
                sliderContainer.style.transform = `translateX(-${index * 100 / totalSlides}%)`;
                playActiveVideo(index);
            });
        };

        const showNextSlide = () => {
            heroSliderState.currentIndex = (heroSliderState.currentIndex + 1) % totalSlides;
            goToSlide(heroSliderState.currentIndex);
        };

        const showPrevSlide = () => {
            heroSliderState.currentIndex = (heroSliderState.currentIndex - 1 + totalSlides) % totalSlides;
            goToSlide(heroSliderState.currentIndex);
        };

        nextBtn.addEventListener('click', showNextSlide);
        prevBtn.addEventListener('click', showPrevSlide);
        
        goToSlide(0);

        // CTA buton yönetimi
        const ctaButtons = document.querySelectorAll('.hero__cta');
        let ctaTimeout = null;

        const showCta = (videoIndex) => {
            ctaButtons.forEach(btn => {
                btn.classList.remove('is-visible');
            });

            if (ctaTimeout) {
                clearTimeout(ctaTimeout);
            }

            ctaTimeout = setTimeout(() => {
                ctaButtons.forEach(btn => {
                    const btnVideo = parseInt(btn.getAttribute('data-video'));
                    if (btnVideo === videoIndex) {
                        btn.classList.add('is-visible');
                    }
                });
            }, 1500);
        };

        nextBtn.addEventListener('click', () => showCta(heroSliderState.currentIndex));
        prevBtn.addEventListener('click', () => showCta(heroSliderState.currentIndex));

        showCta(0);

    }

    // ======================== SCROLL ANIMASYONLARI ========================
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const fadeInObserver = new IntersectionObserver(observerCallback, observerOptions);
    resourceManager.registerObserver(fadeInObserver);

    fadeElements.forEach(el => fadeInObserver.observe(el));

    // ======================== MARQUEE LISTESI ========================
    const marqueeInners = document.querySelectorAll('.marquee__inner');

    if (marqueeInners.length > 0) {
        marqueeInners.forEach(marqueeInner => {
            if (marqueeInner.dataset.cloned === 'true') return;

            const originalWidth = marqueeInner.scrollWidth;
            marqueeInner.style.setProperty('--marquee-width', `${originalWidth}px`);

            const content = Array.from(marqueeInner.children);
            content.forEach(item => {
                const clone = item.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.setAttribute('tabindex', '-1');
                marqueeInner.appendChild(clone);
            });

            marqueeInner.dataset.cloned = 'true';
        });
    }

    // ======================== ARAŞTIRMA SLIDER ========================
    const researchSliderWrapper = document.querySelector('.research__slider-wrapper');

    if (researchSliderWrapper) {
        const researchCards = document.querySelectorAll('.research__card');
        const researchPrevBtn = document.getElementById('researchPrevBtn');
        const researchNextBtn = document.getElementById('researchNextBtn');

        let researchCurrentIndex = 0;
        const researchTotalSlides = researchCards.length;

        const goToResearchSlide = (index) => {
            requestAnimationFrame(() => {
                researchCards.forEach((card, i) => {
                    if (i === index) {
                        card.classList.add('is-active');
                        card.style.zIndex = '2';
                    } else {
                        card.classList.remove('is-active');
                        card.style.zIndex = '1';
                    }
                });
            });
        };

        const showNextResearchSlide = () => {
            researchCurrentIndex = (researchCurrentIndex + 1) % researchTotalSlides;
            goToResearchSlide(researchCurrentIndex);
        };

        const showPrevResearchSlide = () => {
            researchCurrentIndex = (researchCurrentIndex - 1 + researchTotalSlides) % researchTotalSlides;
            goToResearchSlide(researchCurrentIndex);
        };

        researchNextBtn.addEventListener('click', showNextResearchSlide);
        researchPrevBtn.addEventListener('click', showPrevResearchSlide);

        if(researchCards.length > 0) {
            setTimeout(() => researchCards[0].classList.add('is-active'), 100);
        }
    }

    // ======================== TIMELINE KISMI ========================
    const timelineContainer = document.querySelector('.timeline__container');

    if (timelineContainer) {
        const timelineItems = document.querySelectorAll('.timeline__item[data-index]');
        const progressBar = document.querySelector('.timeline__progress');

        if (timelineItems.length > 0 && progressBar) {

            let ticking = false;

            const handleTimelineScroll = (entries) => {
                if (ticking) {
                    return;
                }
                ticking = true;

                requestAnimationFrame(() => {
                    let activeItem = null;

                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            activeItem = entry.target;
                        }
                    });

                    if (activeItem) {
                        const dot = activeItem.querySelector('.timeline__dot');
                        if (dot) {
                            const containerRect = timelineContainer.getBoundingClientRect();
                            const dotRect = dot.getBoundingClientRect();
                            const newHeight = (dotRect.top + dotRect.height / 2) - containerRect.top;
                            progressBar.style.height = `${newHeight}px`;
                        }
                    } else {
                        const containerRect = timelineContainer.getBoundingClientRect();
                        const viewportCenter = window.innerHeight / 2;

                        if (containerRect.bottom < viewportCenter) {
                            progressBar.style.height = '100%';
                        } 
                        else if (containerRect.top > viewportCenter) {
                            progressBar.style.height = '0px';
                        }
                    }

                    ticking = false;
                });
            };

            const timelineObserver = new IntersectionObserver(handleTimelineScroll, {
                rootMargin: '-50% 0px -50% 0px',
                threshold: 0
            });

            resourceManager.registerObserver(timelineObserver);
            timelineItems.forEach(item => timelineObserver.observe(item));
        }
    }

    // ======================== STORY VIDEOLARI & HIGHLIGHT ========================
    const storySection = document.querySelector('.story-simple');

    if (storySection) {
        const storyHeader = storySection.querySelector('.story-simple__header');
        const storyMotto = storySection.querySelector('.story-simple__motto-container');
        const storyGrids = storySection.querySelectorAll('.story-simple__grid');
        const storyVideos = storySection.querySelectorAll('.story-simple__video');

        const storyTitle = storyHeader?.querySelector('.section__title');
        const mottoText = storyMotto?.querySelector('.story-simple__motto');
        if (storyTitle) storyTitle.setAttribute('data-text', storyTitle.textContent);
        if (mottoText) mottoText.setAttribute('data-text', mottoText.textContent);
        
        const allStoryElements = [...storyGrids, storyHeader, storyMotto].filter(Boolean);
        let activeElement = null;
        let ticking = false;

        const deactivateAll = () => {
            storyGrids.forEach(grid => {
                grid.querySelector('.story-simple__content')?.classList.remove('is-highlighted');
                const video = grid.querySelector('.story-simple__video');
                if (video) video.pause();
            });
            storyHeader?.classList.remove('is-glowing');
            storyMotto?.classList.remove('is-glowing');
        };

        const scrollHandler = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const viewportCenter = window.innerHeight / 2;
                    let closestElement = null;
                    let minDistance = Infinity;

                    allStoryElements.forEach(element => {
                        const rect = element.getBoundingClientRect();
                        if (rect.top < window.innerHeight && rect.bottom > 0) {
                            const elementCenter = rect.top + rect.height / 2;
                            const distance = Math.abs(viewportCenter - elementCenter);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestElement = element;
                            }
                        }
                    });

                    if (closestElement !== activeElement) {
                        deactivateAll();
                        if (closestElement?.classList.contains('story-simple__grid')) {
                            closestElement.querySelector('.story-simple__content')?.classList.add('is-highlighted');
                            closestElement.querySelector('.story-simple__video')?.play().catch(() => {});
                        } else if (closestElement === storyHeader) {
                            storyHeader.classList.add('is-glowing');
                        } else if (closestElement === storyMotto) {
                            storyMotto.classList.add('is-glowing');
                        }
                        activeElement = closestElement;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        allStoryElements.forEach(el => fadeInObserver.observe(el));
        resourceManager.registerObserver(fadeInObserver);

        const sectionObserver = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                document.addEventListener('scroll', scrollHandler, { passive: true });
            } else {
                document.removeEventListener('scroll', scrollHandler);
                deactivateAll();
                activeElement = null;
            }
        }, { rootMargin: '0px', threshold: 0 });

        sectionObserver.observe(storySection);
        resourceManager.registerObserver(sectionObserver);

        storyVideos.forEach(video => {
        video.pause();
        resourceManager.registerVideo(video);
        });
    }
    
    // ======================== CONTACT FORM (SANDVIC) ========================
    const contactForm = document.getElementById('contact-form');
    const submitBtn = contactForm?.querySelector('.form-submit-button');

    const getToastHost = (() => {
    let host = null;
    return () => {
        if (host) return host;
        host = document.createElement('div');
        host.className = 'toast-container';
        host.setAttribute('aria-live', 'polite');
        document.body.appendChild(host);
        return host;
    };
    })();

    function showToast(message, kind = 'success') {
    const host = getToastHost();
    const el = document.createElement('div');
    el.className = `toast toast--${kind}`;
    el.textContent = message;
    host.appendChild(el);

    requestAnimationFrame(() => el.classList.add('toast--in'));

    const ttl = setTimeout(() => {
        el.classList.remove('toast--in');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, 3000);

    el.addEventListener('click', () => {
        clearTimeout(ttl);
        el.classList.remove('toast--in');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
    });
    }

    if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        submitBtn?.setAttribute('disabled', 'true');
        submitBtn?.classList.add('is-loading');

        try {
            const fd = new FormData(contactForm);
            const resp = await fetch(contactForm.action, {
                method: 'POST',
                body: fd,
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });

            if (resp.ok) {
                showToast('Mesajınız gönderildi. En kısa sürede dönüş yapacağız.', 'success');
                contactForm.reset();
            } else {
                showToast('Gönderilemedi. Lütfen alanları kontrol edip tekrar deneyin.', 'error');
            }
            } catch (err) {
            showToast('Bağlantı hatası. İnternetinizi kontrol edip tekrar deneyin.', 'error');
            } finally {
            clearTimeout(timeoutId);
            submitBtn?.removeAttribute('disabled');
            submitBtn?.classList.remove('is-loading');
            }
        });
    }

    // ======================== COOKIE MODAL ODAK YONETIMI (FOCUS TRAP) ========================
    const handleFocusTrap = (e) => {
        if (e.key !== 'Tab') return;

        const cookieModal = document.getElementById('cookieModal');
        if (!cookieModal.classList.contains('active')) return;

        const focusableElements = Array.from(
            cookieModal.querySelectorAll(
                'button, [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
            )
        );
        
        if (focusableElements.length === 0) {
            e.preventDefault();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        e.preventDefault();

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
            } else {
                const currentIndex = focusableElements.indexOf(document.activeElement);
                const prevElement = focusableElements[currentIndex - 1] || lastElement;
                prevElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
            } else {
                const currentIndex = focusableElements.indexOf(document.activeElement);
                const nextElement = focusableElements[currentIndex + 1] || firstElement;
                nextElement.focus();
            }
        }
    };

    // ======================== SCROLL DURUMUNDA LOGO ANIMASYONU ========================
    const header = document.querySelector('.header');
    const briqSpan = document.querySelector('.logo-text--briq');
    const mindSpan = document.querySelector('.logo-text--mind');
    const wrapper = document.querySelector('.logo-text-wrapper');

    if (!header || !briqSpan || !mindSpan || !wrapper) return;

    const calculateLogoShift = () => {
        const briqWidth = briqSpan.offsetWidth;
        const mindMargin = parseFloat(window.getComputedStyle(mindSpan).marginLeft);
        const totalShift = briqWidth + mindMargin;

        wrapper.style.setProperty('--logo-shift-amount', `${totalShift}px`);
    };

    calculateLogoShift();
    window.addEventListener('resize', calculateLogoShift);

    let isScrolled = false;
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition > 10 && !isScrolled) {
            header.classList.add('nav-scrolled');
            isScrolled = true;
        } else if (scrollPosition <= 10 && isScrolled) {
            header.classList.remove('nav-scrolled');
            isScrolled = false;
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

// ======================== COOKIE MODAL ========================
    const manageCookiesLink = document.getElementById('manageCookiesLink');
    const cookieModal = document.getElementById('cookieModal');
    const cookieModalOverlay = document.getElementById('cookieModalOverlay');
    const cookieDoneBtn = document.getElementById('cookieDoneBtn');

    const openCookieModal = (e) => {
        e.preventDefault();
        
        cookieModal.classList.add('active');
        cookieModalOverlay.classList.add('active');
        
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');

        window.addEventListener('keydown', handleFocusTrap);

        setTimeout(() => document.getElementById('cookieModal').focus(), 100); 
    };

    const closeCookieModal = () => {
        cookieModal.classList.remove('active');
        cookieModalOverlay.classList.remove('active');
        
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');

        window.removeEventListener('keydown', handleFocusTrap);
    };

    if (manageCookiesLink && cookieModal && cookieModalOverlay && cookieDoneBtn) {
        manageCookiesLink.addEventListener('click', openCookieModal);
        cookieDoneBtn.addEventListener('click', closeCookieModal);
        cookieModalOverlay.addEventListener('click', closeCookieModal);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cookieModal.classList.contains('active')) {
                closeCookieModal();
            }
        });
    }

});

// ======================== GLOBAL TEMIZLIK ========================
window.addEventListener('beforeunload', () => resourceManager.cleanup());

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        resourceManager.videos.forEach(v => v.pause());
    } else {
        if (heroSliderState.playActiveVideo) {
            heroSliderState.playActiveVideo(heroSliderState.currentIndex);
        }
    }
});

