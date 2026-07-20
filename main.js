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

/** Display the release version published in latest.json. */
(function initLatestVersion() {
  const versionEl = document.querySelector('[data-latest-version]');
  if (!versionEl) return;

  fetch('latest.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`Version request failed: ${response.status}`);
      return response.json();
    })
    .then(release => {
      const version = typeof release.version === 'string' ? release.version.trim() : '';
      if (!/^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
        throw new Error('latest.json contains an invalid version');
      }

      versionEl.textContent = `Version ${version.replace(/^v/, '')}`;
    })
    .catch(() => {
      // Keep the version embedded in index.html when offline or unavailable.
    });
})();

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

/* Instant anchor jump */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    if (anchor.hasAttribute('data-feature-jump')) return;

    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
});

(function initPageQuicknav() {
  const quicknav = document.querySelector('.page-quicknav');
  const showFrom = document.getElementById('solution');
  const download = document.getElementById('download');
  if (!quicknav || !showFrom || !download) return;

  const update = () => {
    const threshold = showFrom.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.2;
    quicknav.classList.toggle('is-visible', window.scrollY >= threshold);
    quicknav.classList.toggle(
      'is-past-features',
      download.getBoundingClientRect().top <= window.innerHeight * 0.5
    );
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();


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
    const activeCard = cards[index];
    const activePlan = activeCard?.dataset.pricingPlan || 'lite';
    grid.dataset.activePlan = activePlan;

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

  function scrollToCard(index, behavior = 'smooth') {
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
      behavior,
    });
    setActive(index);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.pricingTarget);
      scrollToCard(
        index,
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      );
    });
  });

  cards.forEach((card, index) => {
    card.addEventListener('focusin', () => setActive(index));
    card.addEventListener('click', () => setActive(index));
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

  const requestedPlan = new URLSearchParams(window.location.search)
    .get('plan')
    ?.toLowerCase();
  const requestedIndex = cards.findIndex(
    card => card.dataset.pricingPlan === requestedPlan
  );

  if (requestedIndex >= 0) {
    setActive(requestedIndex);
    requestAnimationFrame(() => scrollToCard(requestedIndex, 'auto'));
  } else {
    updateActive();
  }
})();

(function initThemePreviewPager() {
  document.querySelectorAll('.faq__theme-gallery').forEach(gallery => {
    const previews = gallery.querySelector('.faq__theme-previews');
    const cards = Array.from(gallery.querySelectorAll('.faq__theme-card'));
    const buttons = Array.from(gallery.querySelectorAll('.faq__theme-pager-btn'));
    if (!previews || cards.length < 2 || !buttons.length) return;

    function setActive(index) {
      const card = cards[index];
      gallery.dataset.activeTheme = card?.dataset.themePreview || 'light';

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
      const previewsRect = previews.getBoundingClientRect();
      const previewsCenter = previewsRect.left + previewsRect.width / 2;
      let activeIndex = 0;
      let activeDistance = Infinity;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - previewsCenter);
        if (distance < activeDistance) {
          activeDistance = distance;
          activeIndex = index;
        }
      });

      setActive(activeIndex);
    }

    function scrollToCard(index) {
      const card = cards[index];
      if (!card) return;

      const previewsRect = previews.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      previews.scrollTo({
        left: Math.max(0, previews.scrollLeft + cardRect.left - previewsRect.left),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      setActive(index);
    }

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        scrollToCard(Number(button.dataset.themeTarget));
      });
    });

    let pagerRaf = false;
    previews.addEventListener('scroll', () => {
      if (pagerRaf) return;
      pagerRaf = true;
      requestAnimationFrame(() => {
        updateActive();
        pagerRaf = false;
      });
    }, { passive: true });
  });
})();

(function initFaqAccordion() {
  const toggles = Array.from(document.querySelectorAll('.faq__toggle'));
  if (!toggles.length) return;

  function setExpanded(toggle, expanded) {
    const answerId = toggle.getAttribute('aria-controls');
    const answer = answerId ? document.getElementById(answerId) : null;
    if (!answer) return;

    toggle.setAttribute('aria-expanded', String(expanded));
    answer.hidden = !expanded;
    toggle.closest('.faq__item')?.classList.toggle('is-open', expanded);
  }

  function openLinkedFaq(answerId, behavior) {
    const answer = document.getElementById(answerId);
    const item = answer?.closest('.faq__item');
    const toggle = item?.querySelector('.faq__toggle');
    if (!item || !toggle) return;

    setExpanded(toggle, true);
    requestAnimationFrame(() => item.scrollIntoView({ behavior, block: 'start' }));
  }

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const shouldOpen = toggle.getAttribute('aria-expanded') !== 'true';
      setExpanded(toggle, shouldOpen);
    });
  });

  document.querySelectorAll('[data-faq-answer]').forEach(link => {
    link.addEventListener('click', event => {
      const answerId = link.getAttribute('data-faq-answer');
      if (!answerId || !document.getElementById(answerId)) return;

      event.preventDefault();
      history.pushState(null, '', `#${answerId}`);
      openLinkedFaq(answerId, 'smooth');
    });
  });

  function openFaqFromHash() {
    const answerId = decodeURIComponent(window.location.hash.slice(1));
    if (answerId) openLinkedFaq(answerId, 'auto');
  }

  window.addEventListener('hashchange', openFaqFromHash);
  openFaqFromHash();
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

  const runInstantJump = (jump) => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlScrollBehavior = html.style.scrollBehavior;
    const previousBodyScrollBehavior = body.style.scrollBehavior;

    shotsStage?.classList.add('features__shots--instant');
    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    try {
      jump();
      update();
      requestAnimationFrame(() => {
        update();
        requestAnimationFrame(() => {
          shotsStage?.classList.remove('features__shots--instant');
          html.style.scrollBehavior = previousHtmlScrollBehavior;
          body.style.scrollBehavior = previousBodyScrollBehavior;
        });
      });
    } catch (error) {
      shotsStage?.classList.remove('features__shots--instant');
      html.style.scrollBehavior = previousHtmlScrollBehavior;
      body.style.scrollBehavior = previousBodyScrollBehavior;
      throw error;
    }
  };

  function jumpToFeatureShot(shotTarget, progress = 0.001) {
    if (shotTarget === 'shot-1') {
      runInstantJump(() => {
        const featuresTop = document.getElementById('features')?.getBoundingClientRect().top;
        if (featuresTop !== undefined) window.scrollTo(0, Math.max(0, window.scrollY + featuresTop));
      });
      return;
    }

    const step = stepByShot.get(shotTarget);
    if (!step) return;

    const viewH = getViewportHeight();
    const targetProgress = Math.max(0, Math.min(0.98, Number(progress) || 0.001));
    const stepRect = step.getBoundingClientRect();
    const targetY = window.scrollY
      + stepRect.top
      - viewH * 0.5
      + stepRect.height * targetProgress;
    runInstantJump(() => {
      window.scrollTo(0, Math.max(0, targetY));
    });
  }

  featurePagerButtons.forEach(button => {
    button.addEventListener('click', () => {
      jumpToFeatureShot(button.dataset.shotTarget);
    });
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-feature-jump]');
    if (!link) return;
    event.preventDefault();
    jumpToFeatureShot(link.dataset.featureJump, link.dataset.featureProgress);
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
   Highlights the matching OS button, and the Mac chip build when available.
   ══════════════════════════════════════════════════════════ */

(function initPlatformDetection() {
  const btnMac = document.getElementById('btn-mac');
  const btnWin = document.getElementById('btn-win');
  if (!btnMac || !btnWin) return;

  const macBuilds = {
    arm: {
      href: 'https://www.dropbox.com/scl/fi/h1lg1w4djhqjl2lfu1iet/ChroFlow_latest_aarch64.dmg?rlkey=mnve11ki77pf3ztwqbas8ev3u&st=jv2ltlxz&dl=1',
      i18nKey: 'download.mac.arm.sub',
      fallbackText: 'Apple Silicon · macOS 13+',
      ariaLabel: 'Download ChroFlow for macOS Apple Silicon',
    },
    intel: {
      href: 'https://www.dropbox.com/scl/fi/d0vgd5xer3qmr1sl7ihs2/ChroFlow_latest_x64.dmg?rlkey=oqmj4fnn0w7sw9c52ws26iu5h&st=3qmznwu5&dl=1',
      i18nKey: 'download.mac.intel.sub',
      fallbackText: 'Intel chip · macOS 13+',
      ariaLabel: 'Download ChroFlow for macOS Intel chip',
    },
  };
  const downloadButtons = [btnMac, btnWin];
  const ua = navigator.userAgent;
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  const isMac = (/mac/i.test(platform) || /Mac/.test(ua)) && !/iPhone|iPad|iPod/.test(ua);
  const isWindows = /win/i.test(platform) || /Win/.test(ua);
  const macSub = btnMac.querySelector('.btn-sub');

  document.documentElement.dataset.platform = isMac
    ? 'mac'
    : isWindows
      ? 'windows'
      : 'other';

  function highlight(button) {
    downloadButtons.forEach(btn => btn.classList.remove('is-platform'));
    if (button) button.classList.add('is-platform');
  }

  function setMacBuild(buildName) {
    const build = macBuilds[buildName] || macBuilds.arm;
    const dict = typeof I18N !== 'undefined' ? I18N[currentLang] || I18N.en : null;

    btnMac.href = build.href;
    btnMac.setAttribute('aria-label', build.ariaLabel);

    if (macSub) {
      macSub.dataset.i18n = build.i18nKey;
      macSub.textContent = dict?.[build.i18nKey] || build.fallbackText;
    }
  }

  async function detectMacArchitecture() {
    if (!isMac || !navigator.userAgentData?.getHighEntropyValues) return null;

    try {
      const { architecture } = await navigator.userAgentData.getHighEntropyValues(['architecture']);
      const arch = String(architecture || '').toLowerCase();
      if (/(arm|aarch64)/.test(arch)) return 'arm';
      if (/(x86|x64|amd64|ia32)/.test(arch)) return 'intel';
    } catch (error) {
      console.warn('[ChroFlow download] Mac chip detection unavailable.', error);
    }

    return null;
  }

  setMacBuild('arm');

  if (isMac) {
    highlight(btnMac);
    detectMacArchitecture().then(arch => {
      if (arch === 'intel') {
        setMacBuild('intel');
      } else if (arch === 'arm') {
        setMacBuild('arm');
      }
    });
  } else if (isWindows) {
    highlight(btnWin);
  } else {
    highlight(null);
  }

  // Show install guide on click
  const guideMac = document.getElementById('guide-mac');
  const guideWin = document.getElementById('guide-win');
  const releaseNotes = document.getElementById('release-notes');
  const faqInstallContent = document.getElementById('faq-install-content');

  function cloneGuideForFaq(panel) {
    if (!panel) return null;
    const clone = panel.cloneNode(true);
    clone.removeAttribute('id');
    clone.hidden = false;
    clone.classList.add('faq__install-panel');
    return clone;
  }

  function renderFaqInstallGuide() {
    if (!faqInstallContent) return;
    faqInstallContent.replaceChildren();

    const panels = isMac
      ? [guideMac]
      : isWindows
        ? [guideWin]
        : [guideMac, guideWin];

    panels.forEach(panel => {
      const clone = cloneGuideForFaq(panel);
      if (clone) faqInstallContent.appendChild(clone);
    });
  }

  renderFaqInstallGuide();

  function showGuide(panel) {
    if (!panel) return;
    [guideMac, guideWin].forEach(p => { if (p) p.hidden = true; });
    if (releaseNotes) releaseNotes.hidden = true;
    panel.hidden = false;
    setTimeout(() => panel.scrollIntoView({ behavior: 'auto', block: 'nearest' }), 50);
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
