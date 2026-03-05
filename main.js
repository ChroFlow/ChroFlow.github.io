/* ChroFlow Homepage — main.js
 * Responsibilities:
 *   1. i18n engine — applyTranslations(lang), language switcher, persistence
 *   2. Topnav — IntersectionObserver on #hero → reveal/hide navbar
 *   3. Reveal on scroll — .reveal-on-scroll → .--visible
 *   4. Features sticky scroll — IntersectionObserver swaps active shot/step
 *   5. Download — platform detection highlights the right button
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   1. i18n ENGINE
   ══════════════════════════════════════════════════════════ */

/**
 * Apply all translations for a given language code.
 * Reads I18N from i18n.js (must be loaded before this script).
 * @param {string} lang - e.g. "en", "zh"
 */
function applyTranslations(lang) {
  if (typeof I18N === 'undefined') {
    console.warn('[ChroFlow i18n] I18N not loaded — check i18n.js script order.');
    return;
  }

  const dict = I18N[lang] || I18N['en'];
  if (!dict) return;

  // Update <html> attributes
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;

  // data-i18n → textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  // data-i18n-html → innerHTML  (use only for trusted, authored strings)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  // Update lang switcher label
  const switcher = document.getElementById('lang-switcher');
  if (switcher) switcher.textContent = lang.toUpperCase();
}

/** Detect initial language: localStorage → browser → 'en' */
function detectLang() {
  const saved = localStorage.getItem('chroflow-lang');
  if (saved && I18N && I18N[saved]) return saved;

  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  if (I18N && I18N[browser]) return browser;

  return 'en';
}

// Boot i18n
let currentLang = 'en';
document.addEventListener('DOMContentLoaded', () => {
  if (typeof I18N !== 'undefined') {
    currentLang = detectLang();
    applyTranslations(currentLang);
  }
});

/* Language switcher button */
const langSwitcher = document.getElementById('lang-switcher');
if (langSwitcher) {
  langSwitcher.addEventListener('click', () => {
    if (typeof I18N === 'undefined') return;
    const langs = Object.keys(I18N);
    const idx   = langs.indexOf(currentLang);
    currentLang = langs[(idx + 1) % langs.length];
    applyTranslations(currentLang);
    try { localStorage.setItem('chroflow-lang', currentLang); } catch (_) {}
  });
}


/* ══════════════════════════════════════════════════════════
   2. TOP NAV — show after scrolling past hero
   ══════════════════════════════════════════════════════════ */

const topnav = document.getElementById('topnav');
const heroSection = document.getElementById('hero');

if (topnav && heroSection) {
  const navObserver = new IntersectionObserver(
    ([entry]) => {
      // When hero leaves the viewport → show nav; when it enters → hide nav
      topnav.classList.toggle('topnav--hidden', entry.isIntersecting);
    },
    { threshold: 0.05 }   // fire when ≥5% of hero is visible
  );
  navObserver.observe(heroSection);
}

/* Smooth anchor scroll (respects prefers-reduced-motion) */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  });
});


/* ══════════════════════════════════════════════════════════
   3. REVEAL ON SCROLL
   ══════════════════════════════════════════════════════════ */

(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  if (!revealEls.length) return;

  // Honour prefers-reduced-motion — immediately show everything
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('--visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('--visible');
          revealObserver.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach(el => revealObserver.observe(el));
})();


/* ══════════════════════════════════════════════════════════
   4. FEATURES — PINNED SCROLL
   IntersectionObserver fires when a .feat-step enters the
   central 20% of the viewport (rootMargin -40% 0px -40% 0px).
   Swaps active screenshot in the sticky pane.
   ══════════════════════════════════════════════════════════ */

(function initFeatures() {
  const featSteps = document.querySelectorAll('.feat-step');
  const featShots = document.querySelectorAll('.features__shots .feat-shot');

  if (!featSteps.length || !featShots.length) return;

  // Build a map: stepEl → { shot, video } for steps whose shot contains a <video>
  const scrubMap = new Map();
  featSteps.forEach(step => {
    const shotId = step.dataset.shot;
    if (!shotId) return;
    const shot = document.getElementById(shotId);
    if (!shot) return;
    const v = shot.querySelector('video');
    if (v) scrubMap.set(step, { shot, video: v });
  });

  /** Activate a step and its corresponding screenshot */
  function activateStep(step) {
    featSteps.forEach(s => s.classList.remove('is-active'));
    featShots.forEach(s => s.classList.remove('active'));

    step.classList.add('is-active');
    const shotId = step.dataset.shot;
    if (shotId) {
      const shot = document.getElementById(shotId);
      if (shot) shot.classList.add('active');
    }
  }

  /**
   * Scroll-scrub: map the card's position in the viewport to video.currentTime.
   * progress=0 when the card's bottom first enters the viewport bottom (card appears).
   * progress=1 when the card's top reaches the viewport top (card about to leave).
   * Scrolling up naturally reverses the video.
   */
  function scrubVideos() {
    const viewH = window.innerHeight;
    scrubMap.forEach(({ video }, step) => {
      if (!video.duration) return;
      const card = step.querySelector('.feat-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      // travel distance: card.bottom goes from viewH (enter) → r.height (card.top=0)
      const range = Math.max(1, viewH - r.height);
      const progress = Math.max(0, Math.min(1, (viewH - r.bottom) / range));
      video.currentTime = progress * video.duration;
    });
  }

  /**
   * After the last step, translate the sticky bg upward in sync with
   * the download section rising from below.
   * Spacer = 200vh: first 100vh = hold; second 100vh = exit animation.
   * When spacer.top hits 0, download appears at viewport bottom simultaneously.
   */
  const stickyBg  = document.querySelector('.features__sticky-bg');
  const endSpacer = document.querySelector('.features__end-spacer');

  function updateStickyExit() {
    if (!stickyBg || !endSpacer) return;
    const viewH     = window.innerHeight;
    const spacerTop = endSpacer.getBoundingClientRect().top;

    if (spacerTop <= 0) {
      // Exit phase: progress 0→1 as spacer.top goes 0→-viewH
      const progress = Math.max(0, Math.min(1, -spacerTop / viewH));
      stickyBg.style.transform = `translateY(${-progress * viewH}px)`;
    } else {
      stickyBg.style.transform = '';
    }
  }

  /** Pick whichever card has the most visible pixels on screen */
  function update() {
    const viewH = window.innerHeight;
    let best = null;
    let bestArea = 0;

    featSteps.forEach(step => {
      const card = step.querySelector('.feat-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, viewH) - Math.max(r.top, 0));
      if (visible > bestArea) { bestArea = visible; best = step; }
    });

    if (best) {
      activateStep(best);
    } else {
      // No card visible — snap to boundary step based on scroll position
      const firstCard = featSteps[0]?.querySelector('.feat-card');
      const lastCard  = featSteps[featSteps.length - 1]?.querySelector('.feat-card');
      if (firstCard && lastCard) {
        const firstTop   = firstCard.getBoundingClientRect().top;
        const lastBottom = lastCard.getBoundingClientRect().bottom;
        if (firstTop > viewH) {
          activateStep(featSteps[0]);                       // above features → step 1
        } else if (lastBottom < 0) {
          activateStep(featSteps[featSteps.length - 1]);    // below features → last step
        }
      }
    }
    scrubVideos();
    updateStickyExit();
  }

  // Hide each video until its first frame at the correct scroll position is decoded,
  // then fade in — this eliminates the black-frame flash on initial load.
  scrubMap.forEach(({ video }) => {
    video.style.opacity = '0';
    video.style.transition = 'opacity 0.3s ease';
    video.addEventListener('seeked', () => { video.style.opacity = '1'; }, { once: true });
    video.addEventListener('loadedmetadata', scrubVideos);
  });

  let raf = false;
  window.addEventListener('scroll', () => {
    if (!raf) { raf = true; requestAnimationFrame(() => { update(); raf = false; }); }
  }, { passive: true });

  update();

  /* Screenshot image error → keep placeholder visible */
  document.querySelectorAll('.feat-shot img').forEach(img => {
    img.addEventListener('error', () => {
      const shot = img.closest('.feat-shot');
      if (shot) shot.classList.add('feat-shot--placeholder');
      img.style.display = 'none';
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   5. VIDEO — per-video style overrides from data attributes
   Supported attributes on <video>:
     data-video-scale  — zoom factor  (e.g. "1.15")
     data-video-pos    — object-position (e.g. "center top", "20% 50%")
     data-video-fit    — object-fit ("cover" | "contain"), default cover
   ══════════════════════════════════════════════════════════ */

document.querySelectorAll('.feat-shot video').forEach(v => {
  const { videoScale, videoPos, videoFit } = v.dataset;
  if (videoScale) v.style.transform = `scale(${videoScale})`;
  if (videoPos)   v.style.objectPosition = videoPos;
  if (videoFit)   v.style.objectFit = videoFit;
});


/* ══════════════════════════════════════════════════════════
   6. DOWNLOAD — platform detection
   Highlights the button matching the user's OS.
   ══════════════════════════════════════════════════════════ */

(function initPlatformDetection() {
  const btnMac = document.getElementById('btn-mac');
  const btnWin = document.getElementById('btn-win');
  if (!btnMac || !btnWin) return;

  const ua = navigator.userAgent;
  const isMac     = /Mac/.test(ua) && !/iPhone|iPad/.test(ua);
  const isWindows = /Win/.test(ua);

  if (isMac)     btnMac.classList.add('is-platform');
  if (isWindows) btnWin.classList.add('is-platform');

  // Show install guide on click
  const guideMac = document.getElementById('guide-mac');
  const guideWin = document.getElementById('guide-win');

  function showGuide(panel) {
    [guideMac, guideWin].forEach(p => { p.hidden = true; });
    panel.hidden = false;
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  btnMac.addEventListener('click', () => showGuide(guideMac));
  btnWin.addEventListener('click', () => showGuide(guideWin));
})();
