'use client';

import React, { useState } from 'react';
import { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn } from '@/app/lib/utils';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { Plus, Minus } from 'lucide-react';

interface FAQSectionProps {
    faqSection: Page['faqSection'];
    className?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqSection, className }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    if (!faqSection?.enabled || !faqSection.items || faqSection.items.length === 0) return null;

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const brandColor = themeColors.primaryButton || '#E31E24';

    return (
        <section
            className={cn('py-8 md:py-10 lg:py-12', className)}
            style={{ backgroundColor: themeColors.pageBackground, fontFamily: themeFonts.body }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 min-w-0">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">

                    {/* Left Column: Architectural Section Header */}
                    <div className="wb-sticky-heading lg:col-span-4 min-w-0 self-start lg:top-28 xl:top-36 space-y-10 z-10">
                        <div className="space-y-6">
                            <span
                                className="text-[10px] tracking-[0.4em] uppercase font-bold opacity-30"
                                style={{ color: themeColors.mainText }}
                            >
                                Frequently Asked Questions
                            </span>

                            {faqSection.title && (
                                <h2
                                    className="text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-extralight tracking-[0.06em] uppercase leading-[1.15] break-words [overflow-wrap:anywhere]"
                                    style={{
                                        color: themeColors.mainText,
                                        fontFamily: themeFonts.heading
                                    }}
                                >
                                    <TiptapRenderer content={faqSection.title} as="inline" />
                                </h2>
                            )}
                        </div>

                        {faqSection.description && (
                            <div
                                className="max-w-xs text-xs md:text-sm font-light leading-relaxed tracking-wider opacity-60 uppercase break-words"
                                style={{ color: themeColors.secondaryText }}
                            >
                                <TiptapRenderer content={faqSection.description} />
                            </div>
                        )}

                        {/* Signature Brand Detail */}
                        <div className="pt-8">
                            <div className="w-16 h-[2px]" style={{ backgroundColor: brandColor }} />
                        </div>
                    </div>

                    {/* Right Column: Premium Minimalist Accordion */}
                    <div className="lg:col-span-8 min-w-0">
                        <div className="border-t border-black/10">
                            {faqSection.items.map((item, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className="border-b border-black/10 overflow-hidden transition-all duration-700"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggle(index)}
                                            className="w-full flex items-start justify-between gap-4 py-5 lg:py-6 text-left group transition-all duration-300"
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-6 md:gap-10 lg:gap-12">
                                                <span
                                                    className={cn(
                                                        "shrink-0 text-[10px] mt-2.5 font-bold tracking-[0.2em] transition-all duration-500",
                                                        isOpen ? "opacity-100" : "opacity-20"
                                                    )}
                                                    style={{ color: isOpen ? brandColor : themeColors.mainText }}
                                                >
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                                <h3
                                                    className={cn(
                                                        "min-w-0 flex-1 text-lg md:text-xl lg:text-2xl xl:text-3xl font-extralight tracking-[0.04em] uppercase leading-snug break-words [overflow-wrap:anywhere] transition-all duration-500",
                                                        isOpen ? "italic" : "group-hover:opacity-50"
                                                    )}
                                                    style={{
                                                        color: themeColors.mainText,
                                                        fontFamily: themeFonts.heading
                                                    }}
                                                >
                                                    <TiptapRenderer content={item.question} as="inline" />
                                                </h3>
                                            </div>

                                            <div
                                                className={cn(
                                                    "shrink-0 transition-all duration-500 rounded-full w-10 md:w-12 h-10 md:h-12 flex items-center justify-center border",
                                                    isOpen ? "rotate-180 border-transparent shadow-lg text-white" : "border-black/10 group-hover:border-black/30"
                                                )}
                                                style={{
                                                    color: isOpen ? '#FFFFFF' : themeColors.mainText,
                                                    backgroundColor: isOpen ? brandColor : 'transparent',
                                                    borderColor: isOpen ? brandColor : undefined
                                                }}
                                            >
                                                {isOpen ? <Minus strokeWidth={1} size={18} /> : <Plus strokeWidth={1} size={18} />}
                                            </div>
                                        </button>

                                        <div
                                            className={cn(
                                                "grid transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)]",
                                                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            )}
                                        >
                                            <div className="overflow-hidden">
                                                <div
                                                    className="pl-12 md:pl-20 lg:pl-28 pb-6 text-sm md:text-base lg:text-lg font-light leading-relaxed tracking-wide opacity-70 max-w-2xl"
                                                    style={{ color: themeColors.secondaryText }}
                                                >
                                                    <TiptapRenderer content={item.answer} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
