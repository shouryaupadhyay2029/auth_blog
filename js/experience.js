/* ─────────────────────────────────────────────────────────────────
   BlogAuth V1 experience.js — Premium Layered Page Transition
   Synchronizes Hero recede and Featured Stories reveal with scroll.
───────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Ensure GSAP and ScrollTrigger are loaded before running
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger is not loaded. Skipping layered transition.');
    return;
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  const hero = document.querySelector('.hero-section');
  const featured = document.querySelector('.featured-section');

  if (!hero || !featured) return;

  // Check for reduced motion preferences
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check if screen is mobile/tablet (width < 992px)
  const isMobileOrTablet = window.innerWidth < 992;

  if (prefersReduced) {
    // 1. Reduced motion: disable pinning/transforms, use a simple fade-in
    gsap.set(featured, { opacity: 0 });
    gsap.to(featured, {
      opacity: 1,
      duration: 1,
      scrollTrigger: {
        trigger: featured,
        start: 'top 85%',
        end: 'top 55%',
        scrub: true
      }
    });
    return;
  }

  if (isMobileOrTablet) {
    // 2. Mobile & Tablet: no scroll locking/pinning, but keep natural scroll fades
    gsap.set(featured, { y: 60, opacity: 0 });
    
    // Fade hero slightly
    gsap.to(hero, {
      opacity: 0.35,
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Fade & slide featured stories
    gsap.to(featured, {
      opacity: 1,
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: featured,
        start: 'top 95%',
        end: 'top 30%',
        scrub: true
      }
    });
    return;
  }

  // 3. Desktop Cinematic Layered Page Transition
  // Set initial states for components before scroll starts
  gsap.set(featured, {
    y: 160,
    opacity: 0,
    scale: 0.985,
    filter: 'blur(6px)'
  });

  // Master timeline synchronized with scroll trigger
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=100%', // Pinned for exactly one viewport height of scroll
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  // Recede Hero cover layer
  tl.to(hero, {
    opacity: 0.25,
    scale: 0.96,
    y: -50,
    filter: 'blur(4px)',
    duration: 1,
    ease: 'none'
  }, 0);

  // Lift Featured Stories page upward over the Hero
  tl.to(featured, {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 1,
    ease: 'none'
  }, 0);
});
