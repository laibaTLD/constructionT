'use client';

import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

export function useSectionTheme() {
  const colors = useThemeColors();
  const fonts = useThemeFonts();
  return { colors, fonts };
}
