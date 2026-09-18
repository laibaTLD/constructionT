'use client';

import React from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Reveal } from '@/app/components/ui/Reveal';

interface CompanyDetailSectionProps {
   companyDetailSection: Page['companyDetailSection'];
   className?: string;
}

export const CompanyDetailSection: React.FC<CompanyDetailSectionProps> = ({ companyDetailSection, className }) => {
   const themeColors = useThemeColors();

   if (!companyDetailSection?.enabled) return null;

   const details = companyDetailSection.details || [];
   const brandColor = themeColors.primaryButton;

   return (
      <div 
         className={cn("relative w-full", className)} 
         style={{ backgroundColor: brandColor }} 
      >
         {/* PHASE 1: HERO TITLE */}
         <section
            className="sticky top-0 h-screen w-full flex items-center justify-center z-10"
            style={{ backgroundColor: themeColors.pageBackground }}
         >
            <div className="title-inner w-full text-center select-none px-6">
               {companyDetailSection.title && (
                  <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold uppercase tracking-[-0.05em] leading-none" style={{ color: brandColor }}>
                     <TiptapRenderer content={companyDetailSection.title} as="inline" />
                  </h2>
               )}
            </div>
         </section>

         {/* PHASE 2: SUB-SECTIONS */}
         <div className="relative z-20 w-full">
            {details.map((d, idx) => {
               const imageUrl = getImageSrc(d.image?.url);
               const title = d.title || d.label;
               const description = d.description || d.value;

               return (
                  <div key={idx} className="story-journey-part relative w-full">
                     {/* PINNED IMAGE CONTAINER */}
                     <section className="story-image-container sticky top-0 h-screen w-full overflow-hidden">
                        <img
                           src={imageUrl}
                           alt={d.image?.altText || 'Company Detail'}
                           className="w-full h-full object-cover scale-110"
                        />
{/* Architectural Overlay UI */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-20 h-20 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full shadow-xl" />
                            </div>
                        </div>
                     </section>

                     {/* TEXT BAR: This slides over the image */}
                     <section 
                        className="story-detail-bar relative z-30 py-12 md:py-16 lg:py-20 px-8 md:px-16 lg:px-24 w-full" 
                        style={{ backgroundColor: brandColor }}
                     >
                        <div className="max-w-7xl mx-auto">
                           <div className="flex flex-col gap-12">
                              <div className="border-l border-white/30 pl-8 md:pl-12">
                                 <Reveal>
                                 <span className="reveal-text block text-[10px] font-bold tracking-[0.6em] uppercase text-white/40 mb-8">
                                    {d.label || `Part 0${idx + 1}`}
                                 </span>
                                 <h3 className="reveal-text text-3xl md:text-5xl lg:text-6xl font-sans font-light uppercase tracking-tighter text-white leading-[0.85]">
                                    <TiptapRenderer content={title} as="inline" />
                                 </h3>
                                 </Reveal>
                              </div>

                              <div className="max-w-2xl ml-auto md:mr-12">
                                 <Reveal delayMs={120}>
                                 <div className="reveal-text text-white/70 text-lg md:text-2xl font-light leading-relaxed">
                                    <TiptapRenderer content={description} />
                                 </div>
                                 </Reveal>
                              </div>
                           </div>
                        </div>
                     </section>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default CompanyDetailSection;