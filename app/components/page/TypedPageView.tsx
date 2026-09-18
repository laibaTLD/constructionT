'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeFonts } from '@/app/hooks/useTheme';
import { Page } from '@/app/lib/types';
import { Footer } from '@/app/components/layout/Footer';
import { PageSections } from '@/app/components/sections/PageSections';

interface TypedPageViewProps {
  pageType: Page['pageType'];
}

export function TypedPageView({ pageType }: TypedPageViewProps) {
  const { site, pages, loading, error } = useWebBuilder();

  const themeColors = {
    secondary: 'var(--wb-primary)',
    pageBackground: 'var(--wb-page-bg)',
  };

  const themeFonts = useThemeFonts();

  if (loading) {
    return null;
  }

  if (error && !site) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <div
          className="p-6 rounded-lg max-w-lg text-center"
          style={{
            backgroundColor: '#FEE2E2',
            borderColor: themeColors.secondary,
            borderWidth: '1px',
          }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{
              color: themeColors.secondary,
              fontFamily: themeFonts.heading,
            }}
          >
            Error
          </h2>
          <p
            style={{
              color: themeColors.secondary,
              fontFamily: themeFonts.body,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  const displayPage = (pages || []).find((p: Page) => p.pageType === pageType);

  if (!site || !displayPage) {
    return null;
  }

  const page: Page =
    pageType === 'contact' && displayPage.contactSection == null && site.contactSection
      ? { ...displayPage, contactSection: site.contactSection }
      : displayPage;

  return (
    <div
      className="min-h-screen selection:bg-blue-100 selection:text-blue-900"
      style={{
        backgroundColor: themeColors.pageBackground,
        fontFamily: themeFonts.body,
      }}
    >
      <PageSections page={page} />
      <Footer />
    </div>
  );
}
