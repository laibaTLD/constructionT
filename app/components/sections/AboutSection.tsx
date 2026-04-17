'use client';

import React, { useEffect, useRef } from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { useThemeColors } from '@/app/hooks/useTheme';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AboutSectionProps {
  aboutSection: Page['aboutSection'];
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ aboutSection, className }) => {
  const themeColors = useThemeColors();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!aboutSection?.enabled) return;

    const ctx = gsap.context(() => {
      // 1. Image Clip Reveal
      gsap.fromTo(imageContainerRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.8,
          ease: 'expo.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );

      // 2. Image Parallax and Slight Zoom
      gsap.fromTo(imageRef.current,
        { scale: 1.2, yPercent: 10 },
        {
          scale: 1,
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );

      // 3. Text Staggered Reveal
      const children = textRef.current?.children;
      if (children) {
        gsap.fromTo(children,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 85%',
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [aboutSection]);

  if (!aboutSection?.enabled) return null;

  const brandColor = themeColors.primaryButton;
  const primaryTextColor = themeColors.lightPrimaryText;
  const secondaryTextColor = themeColors.lightSecondaryText;

  const imageUrl = aboutSection.image
    ? getImageSrc(
      typeof aboutSection.image === 'object' && aboutSection.image !== null
        ? aboutSection.image.url
        : aboutSection.image
    )
    : null;

  return (
    <section
      ref={sectionRef}
      className={cn('relative w-full py-12 md:py-20 lg:py-24 overflow-hidden', className)}
      style={{ backgroundColor: 'var(--wb-page-bg)' }}
    >
      <div className="container mx-auto px-8 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-center">

          {/* Left Content Column */}
          <div ref={textRef} className="w-full lg:w-[45%] space-y-12">

            {/* Architectural Label - Using Brand Color line */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-[1.5px]" style={{ backgroundColor: brandColor }} />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: primaryTextColor }}>
                About Us
              </span>
            </div>

            {/* Editorial Header - First Line Red Design as per image */}
            {aboutSection.title && (
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight leading-[1.05] uppercase font-light"
                style={{ color: primaryTextColor }}
              >
                <div className="[&_p:first-child]:text-primary [&_span:first-of-type]:text-primary" style={{ color: primaryTextColor }}>
                   {/* We wrap the renderer to apply hierarchical coloring. First element gets brand color if multiple. */}
                   <style jsx>{`
                     h2 :global(p:first-child), h2 :global(span:first-child) {
                        color: ${brandColor} !important;
                     }
                   `}</style>
                   <TiptapRenderer content={aboutSection.title} as="inline" />
                </div>
              </h2>
            )}

            {/* Brand Story Description */}
            {aboutSection.description && (
              <div 
                className="max-w-md text-base md:text-lg font-light leading-relaxed tracking-wide space-y-6"
                style={{ color: secondaryTextColor }}
              >
                <TiptapRenderer content={aboutSection.description} />
              </div>
            )}

            {/* Circular Architectural CTA - EXACTLY as in reference image */}
            <div className="pt-8">
              <a
                href="/about-us"
                className="group inline-flex items-center gap-6 transition-all"
              >
                <span 
                  className="text-[10px] font-bold tracking-[0.3em] uppercase transition-colors duration-300"
                  style={{ color: brandColor }}
                >
                  About Us
                </span>
                <div 
                  className="w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                  style={{ 
                    borderColor: brandColor, 
                    color: brandColor,
                    backgroundColor: 'transparent'
                  }}
                >
                   <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                   </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="w-full lg:w-[55%]">
            <div
              ref={imageContainerRef}
              className="relative aspect-[4/5] md:aspect-[16/11] lg:aspect-[4/3] overflow-hidden bg-gray-100 group shadow-sm"
            >
              {imageUrl ? (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={aboutSection.title || ''}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#f4f4f4]" />
              )}
              
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;