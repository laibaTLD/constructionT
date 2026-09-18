'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Footer } from '@/app/components/layout/Footer';
import { PageSections } from '@/app/components/sections/PageSections';
import { ServingAreasdetailSection } from '@/app/components/sections/ServingAreasdetailSection';
import api from '@/app/lib/fetch-api';

interface PageSlugClientProps {
  pageSlug: string;
}

export default function PageSlugClient({ pageSlug: pageSlugProp }: PageSlugClientProps) {
  const params = useParams();
  const pageSlug =
    (typeof params.pageSlug === 'string' ? params.pageSlug : pageSlugProp) || '';
  const { pages, setCurrentPage, loading, site } = useWebBuilder();
  const themeColors = useThemeColors();
  const [serviceAreaPage, setServiceAreaPage] = useState<any | null>(null);
  const [serviceAreaLoading, setServiceAreaLoading] = useState(false);
  const [serviceAreaError, setServiceAreaError] = useState<string | null>(null);
  const loadedSlug = useRef<string | null>(null);

  const foundPage = useMemo(
    () => pages.find((page) => page.slug?.toLowerCase() === pageSlug.toLowerCase()) || null,
    [pages, pageSlug]
  );

  const loadServiceAreaPage = useCallback(async (slug: string) => {
    if (!site) return;
    if (loadedSlug.current === slug) return;

    loadedSlug.current = slug;
    setServiceAreaLoading(true);
    setServiceAreaError(null);

    try {
      const response = await api.get(`/public/sites/${site.slug}/service-areas/${slug}`);
      if (response.success) {
        setServiceAreaPage(response.data);
      } else {
        setServiceAreaPage(null);
      }
    } catch {
      setServiceAreaError('Failed to load service area page');
      setServiceAreaPage(null);
    } finally {
      setServiceAreaLoading(false);
    }
  }, [site]);

  useEffect(() => {
    loadedSlug.current = null;
    setServiceAreaPage(null);
    setServiceAreaError(null);
  }, [pageSlug]);

  useEffect(() => {
    setCurrentPage(foundPage);

    if (foundPage) {
      setServiceAreaPage(null);
      return;
    }

    if (pages.length === 0) return;
    loadServiceAreaPage(pageSlug);
  }, [foundPage, pageSlug, pages.length, setCurrentPage, loadServiceAreaPage]);

  if (loading || serviceAreaLoading) {
    return null;
  }

  if (foundPage) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: themeColors.pageBackground }}>
        <PageSections page={foundPage} />
        <Footer />
      </div>
    );
  }

  if (!serviceAreaPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center" style={{ backgroundColor: themeColors.pageBackground }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.lightPrimaryText }}>Page Not Found</h2>
        <p style={{ color: themeColors.lightSecondaryText }}>The page "{pageSlug}" could not be found.{serviceAreaError ? ` ${serviceAreaError}` : ''}</p>
        <a href="/" className="mt-8 hover:underline" style={{ color: themeColors.primaryButton }}>Return Home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.pageBackground }}>
      <ServingAreasdetailSection
          data={{
            hero: serviceAreaPage.hero,
            highlights: serviceAreaPage.highlights,
            about: serviceAreaPage.about,
            ourServices: serviceAreaPage.ourServices,
            pageServiceId:
              typeof serviceAreaPage.serviceId === 'string'
                ? serviceAreaPage.serviceId
                : serviceAreaPage.serviceId?._id,
            cta: serviceAreaPage.cta,
            serviceDetails: serviceAreaPage.serviceDetails,
            serviceOverview: serviceAreaPage.serviceOverview,
            whyChooseUs: serviceAreaPage.whyChooseUs,
            faqs: serviceAreaPage.faqs,
            servingAreas: serviceAreaPage.servingAreas,
          }}
        />
      <Footer />
    </div>
  );
}
