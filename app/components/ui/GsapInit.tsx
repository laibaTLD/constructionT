'use client';

import { useEffect } from 'react';
import { initGsapScroll } from '@/app/lib/gsap-client';

export function GsapInit() {
  useEffect(() => {
    initGsapScroll();
  }, []);

  return null;
}
