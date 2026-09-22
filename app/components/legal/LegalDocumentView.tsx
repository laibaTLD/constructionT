'use client';

import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { isHtmlContent, parseTiptapContent } from '@/app/lib/legal';

type LegalDocument = {
  heading?: string;
  description?: string;
  content?: unknown;
};

export function LegalDocumentView({
  document,
  fallbackHeading,
}: {
  document: LegalDocument;
  fallbackHeading: string;
}) {
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();
  const heading = document.heading?.trim() || fallbackHeading;
  const description = document.description?.trim();
  const body = parseTiptapContent(document.content);

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: themeColors.pageBackground }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-xl shadow-xl overflow-hidden"
          style={{ backgroundColor: themeColors.cardBackground }}
        >
          <div
            className="px-8 py-12 border-b"
            style={{
              borderColor: themeColors.inactiveLight,
              backgroundColor: themeColors.sectionBackgroundLight,
            }}
          >
            <h1
              className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
              style={{
                color: themeColors.lightPrimaryText,
                fontFamily: themeFonts.heading || 'var(--wb-heading-font, inherit)',
              }}
            >
              {heading}
            </h1>

            {description ? (
              <p
                className="text-lg leading-relaxed max-w-3xl"
                style={{
                  color: themeColors.lightSecondaryText,
                  fontFamily: themeFonts.body || 'var(--wb-body-font, inherit)',
                }}
              >
                {description}
              </p>
            ) : null}
          </div>

          <div className="px-8 py-12">
            <div
              className="prose prose-lg max-w-none"
              style={{
                color: themeColors.lightPrimaryText,
                fontFamily: themeFonts.body || 'var(--wb-body-font, inherit)',
              }}
            >
              {isHtmlContent(body) ? (
                <div dangerouslySetInnerHTML={{ __html: body }} />
              ) : (
                <TiptapRenderer content={body} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
