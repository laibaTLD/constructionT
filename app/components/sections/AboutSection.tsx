'use client';

import React from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Reveal } from '@/app/components/ui/Reveal';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';

interface AboutSectionProps {
  aboutSection: Page['aboutSection'];
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ aboutSection, className }) => {
  const themeColors = useThemeColors();
  const { ref: imageRevealRef, isVisible: imageVisible } = useScrollAnimation();

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
      className={cn('relative w-full py-8 md:py-10 lg:py-12 overflow-hidden', className)}
      style={{ backgroundColor: 'var(--wb-page-bg)' }}
    >
      <div className="container mx-auto px-8 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 xl:gap-32 lg:items-stretch">

          {/* Left Content Column */}
          <div className="w-full lg:w-[45%] space-y-12">

            <Reveal className="space-y-12">
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
                <div className="brand-first-line [&_p:first-child]:text-primary [&_span:first-of-type]:text-primary" style={{ color: primaryTextColor }}>
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
            </Reveal>
          </div>

          {/* Right Image Column — fills content height, no letterboxing */}
          <div className="w-full lg:w-[55%] lg:self-stretch flex">
            <div
              ref={imageRevealRef}
              className={cn(
                'relative w-full overflow-hidden bg-[#f3f3f3] group shadow-sm aspect-[4/3] lg:aspect-auto lg:min-h-full lg:h-auto lg:flex-1',
                imageVisible && 'animate-clip-reveal motion-reduce:animate-none'
              )}
            >
              {imageUrl ? (
                <OptimizedImage
                  src={imageUrl}
                  alt={
                    typeof aboutSection.image === 'object' && aboutSection.image?.altText
                      ? aboutSection.image.altText
                      : 'About us'
                  }
                  fill
                  sizes={IMAGE_SIZES.sectionHalf}
                  className="object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 bg-[#f4f4f4]" />
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;