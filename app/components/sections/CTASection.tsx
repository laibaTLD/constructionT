'use client';

import React from 'react';
import Link from 'next/link';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Reveal } from '@/app/components/ui/Reveal';

interface CTASectionProps {
  ctaSection: Page['ctaSection'];
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({ ctaSection, className }) => {
  const themeColors = useThemeColors();

  if (!ctaSection?.enabled) return null;

  const brandColor = themeColors.primaryButton;
  const primaryTextColor = themeColors.lightPrimaryText;
  const secondaryTextColor = themeColors.lightSecondaryText;

  const backgroundImageUrl = ctaSection.backgroundImage ? getImageSrc(ctaSection.backgroundImage) : null;

  return (
    <section
      className={cn('relative flex flex-col items-center bg-white', className)}
    >
      {/* 1. White Statement Block - Centered Editorial Design */}
      <div
        className="relative z-20 w-fit p-6 md:p-8 flex flex-col items-center text-center px-6 bg-white"
      >
        <Reveal className="max-w-4xl flex flex-col items-center">

          {/* Header Title - Huge, Centered, Multiple Lines */}
          {ctaSection.title && (
            <h2
              className="text-4xl md:text-5xl lg:text-7xl font-sans tracking-tight leading-[1.1] uppercase font-light mb-6"
              style={{ color: primaryTextColor }}
            >
              <div className="text-balance brand-emphasis [&_strong]:text-primary [&_span.brand]:text-primary">
                <TiptapRenderer content={ctaSection.title} as="inline" />
              </div>
            </h2>
          )}

          {/* Subheading / Description */}
          {ctaSection.description && (
            <div
              className="max-w-2xl text-lg md:text-xl lg:text-2xl font-light leading-relaxed tracking-wide opacity-80 mb-8"
              style={{ color: secondaryTextColor }}
            >
              <TiptapRenderer content={ctaSection.description} />
            </div>
          )}

          {/* Note Text (Optional Small Detail) */}
          {((ctaSection as any).subtitle || (ctaSection as any).noteText) && (
            <div className="text-[10px] md:text-[11px] font-light tracking-[0.2em] opacity-60 mb-8" style={{ color: primaryTextColor }}>
              <TiptapRenderer content={(ctaSection as any).subtitle || (ctaSection as any).noteText} as="inline" />
            </div>
          )}

          {/* Circular Red Discovery CTA */}
          {ctaSection.primaryButton && (
            <div className="">
              <Link
                href={ctaSection.primaryButton.href || '/'}
                className="group inline-flex items-center gap-6"
              >
                <span
                  className="text-[10px] md:text-[11px] font-bold tracking-[0.3em] uppercase transition-colors"
                  style={{ color: brandColor }}
                >
                  {ctaSection.primaryButton.label}
                </span>
                <div
                  className="w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-700 group-hover:scale-110"
                  style={{ borderColor: brandColor, color: brandColor }}
                >
                  <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          )}
        </Reveal>
      </div>

      {/* 2. Panoramic Image Reveal - Overlaps the bottom of the white block */}
      {backgroundImageUrl && (
        <div
          className="relative w-full h-[40vh] md:h-[50vh] lg:h-[55vh] overflow-hidden -mt-16 md:-mt-20 lg:-mt-24 z-10"
        >
          <div
            className="absolute inset-x-0 -top-10 h-[120%] bg-cover bg-center transition-transform duration-[2000ms] ease-out hover:scale-105"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          >
            {/* Subtle Linear Fade for smooth overlap transition */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>
      )}

      {/* Spacing for sections below */}
      {!backgroundImageUrl && <div className="h-8 bg-white w-full" />}
    </section>
  );
};

export default CTASection;