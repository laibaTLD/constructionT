'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useThemeColors } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroSectionProps {
  hero: Page['hero'];
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ hero, className }) => {
  const { site } = useWebBuilder();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const themeColors = useThemeColors();

  const mediaItems = useMemo(() => {
    if (!hero) return [];
    const items = Array.isArray((hero as any).mediaItems) ? (hero as any).mediaItems : [];
    if (items.length > 0) return items;
    return hero.media ? [hero.media] : [];
  }, [hero]);

  const displayMedia = mediaItems.slice(0, 3);

  useEffect(() => {
    if (!hero?.enabled) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.5 }
      );

      const lines = titleContainerRef.current?.querySelectorAll('p, span, h1');
      if (lines && lines.length > 0) {
        gsap.fromTo(
          lines,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 1.1, ease: 'power3.out', delay: 0.7 }
        );
      }

      gsap.fromTo(
        subtitleRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1 }
      );

      gsap.fromTo(
        ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.2 }
      );

      const images = mediaContainerRef.current?.querySelectorAll('.hero-media-item');
      if (images) {
        gsap.fromTo(
          images,
          { scale: 1.04 },
          { scale: 1, stagger: 0.12, duration: 1.2, ease: 'power2.out', delay: 0.1 }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [hero]);

  if (!hero?.enabled) return null;

  const brandName = (site?.business?.name || site?.name || '').toUpperCase();

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative w-full bg-white flex flex-col md:flex-row md:items-stretch',
        className
      )}
    >
      {/* Left: content drives section height */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-28 pt-24 pb-10 sm:pt-28 sm:pb-12 md:pt-32 md:pb-16 z-20 overflow-visible min-w-0">
        <div className="max-w-lg overflow-visible">
          <div
            ref={badgeRef}
            className="inline-block max-w-full text-white text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.35em] px-4 py-1.5 uppercase mb-8 whitespace-normal break-words"
            style={{ backgroundColor: themeColors.primaryButton }}
          >
            {brandName}
          </div>

          {hero.title && (
            <div ref={titleContainerRef} className="mb-5">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans tracking-tight text-[var(--wb-text-main)] font-light uppercase leading-[1.1] tiptap-hero-title">
                <TiptapRenderer content={hero.title} as="inline" />
              </h1>
            </div>
          )}

          {(hero.description || hero.subtitle) && (
            <div ref={subtitleRef} className="mb-8">
              <div className="text-[var(--wb-text-secondary)] text-base md:text-lg lg:text-xl font-light tracking-wide max-w-md leading-relaxed">
                <TiptapRenderer content={hero.description || hero.subtitle} as="inline" />
              </div>
            </div>
          )}

          {hero.primaryCta && (
            <div ref={ctaRef}>
              <a
                href={hero.primaryCta.href || '/'}
                className="group inline-flex items-center gap-6"
              >
                <span
                  className="text-[10px] font-bold tracking-[0.3em] uppercase transition-colors duration-300"
                  style={{ color: themeColors.primaryButton }}
                >
                  {hero.primaryCta.label}
                </span>
                <div
                  className="w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                  style={{
                    borderColor: themeColors.primaryButton,
                    color: themeColors.primaryButton,
                  }}
                >
                  <svg
                    className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right: stretches to match content height */}
      <div
        ref={mediaContainerRef}
        className="w-full md:w-1/2 relative min-h-[260px] sm:min-h-[320px] md:min-h-0 md:self-stretch"
      >
        {displayMedia.length === 0 ? (
          <div className="absolute inset-0 bg-[#f4f4f4] md:relative md:min-h-full" />
        ) : displayMedia.length === 1 ? (
          <div className="hero-media-item absolute inset-0 overflow-hidden bg-gray-100">
            {displayMedia[0]?.type === 'video' ? (
              <video
                className="h-full w-full object-cover"
                src={getImageSrc(displayMedia[0].url)}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <OptimizedImage
                src={displayMedia[0].url}
                alt={displayMedia[0].altText || ''}
                fill
                priority
                sizes={IMAGE_SIZES.hero}
                className="object-cover"
              />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-3 md:p-4 h-full">
            {displayMedia.map((item: any, idx: number) => (
              <div
                key={idx}
                className={cn(
                  'hero-media-item relative overflow-hidden bg-gray-100',
                  idx === 0 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'
                )}
              >
                {item?.type === 'video' ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={getImageSrc(item.url)}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <OptimizedImage
                    src={item.url}
                    alt={item.altText || ''}
                    fill
                    priority={idx === 0}
                    sizes={idx === 0 ? IMAGE_SIZES.hero : IMAGE_SIZES.card}
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .tiptap-hero-title p,
        .tiptap-hero-title span {
          display: block;
        }
      `}</style>
    </section>
  );
};
