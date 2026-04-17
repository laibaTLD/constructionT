'use client';

import React from 'react';
import Link from 'next/link';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { ArrowRight } from 'lucide-react';

interface ServicesSectionProps {
  servicesSection: Page['servicesSection'];
  className?: string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ servicesSection, className }) => {
  const { services } = useWebBuilder();
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();

  if (!servicesSection?.enabled) return null;

  const brandColor = themeColors.primaryButton || '#E31E24';

  return (
    <section
      className={cn('py-12 md:py-20 lg:py-24 border-t border-black/5', className)}
      style={{ backgroundColor: themeColors.pageBackground }}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* LEFT SIDE: STICKY HEADER & NAV */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-12">
            <div className="space-y-6">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-extralight tracking-[0.12em] uppercase leading-[1.02] text-balance max-w-[18ch]"
                style={{ fontFamily: themeFonts.heading, color: themeColors.mainText }}
              >
                <TiptapRenderer content={servicesSection.title} as="inline" />
              </h2>

              <div
                className="text-[11px] md:text-xs uppercase tracking-[0.35em] leading-relaxed opacity-60 max-w-xs"
                style={{ color: themeColors.secondaryText }}
              >
                <TiptapRenderer content={servicesSection.description} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SCROLLABLE EDITORIAL GRID */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-20 lg:pt-4">
            {services.map((service) => {
              const imageUrl = getImageSrc(service.thumbnailImage?.url || service.thumbnailImage);

              return (
                <Link
                  key={service._id}
                  href={`/service/${service.slug}`}
                  className="group flex flex-col gap-8"
                >
                  {/* Square Editorial Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50 border border-black/5">
                    <img
                      src={imageUrl}
                      alt={service.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Editorial Content */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-medium tracking-widest uppercase opacity-40">
                        {new Date(service.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                      </span>
                    </div>

                    <h3
                      className="text-2xl md:text-3xl font-light tracking-[0.05em] uppercase leading-tight group-hover:opacity-60 transition-opacity"
                      style={{ fontFamily: themeFonts.heading, color: themeColors.mainText }}
                    >
                      {service.name}
                    </h3>

                    <div
                      className="text-xs md:text-sm font-light leading-relaxed tracking-wide opacity-60 line-clamp-3"
                      style={{ color: themeColors.secondaryText }}
                    >
                      {typeof service.shortDescription === 'string'
                        ? service.shortDescription
                        : service.shortDescription && <TiptapRenderer content={service.shortDescription} />
                      }
                    </div>

                    {/* Minimalist Action */}
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[9px] font-bold tracking-[0.3em] uppercase pb-1" style={{ color: brandColor }}>Read More</span>
                      <div className="w-8 h-[1px] transition-all group-hover:w-16" style={{ backgroundColor: brandColor }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
