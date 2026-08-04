'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getImageSrc, cn } from '@/app/lib/utils';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Page } from '@/app/lib/types';
import gsap from 'gsap';

export const Header: React.FC = () => {
  const { site, pages, services } = useWebBuilder();
  const themeColors = useThemeColors();

  const headerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [openServiceKey, setOpenServiceKey] = useState<string | null>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const next = window.scrollY > 60;
      setIsScrolled((prev) => (prev === next ? prev : next));
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      setIsServicesOpen(false);
      setOpenServiceKey(null);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isServicesOpen) setOpenServiceKey(null);
  }, [isServicesOpen]);

  useEffect(() => {
    if (!isServicesOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
        setOpenServiceKey(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isServicesOpen]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gentle entrance
      gsap.fromTo(headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out', delay: 0.8 }
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Specific Order: Home | About | Blog | Service | Serving Areas | Testimonials | Contact
  const orderedNavPages = useMemo(() => {
    if (!pages) return [];

    // Explicit requested order mapping
    const orderMap: Record<string, number> = {
      'home': 1,
      'about': 2,
      'blog-list': 3,
      'service-list': 4,
      'serving-areas': 5,
      'testimonials': 6,
      'contact': 7
    };

    const published = pages
      .filter((p) => p.status === 'published' && (p._id || p.slug))
      .filter((p, i, arr) => {
        const key = p._id || p.slug;
        return arr.findIndex((x) => (x._id || x.slug) === key) === i;
      });

    return published.sort((a, b) => {
      const aVal = orderMap[a.pageType] || 99;
      const bVal = orderMap[b.pageType] || 99;
      return aVal - bVal;
    });
  }, [pages]);

  const publishedServices = useMemo(
    () => (services || []).filter((s) => !s.status || s.status === 'published'),
    [services]
  );

  const slugify = (value: string) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const getServiceAreas = (service: (typeof publishedServices)[number]) => {
    const serviceAreas = service.serviceAreas;
    if (Array.isArray(serviceAreas) && serviceAreas.length > 0) return serviceAreas;
    return Array.isArray(site?.serviceAreas) ? site.serviceAreas.filter(Boolean) : [];
  };

  if (!site) return null;

  const getPageHref = (p: Page) => {
    if (p.pageType === 'home') return '/';
    if (p.slug) return `/${p.slug}`;
    const byType: Record<string, string> = {
      about: '/about-us',
      contact: '/contact-us',
      'blog-list': '/blog',
      'service-list': '/services',
      testimonials: '/testimonials',
      'project-list': '/project-detail',
      'serving-areas': '/services',
    };
    return byType[p.pageType] || '/';
  };

  const brandName = (site?.business?.name || site?.name || '').toUpperCase();
  const brandColor = themeColors.primaryButton;

  // Format address specifically to avoid ReactNode error
  const addressString = site.business?.address
    ? typeof site.business.address === 'string'
      ? site.business.address
      : `${site.business.address.street || ''} ${site.business.address.city || ''} ${site.business.address.state || ''}`.trim()
    : '';

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] px-4 sm:px-8 md:px-16 lg:px-20',
          isScrolled ? 'py-4 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.05)]' : 'py-8 md:py-12 bg-transparent',
          isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">

          <Link href="/" className="group flex items-center outline-none">
            {site.theme?.logoUrl ? (
              <img
                src={getImageSrc(site.theme.logoUrl)}
                alt={brandName}
                className={cn(
                  "h-12 md:h-10 w-auto transition-all duration-500",
                  isScrolled ? "brightness-100" : "brightness-0 invert"
                )}
              />
            ) : (
              <span className={cn(
                "text-xs md:text-sm font-medium tracking-[0.5em] uppercase transition-colors duration-500",
                isScrolled ? "text-black" : "text-white"
              )}>
                {brandName}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-12 lg:gap-16">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-4 group outline-none"
            >
              <span className={cn(
                "text-[9px] font-bold tracking-[0.3em] uppercase transition-colors duration-500",
                isScrolled ? "text-black" : "text-white"
              )}>Menu</span>
              <div className="flex flex-col gap-1.5">
                <div className="w-6 h-[1.5px] transition-all duration-500" style={{ backgroundColor: brandColor }} />
                <div className="w-6 h-[1.5px] transition-all duration-500" style={{ backgroundColor: brandColor }} />
              </div>
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[200] pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)]",
          isMenuOpen ? "opacity-100" : "opacity-0 invisible"
        )}
      >
        {/* TOP FRAME - Links start from left */}
          <div
            className={cn(
              "absolute top-0 left-0 w-full min-h-[70px] md:h-[80px] flex flex-wrap items-center justify-between gap-y-2 px-4 sm:px-8 md:px-12 lg:px-16 py-3 md:py-0 z-[210] pointer-events-auto transition-transform duration-700 delay-100 overflow-visible",
              isMenuOpen ? "translate-y-0" : "-translate-y-full"
            )}
            style={{ backgroundColor: brandColor, color: 'white' }}
          >
          {/* Navigation Container Aligned Left */}
          <div className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4 md:gap-8 lg:gap-10 min-w-0 overflow-visible">
            {orderedNavPages.map((p, i) => {
              const isServicesNav = p.pageType === 'service-list';

              if (isServicesNav && publishedServices.length > 0) {
                return (
                  <div
                    key={p._id || p.slug || `nav-${i}`}
                    ref={servicesDropdownRef}
                    className="relative shrink-0 overflow-visible"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => {
                      setIsServicesOpen(false);
                      setOpenServiceKey(null);
                    }}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold tracking-[0.3em] uppercase whitespace-nowrap hover:opacity-60 transition-opacity outline-none"
                      onClick={() => setIsServicesOpen((open) => !open)}
                      aria-expanded={isServicesOpen}
                      aria-haspopup="true"
                    >
                      {p.name}
                      <svg
                        className={cn(
                          'w-2.5 h-2.5 transition-transform duration-200',
                          isServicesOpen && 'rotate-180'
                        )}
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <div
                      className={cn(
                        'absolute top-full left-0 pt-3 min-w-[240px] transition-all duration-200 overflow-visible z-50',
                        isServicesOpen
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                      )}
                    >
                      <div className="bg-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.15)] py-3 overflow-visible">
                        <Link
                          href={getPageHref(p)}
                          className="block px-5 py-2.5 text-[8px] md:text-[9px] font-bold tracking-[0.25em] uppercase text-black/40 hover:text-black transition-colors"
                          onClick={() => {
                            setIsServicesOpen(false);
                            setOpenServiceKey(null);
                            setIsMenuOpen(false);
                          }}
                        >
                          All Services
                        </Link>
                        <div className="mx-5 my-1 h-px bg-black/10" />
                        {publishedServices.map((service) => {
                          const serviceKey = service._id || service.slug;
                          const areas = getServiceAreas(service);
                          const hasAreas = areas.length > 0;
                          const isNestedOpen = openServiceKey === serviceKey;

                          return (
                            <div
                              key={serviceKey}
                              className="relative"
                              onMouseEnter={() => hasAreas && setOpenServiceKey(serviceKey)}
                              onMouseLeave={() => setOpenServiceKey(null)}
                            >
                              <div className="flex items-center">
                                <Link
                                  href={`/service/${service.slug}`}
                                  className="flex-1 px-5 py-2.5 text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase break-words hover:bg-black/5 transition-colors"
                                  onClick={() => {
                                    setIsServicesOpen(false);
                                    setOpenServiceKey(null);
                                    setIsMenuOpen(false);
                                  }}
                                >
                                  {service.name}
                                </Link>
                                {hasAreas && (
                                  <button
                                    type="button"
                                    className="px-3 py-2.5 text-black/40 hover:text-black hover:bg-black/5 transition-colors outline-none"
                                    aria-expanded={isNestedOpen}
                                    aria-label={`${service.name} serving areas`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setOpenServiceKey(isNestedOpen ? null : serviceKey);
                                    }}
                                  >
                                    <svg
                                      className={cn(
                                        'w-2.5 h-2.5 transition-transform duration-200',
                                        isNestedOpen && 'rotate-90'
                                      )}
                                      viewBox="0 0 12 12"
                                      fill="none"
                                      aria-hidden="true"
                                    >
                                      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </button>
                                )}
                              </div>

                              {hasAreas && (
                                <div
                                  className={cn(
                                    'min-w-[200px] transition-all duration-200 z-50',
                                    'max-md:relative max-md:pl-0 max-md:w-full',
                                    'md:absolute md:left-full md:top-0 md:pl-1',
                                    isNestedOpen
                                      ? 'opacity-100 visible translate-x-0'
                                      : 'max-md:hidden md:opacity-0 md:invisible md:-translate-x-1 md:pointer-events-none'
                                  )}
                                >
                                  <div className="bg-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.15)] py-3 max-h-[50vh] overflow-y-auto no-scrollbar">
                                    <div className="px-5 py-2 text-[7px] md:text-[8px] font-bold tracking-[0.25em] uppercase text-black/35">
                                      Serving Areas
                                    </div>
                                    <div className="mx-5 my-1 h-px bg-black/10" />
                                    {areas.map((area, idx) => {
                                      const cityName = typeof area === 'string' ? area : area.city;
                                      const regionName = typeof area === 'string' ? '' : (area.region || '');
                                      const citySlug = regionName
                                        ? `${slugify(cityName)}-${slugify(regionName)}`
                                        : slugify(cityName);
                                      const displayName = `${cityName}${regionName ? `, ${regionName}` : ''}`;

                                      return (
                                        <Link
                                          key={`${serviceKey}-${citySlug}-${idx}`}
                                          href={`/service/${service.slug}/service-areas/${citySlug}`}
                                          className="block px-5 py-2.5 text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase break-words hover:bg-black/5 transition-colors"
                                          onClick={() => {
                                            setIsServicesOpen(false);
                                            setOpenServiceKey(null);
                                            setIsMenuOpen(false);
                                          }}
                                        >
                                          {displayName}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={p._id || p.slug || `nav-${i}`}
                  href={getPageHref(p)}
                  className="text-[8px] md:text-[9px] font-bold tracking-[0.3em] uppercase break-words sm:whitespace-nowrap hover:opacity-60 transition-opacity"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {p.name}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 group outline-none ml-8 shrink-0"
          >
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase hidden md:inline">Close</span>
            <div className="relative w-8 h-8 flex items-center justify-center rounded-full border border-white/20 group-hover:bg-white/10 transition-all">
              <div className="absolute w-3.5 h-[1.2px] bg-white rotate-45" />
              <div className="absolute w-3.5 h-[1.2px] bg-white -rotate-45" />
            </div>
          </button>
        </div>

        <div
          className={cn(
            "absolute top-0 left-0 w-4 md:w-8 lg:w-10 h-full transition-transform duration-700",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ backgroundColor: brandColor }}
        />

        <div
          className={cn(
            "absolute top-0 right-0 w-4 md:w-8 lg:w-10 h-full transition-transform duration-700",
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          style={{ backgroundColor: brandColor }}
        />

        <div
          className={cn(
            "absolute bottom-0 left-0 w-full h-8 md:h-12 lg:h-16 flex items-center justify-center px-8 transition-transform duration-700",
            isMenuOpen ? "translate-y-0" : "translate-y-full"
          )}
          style={{ backgroundColor: brandColor, color: 'white' }}
        >
          <div className="text-[7px] md:text-[8px] font-light tracking-[0.2em] sm:tracking-[0.4em] uppercase opacity-60 text-center break-words px-2">
            {addressString} &bull; {site.business.email}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        ${isMenuOpen ? `
          body {
            overflow: hidden;
            height: 100vh;
            transition: transform 0.7s cubic-bezier(0.85, 0, 0.15, 1);
          }
          @media (min-width: 1024px) {
            body { transform: scale(0.98); }
          }
        ` : ''}
      `}</style>
    </>
  );
};