'use client';

import React, { useEffect, useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { resolveThemeFont, toCssFontFamily } from '@/app/hooks/useTheme';

interface ThemeFontWrapperProps {
  children: React.ReactNode;
}

function isLoadableGoogleFont(fontName: string): boolean {
  const lower = fontName.trim().toLowerCase();
  if (!lower || lower.includes(',')) return false;
  return !['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace'].includes(lower);
}

export const ThemeFontWrapper: React.FC<ThemeFontWrapperProps> = ({ children }) => {
  const { site } = useWebBuilder();
  const font = useMemo(() => resolveThemeFont(site?.theme), [site?.theme]);
  const cssFont = useMemo(() => (font ? toCssFontFamily(font) : undefined), [font]);

  const themeStyles = useMemo(() => {
    const styles: Record<string, string | undefined> = {};

    if (cssFont) {
      styles['--wb-font'] = cssFont;
      styles['--wb-heading-font'] = cssFont;
      styles['--wb-body-font'] = cssFont;
      styles['fontFamily'] = cssFont;
    }

    const theme = site?.theme;
    if (theme) {
      if (theme.pageBackgroundColor) styles['--wb-page-bg'] = theme.pageBackgroundColor;
      if (theme.sectionBackgroundColorLight) styles['--wb-section-bg-light'] = theme.sectionBackgroundColorLight;
      if (theme.sectionBackgroundColorDark) styles['--wb-section-bg-dark'] = theme.sectionBackgroundColorDark;
      if (theme.cardBackgroundColorLight) styles['--wb-card-bg-light'] = theme.cardBackgroundColorLight;
      if (theme.cardBackgroundColorDark) styles['--wb-card-bg-dark'] = theme.cardBackgroundColorDark;

      if (theme.lightPrimaryColor) styles['--wb-text-main'] = theme.lightPrimaryColor;
      if (theme.lightSecondaryColor) styles['--wb-text-secondary'] = theme.lightSecondaryColor;
      if (theme.darkPrimaryColor) styles['--wb-text-on-dark'] = theme.darkPrimaryColor;
      if (theme.darkSecondaryColor) styles['--wb-text-on-dark-secondary'] = theme.darkSecondaryColor;

      const primaryColor = theme.primaryButtonColorLight || theme.primaryButtonColorDark;
      if (primaryColor) {
        styles['--wb-primary'] = primaryColor;
        styles['--wb-primary-hover'] = theme.hoverActiveColorLight || primaryColor;
        styles['--color-primary-600'] = primaryColor;
        styles['--color-primary-500'] = primaryColor;
        styles['--color-primary-400'] = primaryColor;
        styles['--color-primary-700'] = theme.hoverActiveColorLight || primaryColor;
      }
    }

    return styles as React.CSSProperties;
  }, [site?.theme, cssFont]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (cssFont) {
      root.style.setProperty('--wb-font', cssFont);
      root.style.setProperty('--wb-heading-font', cssFont);
      root.style.setProperty('--wb-body-font', cssFont);
      root.style.fontFamily = cssFont;
    }

    if (!font || !isLoadableGoogleFont(font)) return;

    const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    const id = `wb-font-${font}`;
    if (document.getElementById(id)) return;

    document.querySelectorAll('link[id^="wb-font-"], link[id^="wb-fonts-"]').forEach((el) => {
      el.parentNode?.removeChild(el);
    });

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [font, cssFont]);

  return (
    <div style={themeStyles}>
      {children}
    </div>
  );
};
