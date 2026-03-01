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

  /** Activate a step and its corresponding screenshot */
  function activateStep(step) {
    // Deactivate all
    featSteps.forEach(s => s.classList.remove('feat-step--active'));
    featShots.forEach(s => s.classList.remove('feat-shot--active'));

    // Activate new
    step.classList.add('feat-step--active');
    const shotId = step.dataset.shot;
    if (shotId) {
      const shot = document.getElementById(shotId);
      if (shot) shot.classList.add('feat-shot--active');
    }
  }

  const featObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activateStep(entry.target);
      });
    },
    { rootMargin: '-40% 0px -40% 0px' }
  );

  featSteps.forEach(step => featObserver.observe(step));

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
   5. DOWNLOAD — platform detection
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
})();
