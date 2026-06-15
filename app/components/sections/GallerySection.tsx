'use client';

import React, { useMemo } from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc, cn } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface GallerySectionProps {
    gallerySection: Page['gallerySection'];
    className?: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallerySection, className }) => {
    if (!gallerySection?.enabled || !gallerySection.images || gallerySection.images.length === 0) return null;

    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    const images = useMemo(() => {
        return (gallerySection.images || []).map((image: any, index: number) => {
            const imageUrl = typeof image === 'string' ? image : image.url;
            const altText = typeof image === 'object' ? image.altText : '';
            return {
                key: `${imageUrl}-${index}`,
                imageUrl,
                altText,
            };
        });
    }, [gallerySection.images]);

    // Asymmetrical Grid Logic: Map images to specific slots
    const mainImg = images[0];
    const topSecondaryImg = images[1] || images[0];
    const bottomSecondaryImg = images[2] || images[1] || images[0];

    return (
        <section
            className={cn('section overflow-hidden', className)}
            style={{ backgroundColor: themeColors.pageBackground }}
        >
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-start">
                    
                    {/* Left Column: Main Focal Image & Typography */}
                    <div className="md:col-span-7 flex flex-col gap-12 lg:gap-20">
                        {/* Large Focal Image */}
                        <div className="relative aspect-[4/3] overflow-hidden group bg-gray-50">
                            <OptimizedImage
                                src={getImageSrc(mainImg.imageUrl)}
                                alt={mainImg.altText || ''}
                                fill
                                sizes="(max-width: 768px) 100vw, 58vw"
                                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                            />
                        </div>

                        {/* Editorial Typography Section */}
                        <div className="space-y-4 max-w-2xl">
                            <div 
                                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light tracking-[0.2em] transition-all uppercase leading-[1.3] text-balance"
                                style={{ 
                                    fontFamily: themeFonts.heading,
                                    color: themeColors.mainText
                                }}
                            >
                                <TiptapRenderer content={gallerySection.title} />
                                
                                {gallerySection.description && (
                                    <div 
                                        className="mt-4 text-sm md:text-base lg:text-lg italic font-medium tracking-[0.06em] leading-relaxed"
                                        style={{ color: themeColors.primaryButton || '#E31E24' }} 
                                    >
                                        <TiptapRenderer content={gallerySection.description} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stacked Architectural Details */}
                    <div className="md:col-span-5 flex flex-col gap-8 md:pt-16 lg:pt-24">
                        {/* Secondary Image Top (Landscape/Video Aspect) */}
                        <div className="relative aspect-video overflow-hidden group bg-gray-50 shadow-xl">
                           <OptimizedImage
                                src={getImageSrc(topSecondaryImg.imageUrl)}
                                alt={topSecondaryImg.altText || ''}
                                fill
                                sizes="(max-width: 768px) 100vw, 42vw"
                                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                            />
                        </div>

                        {/* Secondary Image Bottom (Taller Aspect) */}
                        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden group bg-gray-50 shadow-lg z-10">
                            <OptimizedImage
                                src={getImageSrc(bottomSecondaryImg.imageUrl)}
                                alt={bottomSecondaryImg.altText || ''}
                                fill
                                sizes="(max-width: 768px) 100vw, 42vw"
                                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                            />
                        </div>
                    </div>
                </div>

                {/* Optional: Overflow Grid (If more than 3 images exist) */}
                {images.length > 3 && (
                    <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-700">
                        {images.slice(3, 7).map((img, i) => (
                            <div 
                                key={img.key} 
                                className={cn(
                                    "relative aspect-square overflow-hidden grayscale hover:grayscale-0 transition-all duration-700",
                                    i % 2 === 1 ? "md:translate-y-8" : ""
                                )}
                            >
                                <OptimizedImage
                                    src={getImageSrc(img.imageUrl)}
                                    alt={img.altText || ''}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
