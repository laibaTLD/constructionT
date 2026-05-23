'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/app/lib/utils';

interface SiteLoadingScreenProps {
  siteName?: string;
  className?: string;
}

function formatSlugLabel(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const SiteLoadingScreen: React.FC<SiteLoadingScreenProps> = ({ siteName, className }) => {
  const [progress, setProgress] = useState(8);
  const envLabel = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG
    ? formatSlugLabel(process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG)
    : '';
  const label = (siteName || envLabel || '').trim().toUpperCase();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('site-loading-active');

    const intervalId = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const step = Math.max(1, Math.floor((92 - prev) * 0.12));
        return Math.min(92, prev + step);
      });
    }, 120);

    return () => {
      window.clearInterval(intervalId);
      document.documentElement.classList.remove('site-loading-active');
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className={cn(
        'site-loading-screen fixed inset-0 z-[9998] flex flex-col items-center justify-center overflow-hidden',
        className
      )}
      style={{ backgroundColor: 'var(--wb-section-bg-dark)' }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading site"
    >
      <div className="site-loading-grid pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden />

      <div className="site-loading-beam pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-8">
        <div className="site-loading-frame relative mb-14 flex h-28 w-28 items-center justify-center md:h-32 md:w-32">
          <span className="site-loading-frame-line absolute left-0 top-0 h-8 w-8 border-l border-t border-white/50" />
          <span className="site-loading-frame-line absolute right-0 top-0 h-8 w-8 border-r border-t border-white/50" />
          <span className="site-loading-frame-line absolute bottom-0 left-0 h-8 w-8 border-b border-l border-white/50" />
          <span className="site-loading-frame-line absolute bottom-0 right-0 h-8 w-8 border-b border-r border-white/50" />
          <div className="site-loading-core h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--wb-primary)' }} />
        </div>

        {label ? (
          <p
            className="site-loading-brand max-w-full text-center text-[11px] font-light uppercase tracking-[0.55em] text-white/90 md:text-xs"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {label}
          </p>
        ) : null}

        <div className={cn('h-px w-48 overflow-hidden bg-white/10 md:w-56', label ? 'mt-12' : 'mt-8')}>
          <div
            className="site-loading-progress h-full origin-left"
            style={{
              width: `${progress}%`,
              backgroundColor: 'var(--wb-primary)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SiteLoadingScreen;
