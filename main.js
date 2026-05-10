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

  document.querySelectorAll('[data-i18n-title-lines]').forEach(el => {
    const key = el.dataset.i18nTitleLines;
    const raw = dict[key];
    if (raw === undefined) return;

    const lines = String(raw)
      .split(/<br\s*\/?>/i)
      .map(line => line.trim())
      .filter(Boolean);
    const lineEls = el.querySelectorAll('.hero__title-line');
    const fallback = String(raw).replace(/<[^>]+>/g, '').trim();

    if (lineEls[0]) lineEls[0].textContent = lines[0] || fallback;
    if (lineEls[1]) {
      lineEls[1].textContent = lines[1] || '';
      lineEls[1].hidden = !lines[1];
    }
  });

}

/** Keep the public page in English. Other dictionaries remain available in i18n.js. */
function detectLang() {
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

/* ══════════════════════════════════════════════════════════
   2. TOP NAV — stays visible from the first screen
   ══════════════════════════════════════════════════════════ */

const topnav = document.getElementById('topnav');
if (topnav) {
  topnav.classList.remove('topnav--hidden');
}

(function initMobileNav() {
  const nav = document.getElementById('topnav');
  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('topnav-panel');
  const scrim = document.getElementById('topnav-scrim');

  if (!nav || !toggle || !panel || !scrim) return;

  const mobileQuery = window.matchMedia('(max-width: 768px)');

  function closeMenu() {
    nav.classList.remove('topnav--menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  function openMenu() {
    nav.classList.add('topnav--menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  }

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('topnav--menu-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  scrim.addEventListener('click', closeMenu);

  panel.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  mobileQuery.addEventListener('change', e => {
    if (!e.matches) closeMenu();
  });
})();

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

(function initPricingPager() {
  const grid = document.querySelector('.pricing__grid');
  const cards = Array.from(document.querySelectorAll('.pricing__grid > *'));
  const buttons = Array.from(document.querySelectorAll('.pricing__pager-btn'));
  if (!grid || cards.length < 2 || !buttons.length) return;

  function setActive(index) {
    buttons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle('is-active', active);
      if (active) {
        button.setAttribute('aria-current', 'step');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }

  function updateActive() {
    const gridRect = grid.getBoundingClientRect();
    const gridCenter = gridRect.left + gridRect.width / 2;
    let activeIndex = 0;
    let activeDistance = Infinity;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - gridCenter);
      if (distance < activeDistance) {
        activeDistance = distance;
        activeIndex = index;
      }
    });

    setActive(activeIndex);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.pricingTarget);
      const target = cards[index];
      if (!target) return;

      const gridRect = grid.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const left = grid.scrollLeft
        + targetRect.left
        - gridRect.left
        - (grid.clientWidth - targetRect.width) / 2;

      grid.scrollTo({
        left: Math.max(0, left),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      setActive(index);
    });
  });

  let pricingPagerRaf = false;
  grid.addEventListener('scroll', () => {
    if (pricingPagerRaf) return;
    pricingPagerRaf = true;
    requestAnimationFrame(() => {
      updateActive();
      pricingPagerRaf = false;
    });
  }, { passive: true });
  window.addEventListener('resize', updateActive);

  updateActive();
})();


/* ══════════════════════════════════════════════════════════
   4. FEATURES — PINNED SCROLL (desktop / landscape)
   IntersectionObserver swaps active screenshot in sticky pane.
   ══════════════════════════════════════════════════════════ */

(function initFeatures() {
  const featSteps = document.querySelectorAll('.feat-step');
  const featShots = document.querySelectorAll('.features__shots .feat-shot');
  const shotsStage = document.querySelector('.features__shots');
  const shotOneStep = document.querySelector('.feat-step[data-shot="shot-1"]');
  const shotTwoStep   = document.querySelector('.feat-step[data-shot="shot-2"]');
  const shotThreeStep = document.querySelector('.feat-step[data-shot="shot-3"]');
  const shotFourStep  = document.querySelector('.feat-step[data-shot="shot-4"]');
  const shotFiveStep  = document.querySelector('.feat-step[data-shot="shot-5"]');
  const shotLabels = document.querySelectorAll('[data-shot-x-var], [data-shot-1-x-var]');
  const featurePager = document.querySelector('.features__pager');
  const featurePagerButtons = document.querySelectorAll('.features__pager-btn');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!featSteps.length || !featShots.length) return;

  const stepByShot = new Map();

  const scrubMap = new Map();
  featSteps.forEach(step => {
    const shotId = step.dataset.shot;
    if (!shotId) return;
    stepByShot.set(shotId, step);
    const shot = document.getElementById(shotId);
    if (!shot) return;
    const v = shot.querySelector('video');
    if (v) scrubMap.set(step, { shot, video: v });
  });

  function getViewportHeight() {
    return window.visualViewport?.height || window.innerHeight;
  }

  function getStepProgress(step, viewH) {
    const r = step.getBoundingClientRect();
    const anchorY = viewH * 0.5;
    return (anchorY - r.top) / Math.max(1, r.height);
  }

  function parseShotX(raw, cardWidth) {
    const value = String(raw || '').trim();
    if (value.endsWith('%')) return cardWidth * parseFloat(value) / 100;
    if (value.endsWith('px')) return parseFloat(value);
    const n = parseFloat(value);
    return Number.isFinite(n) ? cardWidth * n / 100 : cardWidth / 2;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function parseCssLength(raw, percentBasis = 0) {
    const value = String(raw || '').trim();
    const n = parseFloat(value);
    if (!Number.isFinite(n)) return 0;
    if (value.endsWith('rem')) {
      return n * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    if (value.endsWith('em')) {
      return n * parseFloat(getComputedStyle(featurePager || document.body).fontSize);
    }
    if (value.endsWith('vw')) return window.innerWidth * n / 100;
    if (value.endsWith('vh')) return getViewportHeight() * n / 100;
    if (value.endsWith('%')) return percentBasis * n / 100;
    return n;
  }

  function positionFeaturePager(shotId) {
    if (!featurePager || !shotsStage || !shotId) return;
    const shot = document.getElementById(shotId);
    if (!shot) return;

    const stageRect = shotsStage.getBoundingClientRect();
    const shotRect = shot.getBoundingClientRect();
    const stageStyle = getComputedStyle(shotsStage);
    const gap = parseCssLength(stageStyle.getPropertyValue('--features-pager-edge-gap'), shotRect.width);

    featurePager.style.left = `${shotRect.right - stageRect.left + gap}px`;
    featurePager.style.top = `${shotRect.top - stageRect.top + shotRect.height / 2}px`;
  }

  function positionShotLabels() {
    if (!shotsStage || !shotLabels.length) return;

    const stageRect = shotsStage.getBoundingClientRect();
    const stageStyle = getComputedStyle(shotsStage);

    shotLabels.forEach(label => {
      const varName = label.getAttribute('data-shot-x-var') || label.getAttribute('data-shot-1-x-var');
      const cardId = label.getAttribute('data-shot-card') || (label.hasAttribute('data-shot-1-x-var') ? 'shot-1' : '');
      const card = cardId ? document.getElementById(cardId) : null;
      if (!varName || !card) return;

      const cardRect = card.getBoundingClientRect();
      const cardLeft = cardRect.left - stageRect.left;
      const cardRight = cardRect.right - stageRect.left;
      const cardWidth = cardRect.width;
      if (!cardWidth) return;

      const raw = stageStyle.getPropertyValue(varName);
      const desiredCenter = cardLeft + parseShotX(raw, cardWidth);
      const labelWidth = label.getBoundingClientRect().width;
      const half = labelWidth / 2;
      const clampedCenter = labelWidth >= cardWidth
        ? cardLeft + cardWidth / 2
        : clamp(desiredCenter, cardLeft + half, cardRight - half);

      label.style.left = `${clampedCenter}px`;
      label.style.maxWidth = `${cardWidth}px`;
    });
  }

  const unlockedVideos = new Set();
  function unlockVideo(video) {
    if (unlockedVideos.has(video)) return;
    unlockedVideos.add(video);
    video.addEventListener('loadedmetadata', scrubVideos);
    const doUnlock = () => {
      video.play().then(() => {
        video.pause();
        video.currentTime = 0;
        scrubVideos();
      }).catch(() => {
        video.loop = true;
        video.play().catch(() => {});
      });
    };
    if (video.readyState >= 1) {
      doUnlock();
    } else {
      video.addEventListener('loadedmetadata', doUnlock, { once: true });
      video.load();
    }
  }

  function activateStep(step) {
    featSteps.forEach(s => s.classList.remove('is-active'));
    featShots.forEach(s => s.classList.remove('active'));
    step.classList.add('is-active');
    const shotId = step.dataset.shot;
    if (featuresSection && shotId) {
      featuresSection.classList.remove(
        'features--shot-1',
        'features--shot-2',
        'features--shot-3',
        'features--shot-4',
        'features--shot-5'
      );
      featuresSection.classList.add(`features--${shotId}`);
    }
    featurePagerButtons.forEach(button => {
      const active = button.dataset.shotTarget === shotId;
      button.classList.toggle('is-active', active);
      if (active) {
        button.setAttribute('aria-current', 'step');
      } else {
        button.removeAttribute('aria-current');
      }
    });
    if (shotId) {
      const shot = document.getElementById(shotId);
      if (shot) {
        shot.classList.add('active');
        positionFeaturePager(shotId);
        if (isIOS) {
          const entry = scrubMap.get(step);
          if (entry) unlockVideo(entry.video);
        }
      }
    }
  }

  function scrubVideos() {
    const viewH = getViewportHeight();
    scrubMap.forEach(({ video }, step) => {
      if (!video.duration) return;
      const progress = Math.max(0, Math.min(1, getStepProgress(step, viewH)));
      video.currentTime = progress * video.duration;
    });
  }

  function updateShotOneEffects(viewH) {
    if (!shotsStage || !shotOneStep) return;
    const progress = getStepProgress(shotOneStep, viewH);
    shotsStage.classList.toggle('shot-1-focus-left', progress >= 0.33 && progress < 0.66);
    shotsStage.classList.toggle('shot-1-focus-right', progress >= 0.66 && progress <= 1);
  }

  function updateShotThreeEffects(viewH) {
    if (!shotsStage || !shotThreeStep) return;
    const progress = getStepProgress(shotThreeStep, viewH);
    shotsStage.classList.toggle('shot-3-glance', progress >= 0.2 && progress < 0.4);
    shotsStage.classList.toggle('shot-3-insights', progress >= 0.4);
    shotsStage.classList.toggle('shot-3-click-one', progress >= 0.4 && progress < 0.5);
    shotsStage.classList.toggle('shot-3-detail', progress >= 0.5);
    shotsStage.classList.toggle('shot-3-click-two', progress >= 0.7 && progress < 0.85);
    shotsStage.classList.toggle('shot-3-final', progress >= 0.85);
  }

  function updateShotFourEffects(viewH) {
    if (!shotsStage || !shotFourStep) return;
    const progress = getStepProgress(shotFourStep, viewH);
    shotsStage.classList.toggle('shot-4-click', progress >= 0.2 && progress < 0.3);
    shotsStage.classList.toggle('shot-4-rise', progress >= 0.3);
    for (let i = 1; i <= 12; i += 1) {
      const start = 0.4 + (i - 1) * 0.03;
      const end = i === 12 ? Infinity : start + 0.03;
      shotsStage.classList.toggle(`shot-4-seq-${i}`, progress >= start && progress < end);
    }
    shotsStage.classList.toggle('shot-4-focus-click', progress >= 0.75 && progress < 0.85);
    shotsStage.classList.toggle('shot-4-focus-image', progress >= 0.85);
  }

  function updateShotFiveEffects(viewH) {
    if (!shotsStage || !shotFiveStep) return;
    const progress = getStepProgress(shotFiveStep, viewH);
    shotsStage.classList.toggle('shot-5-click', progress >= 0.1 && progress < 0.2);
    shotsStage.classList.toggle('shot-5-step-16', progress >= 0.2 && progress < 0.3);
    shotsStage.classList.toggle('shot-5-step-17', progress >= 0.3 && progress < 0.5);
    shotsStage.classList.toggle('shot-5-step-18', progress >= 0.5 && progress < 0.7);
    shotsStage.classList.toggle('shot-5-step-19', progress >= 0.7 && progress < 0.9);
    shotsStage.classList.toggle('shot-5-step-20', progress >= 0.9);
    shotsStage.classList.toggle('shot-5-context-pair', progress >= 0.3);
    shotsStage.classList.toggle('shot-5-main-window', progress >= 0.3 && progress < 0.5);
    shotsStage.classList.toggle('shot-5-beyond', progress >= 0.5);
  }

  function updateShotTwoEffects(viewH) {
    if (!shotsStage || !shotTwoStep) return;
    const progress = getStepProgress(shotTwoStep, viewH);
    shotsStage.classList.toggle('shot-2-plan',  progress >= 0.2  && progress < 0.4);
    shotsStage.classList.toggle('shot-2-start', progress >= 0.4  && progress < 0.5);
    shotsStage.classList.toggle('shot-2-tag-5', progress >= 0.5  && progress < 0.55);
    shotsStage.classList.toggle('shot-2-tag-6', progress >= 0.55 && progress < 0.6);
    shotsStage.classList.toggle('shot-2-tag-7', progress >= 0.6  && progress < 0.7);
    shotsStage.classList.toggle('shot-2-tag-8', progress >= 0.7);
  }

  const featuresSection = document.getElementById('features');
  const stickyBg  = document.querySelector('.features__sticky-bg');
  const endSpacer = document.querySelector('.features__end-spacer');

  function updateStickyExit() {
    if (!stickyBg || !endSpacer) return;
    const viewH     = getViewportHeight();
    const spacerTop = endSpacer.getBoundingClientRect().top;
    featuresSection?.classList.toggle('features--portrait-notice-hidden', spacerTop <= 0);
    if (spacerTop <= 0) {
      const progress = Math.max(0, Math.min(1, -spacerTop / viewH));
      stickyBg.style.transform = `translateY(${-progress * viewH}px)`;
    } else {
      stickyBg.style.transform = '';
    }
  }

  function update() {
    const viewH = getViewportHeight();
    const shotOneProgress   = shotOneStep   ? getStepProgress(shotOneStep,   viewH) : null;
    const shotTwoProgress   = shotTwoStep   ? getStepProgress(shotTwoStep,   viewH) : null;
    const shotThreeProgress = shotThreeStep ? getStepProgress(shotThreeStep, viewH) : null;
    const shotFourProgress  = shotFourStep  ? getStepProgress(shotFourStep,  viewH) : null;
    const shotFiveProgress  = shotFiveStep  ? getStepProgress(shotFiveStep,  viewH) : null;
    const isActiveRange = (progress, isLast = false) => (
      progress >= 0 && (isLast ? progress <= 1 : progress < 1)
    );
    let best = null;
    let bestArea = 0;

    if (shotOneStep && isActiveRange(shotOneProgress)) {
      activateStep(shotOneStep);
    } else if (shotTwoStep && isActiveRange(shotTwoProgress)) {
      activateStep(shotTwoStep);
    } else if (shotThreeStep && isActiveRange(shotThreeProgress)) {
      activateStep(shotThreeStep);
    } else if (shotFourStep && isActiveRange(shotFourProgress)) {
      activateStep(shotFourStep);
    } else if (shotFiveStep && isActiveRange(shotFiveProgress, true)) {
      activateStep(shotFiveStep);
    } else {
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
        const firstCard = featSteps[0]?.querySelector('.feat-card');
        const lastCard  = featSteps[featSteps.length - 1]?.querySelector('.feat-card');
        if (firstCard && lastCard) {
          const firstTop   = firstCard.getBoundingClientRect().top;
          const lastBottom = lastCard.getBoundingClientRect().bottom;
          if (firstTop > viewH)   activateStep(featSteps[0]);
          else if (lastBottom < 0) activateStep(featSteps[featSteps.length - 1]);
        }
      }
    }
    scrubVideos();
    updateShotOneEffects(viewH);
    updateShotTwoEffects(viewH);
    updateShotThreeEffects(viewH);
    updateShotFourEffects(viewH);
    updateShotFiveEffects(viewH);
    positionShotLabels();
    updateStickyExit();
  }

  let raf = false;

  scrubMap.forEach(({ video }) => {
    video.style.transition = 'opacity 0.3s ease';
    if (isIOS) {
      video.style.opacity = '1';
    } else {
      const reveal = () => { video.style.opacity = '1'; };
      video.style.opacity = '0';
      video.addEventListener('loadedmetadata', reveal, { once: true });
      video.addEventListener('loadeddata',     reveal, { once: true });
      video.addEventListener('canplay',        reveal, { once: true });
      video.addEventListener('seeked',         reveal, { once: true });
      video.addEventListener('error',          reveal, { once: true });
      video.addEventListener('loadedmetadata', scrubVideos);
    }
  });

  featurePagerButtons.forEach(button => {
    button.addEventListener('click', () => {
      const shotTarget = button.dataset.shotTarget;
      const runInstantJump = (jump) => {
        shotsStage?.classList.add('features__shots--instant');
        jump();
        update();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            shotsStage?.classList.remove('features__shots--instant');
          });
        });
      };

      if (shotTarget === 'shot-1') {
        runInstantJump(() => {
          document.getElementById('features')?.scrollIntoView({
            behavior: 'auto',
            block: 'start',
          });
        });
        return;
      }

      const step = stepByShot.get(shotTarget);
      if (!step) return;

      const viewH = getViewportHeight();
      const targetProgress = 0.001;
      const stepRect = step.getBoundingClientRect();
      const targetY = window.scrollY
        + stepRect.top
        - viewH * 0.5
        + stepRect.height * targetProgress;
      runInstantJump(() => {
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'auto',
        });
      });
    });
  });

  window.addEventListener('scroll', () => {
    if (!raf) { raf = true; requestAnimationFrame(() => { update(); raf = false; }); }
  }, { passive: true });
  window.addEventListener('resize', update);
  window.visualViewport?.addEventListener('resize', update);

  update();
})();


/* ══════════════════════════════════════════════════════════
   5. VIDEO — per-video style overrides from data attributes
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

(function initInstallCommandCopy() {
  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  document.addEventListener('click', async event => {
    const button = event.target.closest('.install-guide__copy');
    if (!button) return;

    const text = button.dataset.copyText;
    if (!text) return;

    const label = button.dataset.copyLabel || button.textContent;
    const copiedLabel = button.dataset.copiedLabel || 'Copied';
    try {
      await copyText(text);
      button.textContent = copiedLabel;
      button.classList.add('is-copied');
      window.setTimeout(() => {
        button.textContent = label;
        button.classList.remove('is-copied');
      }, 1400);
    } catch {
      button.textContent = label;
    }
  });
})();
