/* ============================================================
   INTEGRATE.AI — main.js
   Handles:
   - Ambient particle background (canvas)
   - Scroll reveal animations
   - Navigation scroll state + mobile toggle
   - Scroll progress bar

   TOKEN GUIDE: Touch this file only for animation/scroll changes.
   Content lives in index.html. Styles live in style.css.
   ============================================================ */

(function () {
  'use strict';

  /* ── PARTICLE BACKGROUND ─────────────────────────────────── */
  const canvas  = document.getElementById('bg-canvas');
  const ctx     = canvas.getContext('2d');
  let W, H, particles, animFrame;

  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 140;
  const PARTICLE_SPEED  = 0.25;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: randomBetween(-PARTICLE_SPEED, PARTICLE_SPEED),
      vy: randomBetween(-PARTICLE_SPEED, PARTICLE_SPEED),
      r:  randomBetween(0.8, 2.2),
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    /* Move and wrap particles */
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    /* Draw connections */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 77, 0, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }

    /* Draw particle dots */
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 77, 0, 0.35)';
      ctx.fill();
    });

    animFrame = requestAnimationFrame(drawParticles);
  }

  function initCanvas() {
    if (!canvas) return;
    resize();
    createParticles();
    drawParticles();
    window.addEventListener('resize', () => {
      cancelAnimationFrame(animFrame);
      resize();
      createParticles();
      drawParticles();
    });
  }

  /* ── SCROLL PROGRESS BAR ──────────────────────────────────── */
  function initProgressBar() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total    = document.body.scrollHeight - window.innerHeight;
      const pct      = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── NAVIGATION: scroll state ─────────────────────────────── */
  function initNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.background = 'rgba(13,13,13,0.97)';
        nav.style.backdropFilter = 'blur(8px)';
        nav.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
      } else {
        nav.style.background    = 'linear-gradient(to bottom, rgba(13,13,13,0.95), rgba(13,13,13,0))';
        nav.style.backdropFilter = 'blur(2px)';
        nav.style.borderBottom  = 'none';
      }
    }, { passive: true });
  }

  /* ── MOBILE NAV TOGGLE ────────────────────────────────────── */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });

    /* Close when a link is tapped */
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* ── SCROLL REVEAL ────────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach(el => observer.observe(el));
  }

  /* ── HERO BUTTON: boot sequence text ──────────────────────── */
  function initBootButton() {
    const btn = document.getElementById('boot-btn');
    if (!btn) return;

    const original = btn.textContent.trim();
    const sequence = [
      'Connecting…',
      'Analysing workflows…',
      'Deploying tools…',
      'Initialise Productivity Boost →',
    ];

    btn.addEventListener('click', function (e) {
      if (btn.dataset.animating) return;
      btn.dataset.animating = 'true';

      let i = 0;
      const interval = setInterval(() => {
        btn.textContent = sequence[i];
        i++;
        if (i >= sequence.length) {
          clearInterval(interval);
          delete btn.dataset.animating;
          /* Navigate to contact */
          window.location.href = 'contact.html';
        }
      }, 420);
    });
  }

  /* ── ACTIVE NAV LINK on scroll ────────────────────────────── */
  function initActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !links.length) return;

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
          current = sec.id;
        }
      });
      links.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + current
          ? 'var(--accent)'
          : 'var(--text-muted)';
      });
    }, { passive: true });
  }

  /* ── INIT ALL ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initCanvas();
    initProgressBar();
    initNav();
    initMobileNav();
    initReveal();
    initBootButton();
    initActiveLinks();
  });

})();

/* ============================================================
   HUD PANELS + TERMINAL + GSAP SCROLL
   Appended 2026-03-13
   ============================================================ */

/* ── HUD PANEL METRICS ────────────────────────────────────── */
function initHUDPanels() {
  /* Efficiency gains: counts 0 → 40, bar fills to 40% */
  const effEl  = document.getElementById('efficiency-counter');
  const effBar = document.getElementById('efficiency-bar');
  if (effEl) {
    let v = 0;
    const t = setInterval(function () {
      v++;
      effEl.textContent = v;
      if (effBar) effBar.style.width = v + '%';
      if (v >= 40) clearInterval(t);
    }, 38);
  }

  /* Hours freed: ticks up every 3.8 seconds, bar fills toward 1000h */
  const hoursEl  = document.getElementById('hours-counter');
  const hoursBar = document.getElementById('hours-bar');
  if (hoursEl) {
    let h = 847;
    function tickHours() {
      hoursEl.textContent = h;
      if (hoursBar) {
        hoursBar.style.width = Math.min((h / 1000) * 100, 100) + '%';
      }
      h++;
      setTimeout(tickHours, 3800);
    }
    /* Small delay so bar transition is visible on load */
    setTimeout(tickHours, 600);
  }

  /* Admin dots: cycles  .  →  ..  →  ...  →  .  →  ..  →  ... */
  const dotsEl = document.getElementById('admin-dots');
  if (dotsEl) {
    const seq = ['.', '..', '...'];
    let i = 0;
    setInterval(function () {
      i = (i + 1) % seq.length;
      dotsEl.textContent = seq[i];
    }, 500);
  }
}

/* ── TERMINAL CYCLING ─────────────────────────────────────── */
function initTerminal() {
  /* COPY: edit these four lines to change terminal text */
  var lines = [
    'Identifying automatable tasks',
    'Compressing workflows',
    'Initialising efficiency boost',
    'Increasing output',
  ];
  /* /COPY */

  var textEls  = document.querySelectorAll('.t-text');
  var checkEls = document.querySelectorAll('.t-check');
  if (!textEls.length) return;

  var current = 0;

  function typeLine(el, text, checkEl, cb) {
    el.textContent = '';
    if (checkEl) checkEl.textContent = '';
    var i = 0;
    var t = setInterval(function () {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(t);
        setTimeout(function () {
          if (checkEl) checkEl.textContent = ' \u2713';
          if (cb) setTimeout(cb, 350);
        }, 180);
      }
    }, 36);
  }

  function runSequence() {
    textEls.forEach(function (el) { el.textContent = ''; });
    checkEls.forEach(function (el) { el.textContent = ''; });
    current = 0;

    function typeNext() {
      if (current >= textEls.length) {
        setTimeout(runSequence, 2200);
        return;
      }
      typeLine(textEls[current], lines[current], checkEls[current], function () {
        current++;
        typeNext();
      });
    }
    typeNext();
  }

  runSequence();
}

/* ── GSAP SCROLL TRIGGER ──────────────────────────────────── */
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    return;
  }

  /* -- Section scan-lines + heading flicker on entry --------- */
  document.querySelectorAll('.section-scanline').forEach(function (line) {
    var section = line.parentElement;
    gsap.to(line, {
      width: '100%',
      duration: 1.4,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: section,
        start: 'top 62%',   /* fires when top of section hits 62% of viewport height */
        toggleActions: 'play none none none',
        onEnter: function () {
          section.classList.add('section-live');
          setTimeout(function () {
            line.style.transition = 'opacity 1s ease';
            line.style.opacity = '0';
          }, 1800);
        },
      },
    });
  });

  /* -- Service cards: staggered power-on --------------------- */
  var cards = document.querySelectorAll('.service-card');
  cards.forEach(function (card) {
    card.classList.add('gsap-managed');
    card.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2');
  });

  if (cards.length) {
    gsap.to('.service-card.gsap-managed', {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.28,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#services',
        start: 'top 55%',
        toggleActions: 'play none none none',
      },
    });

    /* Orange glow pulse — flash bright then fade, staggered */
    cards.forEach(function (card, i) {
      ScrollTrigger.create({
        trigger: '#services',
        start: 'top 55%',
        once: true,
        onEnter: function () {
          setTimeout(function () {
            card.style.transition = 'box-shadow 0.2s ease';
            card.style.boxShadow = '0 0 36px rgba(255,77,0,0.28), inset 0 0 0 1px rgba(255,77,0,0.35)';
            setTimeout(function () {
              card.style.transition = 'box-shadow 1.2s ease';
              card.style.boxShadow = '';
            }, 700);
          }, i * 280);
        },
      });
    });
  }

  /* -- About stats panel: fade-up stagger -------------------- */
  var aboutStats = document.querySelectorAll('.about-stat');
  if (aboutStats.length) {
    gsap.from(aboutStats, {
      opacity: 0,
      y: 22,
      duration: 0.75,
      stagger: 0.22,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.about-panel',
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* -- FAQ items: flicker on --------------------------------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.classList.add('gsap-managed');
    item.classList.remove('reveal', 'reveal-delay-1');
  });

  if (faqItems.length) {
    gsap.to('.faq-item.gsap-managed', {
      opacity: 1,
      duration: 0.6,
      stagger: { amount: 1.2, from: 'start' },
      ease: 'power1.out',
      scrollTrigger: {
        trigger: '#faq',
        start: 'top 58%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* -- Reviews: slide up staggered --------------------------- */
  gsap.from('.review-card', {
    opacity: 0,
    y: 28,
    duration: 0.8,
    stagger: 0.25,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#reviews',
      start: 'top 60%',
      toggleActions: 'play none none none',
    },
  });

  /* -- Coming soon block ------------------------------------- */
  gsap.from('.coming-soon-block', {
    opacity: 0,
    scale: 0.97,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.coming-soon-block',
      start: 'top 62%',
      toggleActions: 'play none none none',
    },
  });
}

/* ── ADD SCAN-LINES TO SECTIONS ───────────────────────────── */
function addScanlines() {
  var sectionIds = ['services', 'about', 'case-studies', 'reviews', 'faq'];
  sectionIds.forEach(function (id) {
    var sec = document.getElementById(id);
    if (sec) {
      var line = document.createElement('div');
      line.className = 'section-scanline';
      sec.insertBefore(line, sec.firstChild);
    }
  });
}

/* ── INIT NEW MODULES ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  addScanlines();
  initHUDPanels();
  initTerminal();
  initGSAP();
});
