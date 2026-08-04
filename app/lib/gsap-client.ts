'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

let initialized = false;

/** One-time GSAP / ScrollTrigger tuning for smoother page scroll. */
export function initGsapScroll() {
  if (typeof window === 'undefined' || initialized) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
  gsap.ticker.lagSmoothing(500, 33);

  initialized = true;
}
