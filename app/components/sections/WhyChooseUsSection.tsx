'use client';

import React from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Reveal } from '@/app/components/ui/Reveal';

interface WhyChooseUsSectionProps {
  whyChooseUsSection: Page['whyChooseUsSection'];
  className?: string;
}

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ whyChooseUsSection, className }) => {
  const themeColors = useThemeColors();

  if (!whyChooseUsSection?.enabled) return null;

  const brandColor = themeColors.primaryButton;
  const primaryTextColor = themeColors.lightPrimaryText;
  const secondaryTextColor = themeColors.lightSecondaryText;

  const items = whyChooseUsSection.items || [];

  return (
    <section
      className={cn('relative py-8 md:py-10 lg:py-12 overflow-hidden bg-[var(--wb-page-bg)]', className)}
    >
      <div className="wb-page-shell">

        {/* Editorial Header - Large Scale Centered */}
        <Reveal className="flex flex-col items-center text-center mb-8 lg:mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px]" style={{ backgroundColor: brandColor }} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: primaryTextColor }}>
              Philosophy
            </span>
            <div className="w-12 h-[1px]" style={{ backgroundColor: brandColor }} />
          </div>

          {whyChooseUsSection.title && (
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans tracking-tight uppercase font-light leading-none max-w-5xl">
              <div className="brand-first-line brand-emphasis [&_p:first-child]:text-primary [&_span:first-of-type]:text-primary" style={{ color: primaryTextColor }}>
                <TiptapRenderer content={whyChooseUsSection.title} as="inline" />
              </div>
            </h2>
          )}

          {whyChooseUsSection.description && (
            <div
              className="max-w-xl text-base md:text-lg font-light leading-relaxed tracking-wide opacity-70"
              style={{ color: secondaryTextColor }}
            >
              <TiptapRenderer content={whyChooseUsSection.description} />
            </div>
          )}
        </Reveal>

        {/* Values Grid - High Fidelity Digital Look */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 lg:gap-x-24">
          {items.map((item, idx) => (
            <Reveal key={idx} delayMs={idx * 120} className="group relative pt-8 border-t border-black/5 flex flex-col space-y-5">

              {/* Numbering Header */}
              <div className="flex justify-between items-start">
                <div
                  className="text-4xl lg:text-5xl font-extralight tracking-tighter opacity-10 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ color: brandColor }}
                >
                  {(idx + 1).toString().padStart(2, '0')}
                </div>
                <div
                  className="w-1 h-0 bg-primary transition-all duration-700 group-hover:h-12"
                  style={{ backgroundColor: brandColor }}
                />
              </div>

              <div className="space-y-6">
                {item.title && (
                  <h3
                    className="text-xl md:text-2xl font-sans tracking-tight uppercase font-light leading-tight"
                    style={{ color: primaryTextColor }}
                  >
                    <TiptapRenderer content={item.title} as="inline" />
                  </h3>
                )}

                <div className="w-12 h-[1px]" style={{ backgroundColor: brandColor }} />

                {item.description && (
                  <div
                    className="text-sm md:text-base font-light leading-relaxed tracking-wide opacity-70 uppercase"
                    style={{ color: secondaryTextColor }}
                  >
                    <TiptapRenderer content={item.description} />
                  </div>
                )}
              </div>

              {/* Subtle Hover Reveal Border */}
              <div
                className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-1000 group-hover:w-full"
                style={{ backgroundColor: brandColor }}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;