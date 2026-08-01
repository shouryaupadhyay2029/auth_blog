/**
 * BlogAuth V1 — cards.js
 * Sprint 9: Architectural Interactive Editorial Cards
 *
 * Mouse-tilt physics:
 *  - Per-card: rotateX(max 1.5deg) / rotateY(max 1.5deg)
 *  - Spring interpolation via requestAnimationFrame
 *  - Smooth return to neutral on mouse leave
 *  - Touch devices: tilt disabled, lift/accent retained
 *  - Respects prefers-reduced-motion
 *
 * CSS interface:
 *  The tilt values are written as CSS custom properties
 *  --rx and --ry on each card element.
 *  cards.css reads them via:
 *    transform: perspective(800px) rotateX(var(--rx)) rotateY(var(--ry)) ...
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     GUARDS
  ───────────────────────────────────────────── */
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  /* Tilt disabled on touch and reduced-motion */
  var TILT_ENABLED = !REDUCED && !IS_TOUCH;

  /* ─────────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────────── */
  var MAX_TILT  = 1.5;   /* degrees — max rotateX or rotateY */
  var SPRING    = 0.12;  /* lerp factor — how snappy the spring is (lower = softer) */
  var RETURN_SPRING = 0.08; /* softer return to neutral */

  /* ─────────────────────────────────────────────
     CARD REGISTRY
     Each card gets its own state object so they
     don't interfere with each other.
  ───────────────────────────────────────────── */
  var cards = [];

  function CardState(el) {
    this.el       = el;
    this.rx       = 0;   /* current rotateX (degrees) */
    this.ry       = 0;   /* current rotateY (degrees) */
    this.targetRx = 0;   /* target rotateX */
    this.targetRy = 0;   /* target rotateY */
    this.inside   = false; /* is mouse currently over this card */
    this.rafId    = null;
  }

  /* ─────────────────────────────────────────────
     LERP HELPER
  ───────────────────────────────────────────── */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* ─────────────────────────────────────────────
     APPLY TILT — writes CSS custom props
  ───────────────────────────────────────────── */
  function applyTilt(state) {
    state.el.style.setProperty('--rx', state.rx.toFixed(3) + 'deg');
    state.el.style.setProperty('--ry', state.ry.toFixed(3) + 'deg');
  }

  /* ─────────────────────────────────────────────
     ANIMATION LOOP — runs per card while active
  ───────────────────────────────────────────── */
  function tick(state) {
    var spring = state.inside ? SPRING : RETURN_SPRING;

    state.rx = lerp(state.rx, state.targetRx, spring);
    state.ry = lerp(state.ry, state.targetRy, spring);

    applyTilt(state);

    /* Continue until values settle near zero (on return) or near target */
    var settled = Math.abs(state.rx - state.targetRx) < 0.01 &&
                  Math.abs(state.ry - state.targetRy) < 0.01;

    if (!settled) {
      state.rafId = requestAnimationFrame(function () { tick(state); });
    } else {
      /* Snap exactly to target */
      state.rx = state.targetRx;
      state.ry = state.targetRy;
      applyTilt(state);
      state.rafId = null;
    }
  }

  /* ─────────────────────────────────────────────
     START ANIMATION (if not already running)
  ───────────────────────────────────────────── */
  function startTick(state) {
    if (state.rafId) return;
    state.rafId = requestAnimationFrame(function () { tick(state); });
  }

  /* ─────────────────────────────────────────────
     MOUSE ENTER — card now active
  ───────────────────────────────────────────── */
  function onEnter(state) {
    state.inside = true;
  }

  /* ─────────────────────────────────────────────
     MOUSE MOVE — compute tilt target from cursor
     position relative to card center
  ───────────────────────────────────────────── */
  function onMove(state, e) {
    if (!state.inside) return;

    var rect   = state.el.getBoundingClientRect();
    var cx     = rect.left + rect.width  / 2;
    var cy     = rect.top  + rect.height / 2;

    /* Normalise: -1 to +1 relative to card center */
    var normX  = (e.clientX - cx) / (rect.width  / 2);
    var normY  = (e.clientY - cy) / (rect.height / 2);

    /* Clamp to card bounds (safety) */
    normX = Math.max(-1, Math.min(1, normX));
    normY = Math.max(-1, Math.min(1, normY));

    /*
     * rotateY: mouse right → card tilts right (+Y)
     * rotateX: mouse down  → card tilts back  (-X)
     * Both clamped to MAX_TILT
     */
    state.targetRy =  normX * MAX_TILT;
    state.targetRx = -normY * MAX_TILT;

    /* Track exact cursor coordinates for spotlight */
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    state.el.style.setProperty('--mx', mx.toFixed(1) + 'px');
    state.el.style.setProperty('--my', my.toFixed(1) + 'px');

    startTick(state);
  }

  /* ─────────────────────────────────────────────
     MOUSE LEAVE — smoothly return to neutral
  ───────────────────────────────────────────── */
  function onLeave(state) {
    state.inside    = false;
    state.targetRx  = 0;
    state.targetRy  = 0;
    startTick(state);
  }

  /* ─────────────────────────────────────────────
     INIT CARD
     Attaches listeners and creates state object.
  ───────────────────────────────────────────── */
  function initCard(el) {
    if (el.dataset.cardsTiltInit) return;
    el.dataset.cardsTiltInit = '1';

    var state = new CardState(el);
    cards.push(state);

    if (!TILT_ENABLED) {
      /* Ensure neutral CSS variables are set */
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      return;
    }

    /* Set initial neutral state */
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');

    el.addEventListener('mouseenter', function ()  { onEnter(state); },    { passive: true });
    el.addEventListener('mousemove',  function (e) { onMove(state, e); },  { passive: true });
    el.addEventListener('mouseleave', function ()  { onLeave(state); },    { passive: true });
  }

  /* ─────────────────────────────────────────────
     CARD CLICKTHROUGH
     Whole card is clickable via the primary link.
     Coordinates with micro.js — micro.js handles
     the non-tilt cards; this adds it for all card types.
  ───────────────────────────────────────────── */
  function initClickthrough(el) {
    if (el.dataset.cardsClick) return;
    el.dataset.cardsClick = '1';
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var link = el.querySelector('a');
      if (link) link.click();
    });
  }

  /* ─────────────────────────────────────────────
     INIT ALL CARDS
  ───────────────────────────────────────────── */
  function initAllCards() {
    var selectors = [
      '.featured-card',
      '.featured-large-card',
      '.featured-small-card',
      '.latest-feature-card',
      '.latest-standard-card',
      '.latest-compact-card'
    ];

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        initCard(el);
        initClickthrough(el);
      });
    });
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    initAllCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
