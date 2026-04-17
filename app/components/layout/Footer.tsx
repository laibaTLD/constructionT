'use client';

import React from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeFonts, useThemeColors } from '@/app/hooks/useTheme';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';

export const Footer: React.FC = () => {
  const { site, pages } = useWebBuilder();
  const themeFonts = useThemeFonts();
  const themeColors = useThemeColors();

  const business = site?.business;
  const address = business?.address;
  const legal = site?.legal;

  // Find contact page
  const contactPage = pages.find(p => p.status === 'published' && (p.slug.includes('contact') || p.pageType === 'contact'));
  const contactUrl = contactPage ? `/${contactPage.slug}` : '#contact';

  const hasPhone = business?.phone || business?.emergencyPhone;
  const hasEmail = business?.email || business?.emergencyEmail;

  const normalizeSlug = (slug: unknown) => {
    if (typeof slug !== 'string') return '';
    const trimmed = slug.trim();
    if (!trimmed) return '';
    const noSlashes = trimmed.replace(/^\/+|\/+$/g, '');
    return noSlashes.toLowerCase();
  };

  const footerPages = pages
    .filter(page => page.status === 'published')
    .map(page => ({ page, slugKey: normalizeSlug(page.slug) }))
    .filter(({ slugKey }) => Boolean(slugKey))
    .filter(({ slugKey }, index, arr) => arr.findIndex(p => p.slugKey === slugKey) === index)
    .map(({ page }) => page);

  const pageTypeOrder: Array<
    'home' | 'about' | 'service-list' | 'blog-list' | 'project-list' | 'contact'
  > = ['home', 'about', 'service-list', 'blog-list', 'project-list', 'contact'];

  const isPage = (p: Page | undefined): p is Page => Boolean(p);

  const footerNavPages: Page[] = pageTypeOrder
    .map((t) => footerPages.find((p) => p.pageType === t))
    .filter(isPage);

  return (
    <footer
      className="py-16 md:py-24 text-white relative overflow-hidden"
      style={{
        backgroundColor: themeColors.primaryButton, // Using Theme Color instead of hardcoded Red
        fontFamily: themeFonts.body
      }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Brand Identity */}
          <div className="lg:col-span-7 space-y-8">
            <h2
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extralight tracking-[0.1em] uppercase leading-[0.9] text-balance"
              style={{ fontFamily: themeFonts.heading }}
            >
              {business?.name || site?.name || 'Site Name'}
            </h2>
            
            {address && (address.street || address.city) && (
              <div className="text-[8px] md:text-xs uppercase tracking-[0.3em] opacity-80 leading-loose max-w-md">
                <p>
                  {address.street}<br />
                  {address.city}{address.state && `, ${address.state}`} {address.zipCode}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Contact & Action */}
          <div className="lg:col-span-5 flex flex-col gap-12 lg:pl-12 border-l border-white/10">
            
            {/* Contact Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-4">
              {hasPhone && (
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-[0.4em] opacity-50 block">Telephone</span>
                  <div className="flex flex-col gap-2">
                    <a href={`tel:${business.phone}`} className="text-sm tracking-[0.15em] hover:opacity-60 transition-opacity">
                      {business.phone}
                    </a>
                    {business.emergencyPhone && (
                      <a href={`tel:${business.emergencyPhone}`} className="text-sm tracking-[0.15em] hover:opacity-60 transition-opacity">
                        {business.emergencyPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {hasEmail && (
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-[0.4em] opacity-50 block">Email</span>
                  <div className="flex flex-col gap-2">
                    <a href={`mailto:${business.email}`} className="text-sm tracking-[0.1em] hover:opacity-60 transition-opacity break-words">
                      {business.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Button */}
            {contactPage && (
              <div className="pt-4">
                <Link
                  href={contactUrl}
                  className="group bg-white text-black px-8 py-5 flex items-center justify-between w-full transition-all duration-500 hover:bg-opacity-90"
                  style={{ color: themeColors.primaryButton }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Ask for Info</span>
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full h-px bg-white/10 my-16 md:my-20" />

        {/* Bottom Bar: Legal & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-4 text-[7px] uppercase tracking-[0.2em] font-medium opacity-60">
          
          {/* Legal Section */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
             <span>© {new Date().getFullYear()} {business?.name || site?.name}</span>
            {legal?.termsOfService?.heading && (
              <Link href="/terms-of-service" className="hover:opacity-100 transition-opacity">
                {legal.termsOfService.heading}
              </Link>
            )}
            {legal?.privacyPolicy?.heading && (
              <Link href="/privacy-policy" className="hover:opacity-100 transition-opacity">
                {legal.privacyPolicy.heading}
              </Link>
            )}
          </div>

          {/* Navigation Section */}
          <nav className="flex flex-wrap gap-x-6 gap-y-3 justify-start md:justify-end">
            {footerNavPages.map((page: Page) => (
              <Link
                key={normalizeSlug(page.slug)}
                href={`/${normalizeSlug(page.slug)}`}
                className="hover:opacity-100 transition-opacity whitespace-nowrap"
              >
                {page.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;