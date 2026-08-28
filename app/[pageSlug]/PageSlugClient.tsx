'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { PageSections } from '@/app/components/sections/PageSections';
import { ServingAreasdetailSection } from '@/app/components/sections/ServingAreasdetailSection';
import api from '@/app/lib/fetch-api';

interface PageSlugClientProps {
  pageSlug: string;
}

export default function PageSlugClient({ pageSlug: pageSlugProp }: PageSlugClientProps) {
  const params = useParams();
  const pageSlug = params.pageSlug as string || pageSlugProp;
  const { pages, currentPage, setCurrentPage, loading, site } = useWebBuilder();
  const themeColors = useThemeColors();
  const [serviceAreaPage, setServiceAreaPage] = useState<any | null>(null);
  const [serviceAreaLoading, setServiceAreaLoading] = useState(false);
  const [serviceAreaError, setServiceAreaError] = useState<string | null>(null);
  const hasAttemptedLoad = useRef(false);

  // Load service area page
  const loadServiceAreaPage = useCallback(async () => {
    if (!site || hasAttemptedLoad.current) return;

    hasAttemptedLoad.current = true;
    setServiceAreaLoading(true);
    setServiceAreaError(null);

    try {
      const response = await api.get(`/public/sites/${site.slug}/service-areas/${pageSlug}`);
      if (response.success) {
        setServiceAreaPage(response.data);
      } else {
        setServiceAreaPage(null);
      }
    } catch (err) {
      setServiceAreaError('Failed to load service area page');
    } finally {
      setServiceAreaLoading(false);
    }
  }, [site, pageSlug]);

  useEffect(() => {
    if (pages.length === 0) return;

    const foundPage = pages.find(page => page.slug === pageSlug);
    if (foundPage) {
      setCurrentPage(foundPage);
      setServiceAreaPage(null);
    } else {
      setCurrentPage(null);
      if (!hasAttemptedLoad.current) {
        loadServiceAreaPage();
      }
    }
  }, [pageSlug, pages, setCurrentPage, loadServiceAreaPage]);

  if (loading || serviceAreaLoading) {
    return null;
  }

  if (currentPage) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: themeColors.pageBackground }}>
        <Header />
        <main>
          <PageSections page={currentPage} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!serviceAreaPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center" style={{ backgroundColor: themeColors.pageBackground }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.lightPrimaryText }}>Page Not Found</h2>
        <p style={{ color: themeColors.lightSecondaryText }}>The page "{pageSlug}" could not be found.</p>
        <a href="/" className="mt-8 hover:underline" style={{ color: themeColors.primaryButton }}>Return Home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.pageBackground }}>
      <Header />

      <main>
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
      </main>

      <Footer />
    </div>
  );
}
