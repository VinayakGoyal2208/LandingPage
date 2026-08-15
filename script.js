(() => {
    const body = document.body;
    const progress = document.querySelector('.scroll-progress-bar');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gsapReady = Boolean(window.gsap && window.ScrollTrigger) && !reducedMotion;

    function updateScroll() {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        if (progress) progress.style.width = `${Math.min(100, (window.scrollY / max) * 100)}%`;
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    if (menuToggle && mobileMenu) {
        const closeMenu = () => {
            mobileMenu.classList.remove('open');
            menuToggle.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            body.classList.remove('menu-open');
        };
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('open');
            menuToggle.classList.toggle('open', open);
            menuToggle.setAttribute('aria-expanded', String(open));
            mobileMenu.setAttribute('aria-hidden', String(!open));
            body.classList.toggle('menu-open', open);
        });

        mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
            closeMenu();
        }));
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) closeMenu();
        });
    }

    function setupMotion() {
        const revealSelector = '.reveal-up, .reveal-left, .reveal-right, .reveal-card, .reveal-project, .reveal-step, .reveal-scale';
        const revealItems = document.querySelectorAll(revealSelector);

        if (gsapReady) {
            const gsap = window.gsap;
            gsap.registerPlugin(window.ScrollTrigger);

            gsap.set('.reveal-tag', { opacity: 0, y: 24 });
            gsap.set('.line-inner', { yPercent: 105, rotateX: -18, transformOrigin: '50% 100%' });
            gsap.set('.hero-bottom-grid', { opacity: 0, y: 46 });

            gsap.timeline({ defaults: { ease: 'power4.out' } })
                .to('.reveal-tag', { opacity: 1, y: 0, duration: .7 })
                .to('.line-inner', { yPercent: 0, rotateX: 0, duration: 1.05, stagger: .12 }, '-=.38')
                .to('.hero-bottom-grid', { opacity: 1, y: 0, duration: .8 }, '-=.55');

            revealItems.forEach((item) => {
                const x = item.classList.contains('reveal-left') ? -54 : item.classList.contains('reveal-right') ? 54 : 0;
                const scale = item.classList.contains('reveal-scale') ? .94 : 1;
                gsap.fromTo(item,
                    { opacity: 0, x, y: x ? 0 : 42, scale },
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: .85,
                        ease: 'power3.out',
                        clearProps: 'transform',
                        scrollTrigger: { trigger: item, start: 'top 84%', once: true }
                    }
                );
            });

            gsap.to('.hero-title', {
                y: -55,
                opacity: .48,
                ease: 'none',
                scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
            });

            window.addEventListener('load', () => window.ScrollTrigger.refresh());
            return;
        }

        if ('IntersectionObserver' in window && !reducedMotion) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            }, { threshold: .12 });
            revealItems.forEach((item) => observer.observe(item));
        } else {
            revealItems.forEach((item) => item.classList.add('is-visible'));
        }
    }

    function setupTypewriter() {
        const typewriter = document.querySelector('#typewriter');
        if (!typewriter) return;
        const roles = [
            'Custom Web Applications',
            'Rudra Gym & Fitness Systems',
            'Solar & Corporate Web Portals',
            'High-Speed Full-Stack Solutions',
            'Interactive GSAP UI & Motion'
        ];
        if (reducedMotion) {
            typewriter.textContent = roles[0];
            return;
        }
        let role = 0;
        let length = 0;
        let deleting = false;
        const type = () => {
            const current = roles[role];
            typewriter.textContent = current.slice(0, length);
            if (!deleting && length < current.length) {
                length += 1;
                window.setTimeout(type, 54);
            } else if (!deleting) {
                deleting = true;
                window.setTimeout(type, 1150);
            } else if (length > 0) {
                length -= 1;
                window.setTimeout(type, 27);
            } else {
                deleting = false;
                role = (role + 1) % roles.length;
                window.setTimeout(type, 180);
            }
        };
        type();
    }

    function setupMagneticButtons() {
        if (reducedMotion || !window.matchMedia('(pointer:fine)').matches) return;
        document.querySelectorAll('.magnetic').forEach((button) => {
            button.addEventListener('pointermove', (event) => {
                const rect = button.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                if (gsapReady) {
                    window.gsap.to(button, { x: x * .22, y: y * .22, duration: .25, ease: 'power2.out' });
                } else {
                    button.style.transform = `translate(${x * .14}px, ${y * .14}px)`;
                }
            }, { passive: true });
            button.addEventListener('pointerleave', () => {
                if (gsapReady) {
                    window.gsap.to(button, { x: 0, y: 0, duration: .75, ease: 'elastic.out(1, .4)', clearProps: 'transform' });
                } else {
                    button.style.transform = '';
                }
            });
        });
    }

    function setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        filterButtons.forEach((button) => button.addEventListener('click', () => {
            const filter = button.dataset.filter || 'all';
            filterButtons.forEach((item) => item.classList.toggle('active', item === button));
            projectCards.forEach((card) => {
                const visible = filter === 'all' || (card.dataset.category || '').split(/\s+/).includes(filter);
                if (gsapReady) {
                    if (visible) card.hidden = false;
                    window.gsap.to(card, {
                        opacity: visible ? 1 : 0,
                        scale: visible ? 1 : .96,
                        duration: .28,
                        onComplete: () => { card.hidden = !visible; }
                    });
                } else {
                    card.hidden = !visible;
                }
            });
            if (gsapReady) window.ScrollTrigger.refresh();
        }));
    }

    function setupForm() {
        const form = document.querySelector('#consult-form');
        const feedback = document.querySelector('#form-feedback');
        const submit = form?.querySelector('.btn-submit');
        if (!form || !feedback || !submit) return;
        const label = submit.querySelector('span');
        const originalText = label?.textContent || 'Submit Consultation Request';

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            submit.disabled = true;
            if (label) label.textContent = 'Sending Consultation Request...';
            feedback.textContent = '';
            feedback.classList.remove('error');

            try {
                const response = await fetch('https://formsubmit.co/ajax/vinayakgoyal2208@gmail.com', {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    body: new FormData(form)
                });
                if (!response.ok) throw new Error('Submission failed');
                feedback.textContent = '✓ Thank you! We will contact you within 24 hours.';
                form.reset();
            } catch (error) {
                feedback.textContent = 'Unable to send right now. Please email vinayakgoyal2208@gmail.com.';
                feedback.classList.add('error');
            } finally {
                submit.disabled = false;
                if (label) label.textContent = originalText;
            }
        });
    }

    function setupCursor() {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        if (!dot || !ring || reducedMotion || !window.matchMedia('(pointer:fine)').matches) return;
        let ringX = innerWidth / 2;
        let ringY = innerHeight / 2;
        let mouseX = ringX;
        let mouseY = ringY;
        window.addEventListener('pointermove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            dot.style.opacity = '1';
            ring.style.opacity = '1';
            dot.style.transform = `translate(${mouseX - 3.5}px, ${mouseY - 3.5}px)`;
        }, { passive: true });
        const follow = () => {
            ringX += (mouseX - ringX) * .16;
            ringY += (mouseY - ringY) * .16;
            ring.style.transform = `translate(${ringX - 17}px, ${ringY - 17}px)`;
            requestAnimationFrame(follow);
        };
        follow();
        document.querySelectorAll('a, button, input, select, textarea').forEach((item) => {
            item.addEventListener('pointerenter', () => ring.classList.add('hover'));
            item.addEventListener('pointerleave', () => ring.classList.remove('hover'));
        });
    }

    function setupCanvas() {
        const canvas = document.querySelector('#hero-canvas');
        if (!canvas || reducedMotion) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        let width = 1;
        let height = 1;
        let dots = [];
        const orbs = [
            { x: .2, y: .28, radius: 230, color: '124,106,255', vx: .00006, vy: .00004 },
            { x: .78, y: .62, radius: 190, color: '200,240,101', vx: -.00005, vy: .00003 },
            { x: .58, y: .18, radius: 135, color: '255,87,34', vx: .00004, vy: -.00004 }
        ];

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const ratio = Math.min(devicePixelRatio || 1, 2);
            width = Math.max(1, rect.width);
            height = Math.max(1, rect.height);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            const spacing = width < 700 ? 54 : 68;
            dots = [];
            for (let y = spacing; y < height; y += spacing) {
                for (let x = spacing; x < width; x += spacing) dots.push({ x, y, phase: Math.random() * Math.PI * 2 });
            }
        };

        const draw = (time = 0) => {
            context.clearRect(0, 0, width, height);
            orbs.forEach((orb, index) => {
                const x = (orb.x + Math.sin(time * orb.vx + index) * .11) * width;
                const y = (orb.y + Math.cos(time * orb.vy + index) * .1) * height;
                const gradient = context.createRadialGradient(x, y, 0, x, y, orb.radius);
                gradient.addColorStop(0, `rgba(${orb.color},.16)`);
                gradient.addColorStop(1, `rgba(${orb.color},0)`);
                context.fillStyle = gradient;
                context.fillRect(x - orb.radius, y - orb.radius, orb.radius * 2, orb.radius * 2);
            });
            dots.forEach((dot) => {
                const pulse = .18 + (Math.sin(time * .0016 + dot.phase) + 1) * .13;
                context.fillStyle = `rgba(248,248,246,${pulse})`;
                context.beginPath();
                context.arc(dot.x, dot.y + Math.sin(time * .0008 + dot.phase) * 3, 1.1, 0, Math.PI * 2);
                context.fill();
            });
            requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();
    }

    setupMotion();
    setupTypewriter();
    setupMagneticButtons();
    setupFilters();
    setupForm();
    setupCursor();
    setupCanvas();
})();
