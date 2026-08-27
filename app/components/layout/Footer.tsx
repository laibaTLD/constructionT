'use client';

import React from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeFonts, useThemeColors } from '@/app/hooks/useTheme';
import { getImageSrc } from '@/app/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { tiptapToText } from '@/app/lib/seo';

export const Footer: React.FC = () => {
  const { site, pages, services } = useWebBuilder();
  const themeFonts = useThemeFonts();
  const themeColors = useThemeColors();

  const business = site?.business;
  const address = business?.address;
  const legal = site?.legal;
  const brandName = business?.name || site?.name || 'Site Name';
  const logoUrl = getImageSrc(site?.theme?.logoUrl);
  const copyrightContent = site?.footer?.copyright;
  const hasCopyright = Boolean(
    typeof copyrightContent === 'string'
      ? copyrightContent.trim()
      : tiptapToText(copyrightContent).trim()
  );

  const defaultSlugByType: Record<string, string> = {
    home: '',
    about: 'about-us',
    contact: 'contact-us',
    'blog-list': 'blog',
    'service-list': 'services',
    testimonials: 'testimonials',
    'project-list': 'project-detail',
  };

  const normalizeSlug = (slug: unknown) => {
    if (typeof slug !== 'string') return '';
    const trimmed = slug.trim();
    if (!trimmed) return '';
    return trimmed.replace(/^\/+|\/+$/g, '').toLowerCase();
  };

  const getPageHref = (page: Page) => {
    if (page.pageType === 'home') return '/';
    const slug = normalizeSlug(page.slug) || defaultSlugByType[page.pageType];
    return slug ? `/${slug}` : '/';
  };

  const contactPage = (pages || []).find(
    (p) =>
      p.status === 'published' &&
      (p.pageType === 'contact' || (typeof p.slug === 'string' && p.slug.includes('contact')))
  );
  const contactUrl = contactPage ? getPageHref(contactPage) : '/contact-us';

  // All published pages
  const publishedPages = (pages || [])
    .filter((page) => page.status === 'published')
    .filter((page, index, arr) => {
      const key = page._id || normalizeSlug(page.slug) || `${page.pageType}-${page.name}`;
      return (
        arr.findIndex(
          (p) => (p._id || normalizeSlug(p.slug) || `${p.pageType}-${p.name}`) === key
        ) === index
      );
    });

  const publishedServices = (services || []).filter(
    (s) => !s.status || s.status === 'published'
  );

  const addressLine = address
    ? [address.street, [address.city, address.state].filter(Boolean).join(', '), address.zipCode]
        .filter(Boolean)
        .join(' · ')
    : '';

  const legalPages = [
    {
      href: '/privacy-policy',
      label: legal?.privacyPolicy?.heading || 'Privacy Policy',
    },
    {
      href: '/terms-of-service',
      label: legal?.termsOfService?.heading || 'Terms of Service',
    },
  ];

  const linkClass =
    'block text-[11px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white';

  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{
        backgroundColor: themeColors.sectionBackgroundDark,
        color: themeColors.darkPrimaryText,
        fontFamily: themeFonts.body,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-40"
        style={{ backgroundColor: themeColors.primaryButton }}
      />

      <div className="relative mx-auto max-w-[1800px] px-4 sm:px-6 md:px-12 lg:px-16 py-10 md:py-12">
        {/* Compact top row */}
        <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {logoUrl ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-sm md:h-14 md:w-14">
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <h2
                className="truncate text-lg font-light uppercase tracking-[0.14em] md:text-xl"
                style={{ fontFamily: themeFonts.heading }}
              >
                {brandName}
              </h2>
              {addressLine ? (
                <p className="mt-1 truncate text-[9px] uppercase tracking-[0.2em] text-white/45">
                  {addressLine}
                </p>
              ) : null}
            </div>
          </div>

          <Link
            href={contactUrl}
            className="group inline-flex shrink-0 items-center gap-3 self-start border border-white/25 px-5 py-3 transition-all duration-300 hover:bg-white sm:self-auto"
            style={
              {
                ['--footer-cta-color' as string]: themeColors.sectionBackgroundDark,
              } as React.CSSProperties
            }
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] transition-colors group-hover:text-[color:var(--footer-cta-color)]">
              Contact
            </span>
            <ArrowUpRight
              size={14}
              className="transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--footer-cta-color)]"
            />
          </Link>
        </div>

        {/* Columns: Contact | Pages | Services | Legal */}
        <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Contact */}
          <div className="space-y-3">
            <span className="block text-[9px] uppercase tracking-[0.35em] text-white/40">
              Contact
            </span>
            <div className="space-y-2">
              {business?.phone ? (
                <a href={`tel:${business.phone}`} className={linkClass}>
                  {business.phone}
                </a>
              ) : null}
              {business?.emergencyPhone ? (
                <a href={`tel:${business.emergencyPhone}`} className={linkClass}>
                  {business.emergencyPhone}
                </a>
              ) : null}
              {business?.email ? (
                <a href={`mailto:${business.email}`} className={`${linkClass} break-all normal-case tracking-[0.04em]`}>
                  {business.email}
                </a>
              ) : null}
              {!business?.phone && !business?.emergencyPhone && !business?.email ? (
                <span className="text-[11px] text-white/40">—</span>
              ) : null}
            </div>
          </div>

          {/* All published pages */}
          <div className="space-y-3">
            <span className="block text-[9px] uppercase tracking-[0.35em] text-white/40">
              Pages
            </span>
            <nav className="flex flex-col gap-2">
              {publishedPages.map((page) => (
                <Link
                  key={page._id || page.slug || page.pageType || page.name}
                  href={getPageHref(page)}
                  className={linkClass}
                >
                  {page.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services column */}
          <div className="space-y-3">
            <span className="block text-[9px] uppercase tracking-[0.35em] text-white/40">
              Services
            </span>
            <nav className="flex flex-col gap-2">
              {publishedServices.length > 0 ? (
                publishedServices.map((service) => (
                  <Link
                    key={service._id || service.slug}
                    href={`/service/${service.slug}`}
                    className={linkClass}
                  >
                    {service.name}
                  </Link>
                ))
              ) : (
                <Link href="/services" className={linkClass}>
                  View all services
                </Link>
              )}
            </nav>
          </div>

          {/* Legal pages */}
          <div className="space-y-3">
            <span className="block text-[9px] uppercase tracking-[0.35em] text-white/40">
              Legal
            </span>
            <nav className="flex flex-col gap-2">
              {legalPages.map((page) => (
                <Link key={page.href} href={page.href} className={linkClass}>
                  {page.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 text-[9px] uppercase tracking-[0.2em] text-white/40 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-white [&_p]:m-0">
          {hasCopyright ? (
            <TiptapRenderer content={copyrightContent} as="inline" />
          ) : (
            <span>
              © {new Date().getFullYear()} {brandName}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
