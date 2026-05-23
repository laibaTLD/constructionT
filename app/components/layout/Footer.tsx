'use client';

import React from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeFonts, useThemeColors } from '@/app/hooks/useTheme';
import Link from 'next/link';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import {
  ArrowUpRight,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube
} from 'lucide-react';
import { getImageSrc } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';

const isNonEmptyTiptap = (value: unknown): boolean => {
  if (!value) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).includes('"text"');
    } catch {
      return true;
    }
  }
  return false;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isEnabledFlag = (value: unknown): boolean => {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  return false;
};

type SocialLinkItem = {
  platform?: string;
  url: string;
};

const getSocialLinkUrl = (link: unknown): string | null => {
  if (!link || typeof link !== 'object') return null;
  const record = link as Record<string, unknown>;
  const candidates = [record.url, record.href, record.link];
  const found = candidates.find((value) => isNonEmptyString(value));
  return found ? found.trim() : null;
};

const normalizeSocialUrl = (url: string): string => {
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
};

const collectSocialLinks = (sources: unknown[]): SocialLinkItem[] => {
  const collected: SocialLinkItem[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const link of source) {
      const url = getSocialLinkUrl(link);
      if (!url) continue;
      const normalized = normalizeSocialUrl(url);
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      const record = link as Record<string, unknown>;
      collected.push({
        platform: isNonEmptyString(record.platform) ? record.platform : undefined,
        url: normalized
      });
    }
  }

  return collected;
};

const SocialPlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  const key = platform.trim().toLowerCase();
  const className = 'w-4 h-4';
  switch (key) {
    case 'facebook':
      return <Facebook className={className} aria-hidden />;
    case 'instagram':
      return <Instagram className={className} aria-hidden />;
    case 'linkedin':
      return <Linkedin className={className} aria-hidden />;
    case 'youtube':
      return <Youtube className={className} aria-hidden />;
    case 'x':
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.12 2.51 7.65 6.08 9.17-.08-.74-.02-1.63.2-2.43.22-.94 1.47-6.27 1.47-6.27s-.37-.74-.37-1.83c0-1.71 1-2.99 2.24-2.99 1.06 0 1.57.79 1.57 1.74 0 1.06-.68 2.65-1.03 4.12-.29 1.23.62 2.23 1.84 2.23 2.21 0 3.91-2.33 3.91-5.69 0-2.97-2.13-5.05-5.18-5.05-3.53 0-5.6 2.65-5.6 5.38 0 1.06.41 2.2.93 2.82.1.12.12.23.09.35l-.34 1.36c-.05.2-.16.25-.37.15-1.38-.64-2.25-2.66-2.25-4.3 0-3.5 2.54-6.72 7.33-6.72 3.85 0 6.84 2.74 6.84 6.4 0 3.82-2.41 6.9-5.76 6.9-1.13 0-2.19-.59-2.55-1.28l-.69 2.64c-.25.97-.93 2.18-1.39 2.92 1.05.32 2.16.5 3.31.5 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
        </svg>
      );
    case 'yelp':
      return <span className="text-xs font-bold leading-none" aria-hidden>Y</span>;
    default:
      return <Globe className={className} aria-hidden />;
  }
};

export const Footer: React.FC = () => {
  const { site } = useWebBuilder();
  const themeFonts = useThemeFonts();
  const themeColors = useThemeColors();

  const siteFooter = site?.footer;
  const business = site?.business;
  const address = business?.address;

  const normalizeHref = (href: unknown): string => {
    if (typeof href !== 'string') return '';
    const trimmed = href.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
      return trimmed;
    }
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  };

  const bgColor = themeColors.primaryButton;
  const textColor = '#ffffff';
  const mutedText = 'rgba(255,255,255,0.65)';
  const subtleBorder = 'rgba(255,255,255,0.12)';
  const subtleBg = 'rgba(255,255,255,0.06)';

  const logoUrl = isNonEmptyString(siteFooter?.logo?.url)
    ? siteFooter.logo.url
    : isNonEmptyString(site?.theme?.logoUrl)
      ? site.theme.logoUrl
      : null;
  const businessName = isNonEmptyString(business?.name)
    ? business.name
    : isNonEmptyString(site?.name)
      ? site.name
      : null;
  const businessTagline = isNonEmptyString(business?.tagline) ? business.tagline : null;
  const logoAlt = siteFooter?.logo?.altText || businessName || 'Logo';

  const rawDescriptionCandidates: unknown[] = [
    siteFooter?.description,
    business?.description
  ];
  const resolvedDescription: string | object | null =
    (rawDescriptionCandidates.find((d) => isNonEmptyString(d) || isNonEmptyTiptap(d)) as string | object | undefined) ?? null;
  const isDescriptionTiptap = !!resolvedDescription && typeof resolvedDescription === 'object';
  const descriptionString = isNonEmptyString(resolvedDescription) ? resolvedDescription : null;

  const footerRecord = siteFooter as {
    showSocialLinks?: unknown;
    showSocialMediaLinks?: unknown;
    socialLinks?: SocialLinkItem[];
  } | undefined;

  const rawShowSocialLinks = footerRecord?.showSocialLinks;
  const showSocialByFlag =
    rawShowSocialLinks === undefined || rawShowSocialLinks === null
      ? true
      : isEnabledFlag(rawShowSocialLinks) || isEnabledFlag(footerRecord?.showSocialMediaLinks);

  const socialLinkSources: unknown[] = [
    site?.socialLinks,
    footerRecord?.socialLinks,
    (business as { socialLinks?: SocialLinkItem[] } | undefined)?.socialLinks
  ];
  const allSocialLinks = collectSocialLinks(socialLinkSources);
  const socialLinks: SocialLinkItem[] =
    showSocialByFlag || allSocialLinks.length > 0 ? allSocialLinks : [];

  const siteColumns = (siteFooter?.columns || [])
    .map((col) => ({
      title: isNonEmptyString(col?.title) ? col.title : '',
      links: (col?.links || [])
        .filter((l) => isNonEmptyString(l?.label) && isNonEmptyString(l?.url))
        .map((l) => ({ label: l.label, url: normalizeHref(l.url) }))
    }))
    .filter((col) => col.links.length > 0);

  const contactPhone = isNonEmptyString(business?.phone) ? business.phone : null;
  const contactEmail = isNonEmptyString(business?.email) ? business.email : null;
  const addressLine1 = isNonEmptyString(address?.street) ? address.street : null;
  const addressLine2Parts = [
    isNonEmptyString(address?.city) ? address.city : null,
    isNonEmptyString(address?.state) ? address.state : null,
    isNonEmptyString(address?.zipCode) ? address.zipCode : null
  ].filter(Boolean) as string[];
  const addressLine2 = addressLine2Parts.length
    ? `${addressLine2Parts[0]}${addressLine2Parts[1] ? `, ${addressLine2Parts[1]}` : ''}${addressLine2Parts[2] ? ` ${addressLine2Parts[2]}` : ''}`
    : null;
  const addressCountry = isNonEmptyString(address?.country) ? address.country : null;
  const hasAddress = Boolean(addressLine1 || addressLine2 || addressCountry);
  const hasContact = Boolean(contactPhone || contactEmail || hasAddress);

  const siteCopyright = isNonEmptyTiptap(siteFooter?.copyright) ? siteFooter?.copyright : null;
  const hasCopyright = Boolean(siteCopyright);

  const hasBrand = Boolean(logoUrl || businessName || businessTagline || resolvedDescription);
  const hasSocial = socialLinks.length > 0;
  const hasSiteColumns = siteColumns.length > 0;
  const hasAnyContent = hasBrand || hasSocial || hasSiteColumns || hasContact || hasCopyright;

  if (!hasAnyContent) return null;

  const eyebrowClass = 'text-[11px] font-semibold uppercase tracking-[0.25em]';

  const renderLink = (label: string, url: string, key: string) => {
    const isExternal = url.startsWith('http://') || url.startsWith('https://');
    if (isExternal) {
      return (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-base hover:opacity-80 transition-opacity"
          style={{ color: textColor }}
        >
          <span className="font-light">{label}</span>
          <ArrowUpRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
        </a>
      );
    }
    return (
      <Link
        key={key}
        href={url}
        className="group inline-flex items-center gap-2 text-base hover:opacity-80 transition-opacity"
        style={{ color: textColor }}
      >
        <span className="font-light">{label}</span>
        <ArrowUpRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
      </Link>
    );
  };

  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: themeFonts.body }}
    >
      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 pt-10 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-x-10 lg:gap-x-16 items-start">
          {(hasBrand || hasSocial) && (
            <div className={`md:col-span-12 ${hasSiteColumns || hasContact ? 'lg:col-span-5' : ''} flex flex-col gap-2`}>
              {logoUrl && (
                <div className="relative h-24 w-auto self-start min-w-[120px]">
                  <OptimizedImage
                    src={getImageSrc(logoUrl)}
                    alt={logoAlt}
                    fill
                    sizes="(max-width: 768px) 180px, 260px"
                    className="object-contain object-left"
                  />
                </div>
              )}

              {(businessName || businessTagline) && (
                <div className="space-y-1">
                  {businessName && (
                    <h2 className="text-2xl md:text-3xl font-semibold leading-tight" style={{ color: textColor }}>
                      {businessName}
                    </h2>
                  )}
                  {businessTagline && (
                    <p className={eyebrowClass} style={{ color: mutedText }}>
                      {businessTagline}
                    </p>
                  )}
                </div>
              )}

              {resolvedDescription && (
                <div className="text-sm leading-relaxed max-w-md" style={{ color: mutedText }}>
                  {isDescriptionTiptap ? (
                    <TiptapRenderer content={resolvedDescription} as="inline" />
                  ) : (
                    <p>{descriptionString}</p>
                  )}
                </div>
              )}

              {hasSocial && (
                <div className="flex flex-col gap-3 pt-2">
                  <h3 className={eyebrowClass} style={{ color: mutedText }}>
                    Follow Us
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {socialLinks.map((link, idx) => {
                      const platformKey = link.platform || 'social';
                      return (
                        <a
                          key={link.url || `social-${idx}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                          style={{
                            color: textColor,
                            border: `1px solid ${subtleBorder}`,
                            backgroundColor: subtleBg
                          }}
                          aria-label={platformKey}
                          title={platformKey}
                        >
                          <SocialPlatformIcon platform={platformKey} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {siteColumns.map((col, colIdx) => (
            <div key={`${col.title}-${colIdx}`} className="md:col-span-6 lg:col-span-3 flex flex-col gap-5 md:pt-20">
              {col.title && (
                <h3 className={eyebrowClass} style={{ color: mutedText }}>
                  {col.title}
                </h3>
              )}
              <span className="block w-10 h-px" style={{ backgroundColor: subtleBorder }} aria-hidden />
              <nav className="flex flex-col gap-3">
                {col.links.map((link, linkIdx) =>
                  renderLink(link.label, link.url, `${link.url}-${linkIdx}`)
                )}
              </nav>
            </div>
          ))}

          {hasContact && (
            <div className="md:col-span-6 lg:col-span-4 flex flex-col gap-5 md:pt-20">
              <h3 className={eyebrowClass} style={{ color: mutedText }}>
                Get in Touch
              </h3>
              <span className="block w-10 h-px" style={{ backgroundColor: subtleBorder }} aria-hidden />
              <ul className="flex flex-col gap-4 text-sm">
                {contactPhone && (
                  <li>
                    <a
                      href={`tel:${contactPhone}`}
                      className="group inline-flex items-start gap-3 hover:opacity-80 transition-opacity"
                      style={{ color: textColor }}
                    >
                      <span
                        className="mt-0.5 inline-flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: subtleBg, border: `1px solid ${subtleBorder}` }}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-base font-light">{contactPhone}</span>
                    </a>
                  </li>
                )}
                {contactEmail && (
                  <li>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="group inline-flex items-start gap-3 hover:opacity-80 transition-opacity break-all"
                      style={{ color: textColor }}
                    >
                      <span
                        className="mt-0.5 inline-flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: subtleBg, border: `1px solid ${subtleBorder}` }}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-base font-light">{contactEmail}</span>
                    </a>
                  </li>
                )}
                {hasAddress && (
                  <li className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subtleBg, border: `1px solid ${subtleBorder}` }}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <address className="not-italic text-sm leading-relaxed" style={{ color: mutedText }}>
                      {addressLine1 && <>{addressLine1}<br /></>}
                      {addressLine2 && <>{addressLine2}<br /></>}
                      {addressCountry && <>{addressCountry}</>}
                    </address>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {hasCopyright && (
        <div className="relative" style={{ borderTop: `1px solid ${subtleBorder}` }}>
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 py-5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-xs" style={{ color: mutedText }}>
              <div>
                <TiptapRenderer content={siteCopyright} as="inline" />
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
