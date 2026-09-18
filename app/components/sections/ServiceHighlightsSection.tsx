'use client';

import React from 'react';
import CountUp from 'react-countup';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Reveal } from '@/app/components/ui/Reveal';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';

interface ServiceHighlightsSectionProps {
  serviceHighlightsSection: Page['serviceHighlightsSection'];
  className?: string;
}

function HighlightNumber({ value, suffix, color }: { value: number; suffix: string; color: string }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className="big-number text-4xl sm:text-5xl md:text-6xl lg:text-[5.5vw] font-extralight tracking-[0.1em] leading-none break-words"
      style={{ color }}
    >
      {isVisible ? <CountUp end={value} duration={2.5} suffix={suffix} separator="," /> : `0${suffix}`}
    </div>
  );
}

export const ServiceHighlightsSection: React.FC<ServiceHighlightsSectionProps> = ({
  serviceHighlightsSection,
  className
}) => {
  const themeColors = useThemeColors();

  if (!serviceHighlightsSection?.enabled) return null;

  const brandColor = themeColors.primaryButton;
  const primaryTextColor = themeColors.lightPrimaryText;
  const secondaryTextColor = themeColors.lightSecondaryText;

  const highlights = [...(serviceHighlightsSection.highlights || [])]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 4);

  const parseCounter = (raw: unknown) => {
    if (typeof raw !== 'string') return null;
    const s = raw.trim();
    const match = s.match(/([0-9][0-9,\.]*)(\+?)/);
    if (!match) return null;
    const valueStr = match[1].replace(/,/g, '');
    const value = parseInt(valueStr, 10);
    return isNaN(value) ? null : { value, suffix: match[2] || '' };
  };

  return (
    <section
      className={cn('relative py-3 md:py-8 lg:py-12 overflow-hidden', className)}
      style={{ backgroundColor: themeColors.sectionBackground || '#FFFFFF' }}
    >
      <div className="wb-page-shell py-3 md:py-8 lg:py-12">
        
        {/* Header Area */}
        <Reveal className="mb-12 lg:mb-22">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-[1.5px]" style={{ backgroundColor: brandColor }} />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: primaryTextColor }}>
                 Highlights
              </span>
           </div>
           {serviceHighlightsSection.title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-sans tracking-tight uppercase font-light leading-none break-words">
                 <div className="brand-first-line [&_p:first-child]:text-primary [&_span:first-of-type]:text-primary" style={{ color: primaryTextColor }}>
                   <TiptapRenderer content={serviceHighlightsSection.title} as="inline" />
                </div>
              </h2>
           )}
        </Reveal>

        {/* Highlights Display - Using Brand Color for High Impact Data */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-y-16 lg:gap-x-12 xl:gap-x-24">
          {highlights.map((highlight, index) => {
            const counter = parseCounter((highlight as any).price);

            return (
              <div key={index} className="highlight-item flex min-w-0 flex-col group sm:max-w-none lg:min-w-[180px] lg:flex-1">
                <Reveal delayMs={index * 100} className="relative mb-8">
                  {counter ? (
                    <HighlightNumber value={counter.value} suffix={counter.suffix} color={brandColor} />
                  ) : (
                    <div
                      className="big-number text-4xl sm:text-5xl md:text-6xl lg:text-[5.5vw] font-extralight tracking-[0.1em] leading-none break-words"
                      style={{ color: brandColor }}
                    >
                      {(highlight as any).price || '—'}
                    </div>
                  )}
                  <div 
                    className="w-12 h-[1px] opacity-20 transition-all duration-700 group-hover:w-full group-hover:bg-primary"
                    style={{ backgroundColor: brandColor }}
                  />
                </Reveal>

                <div className="">
                  {highlight.title && (
                    <h4 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] leading-tight" style={{ color: primaryTextColor }}>
                      <TiptapRenderer content={highlight.title} as="inline" />
                    </h4>
                  )}
                  {highlight.description && (
                    <div className="text-[10px] md:text-[11px] font-light tracking-[0.1em] leading-relaxed opacity-60 uppercase max-w-[240px]" style={{ color: secondaryTextColor }}>
                      <TiptapRenderer content={highlight.description} as="inline" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlightsSection;