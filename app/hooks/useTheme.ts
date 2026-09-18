'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

export interface ThemeColors {
  // Text colors
  mainText: string;
  secondaryText: string;
  darkPrimaryText: string;
  darkSecondaryText: string;
  lightPrimaryText: string;
  lightSecondaryText: string;
  // Background colors
  pageBackground: string;
  sectionBackground: string;
  sectionBackgroundLight: string;
  sectionBackgroundDark: string;
  cardBackground: string;
  cardBackgroundLight: string;
  cardBackgroundDark: string;
  // Button/UI colors
  primaryButton: string;
  primaryButtonLight: string;
  primaryButtonDark: string;
  hoverActive: string;
  hoverActiveLight: string;
  hoverActiveDark: string;
  inactive: string;
  inactiveLight: string;
  inactiveDark: string;

}

export interface ThemeFonts {
  heading?: string;
  body?: string;
}

type ThemeFontSource = {
  headingFont?: string;
  bodyFont?: string;
};

/** One typeface for the whole site. Prefer the heading font, then body. */
export function resolveThemeFont(theme?: ThemeFontSource | null): string | undefined {
  const heading = typeof theme?.headingFont === 'string' ? theme.headingFont.trim() : '';
  const body = typeof theme?.bodyFont === 'string' ? theme.bodyFont.trim() : '';
  return heading || body || undefined;
}

export function toCssFontFamily(fontName: string): string {
  const name = fontName.trim();
  if (!name) return 'ui-sans-serif, system-ui, sans-serif';
  if (name.includes(',')) return name;
  const quoted = /\s/.test(name) ? `"${name.replace(/"/g, '')}"` : name;
  return `${quoted}, ui-sans-serif, system-ui, sans-serif`;
}

export function useThemeColors(): ThemeColors {
  const { site } = useWebBuilder();
  const theme = site?.theme;

  return {
    // These now refer to the CSS variables that are injected by ThemeFontWrapper
    mainText: 'var(--wb-text-main)',
    secondaryText: 'var(--wb-text-secondary)',
    darkPrimaryText: 'var(--wb-text-on-dark)',
    darkSecondaryText: 'var(--wb-text-on-dark-secondary)',
    lightPrimaryText: 'var(--wb-text-main)',
    lightSecondaryText: 'var(--wb-text-secondary)',
    pageBackground: 'var(--wb-page-bg)',
    sectionBackground: 'var(--wb-section-bg-light)',
    sectionBackgroundLight: 'var(--wb-section-bg-light)',
    sectionBackgroundDark: 'var(--wb-section-bg-dark)',
    cardBackground: 'var(--wb-card-bg-light)',
    cardBackgroundLight: 'var(--wb-card-bg-light)',
    cardBackgroundDark: 'var(--wb-card-bg-dark)',
    primaryButton: 'var(--wb-primary)',
    primaryButtonLight: 'var(--wb-primary)',
    primaryButtonDark: 'var(--wb-primary)',
    hoverActive: 'var(--wb-primary-hover)',
    hoverActiveLight: 'var(--wb-primary-hover)',
    hoverActiveDark: 'var(--wb-primary-hover)',
    inactive: 'var(--color-gray-400)',
    inactiveLight: 'var(--color-gray-300)',
    inactiveDark: 'var(--color-gray-600)',
  };
}

export function useThemeFonts(): ThemeFonts {
  const { site } = useWebBuilder();
  const font = resolveThemeFont(site?.theme);
  return {
    heading: font,
    body: font,
  };
}
