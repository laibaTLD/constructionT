'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useThemeColors } from '@/app/hooks/useTheme';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';
import { TestimonialsSection } from '@/app/components/sections/TestimonialsSection';
import { FAQSection } from '@/app/components/sections/FAQSection';
import { CTASection } from '@/app/components/sections/CTASection';
import { WhyChooseUsSection } from '@/app/components/sections/WhyChooseUsSection';
import { CompanyDetailSection } from '@/app/components/sections/CompanyDetailSection';
import { ProjectsSection } from '@/app/components/sections/ProjectsSection';
import { CTA2Section } from '@/app/components/sections/CTA2Section';
import { CTA3Section } from '@/app/components/sections/CTA3Section';
import { ServingAreasSection } from '@/app/components/sections/ServingAreasSection';
import { GallerySection } from '@/app/components/sections/GallerySection';
import api from '@/app/lib/fetch-api';

interface PageSlugClientProps {
  pageSlug: string;
}

export default function PageSlugClient({ pageSlug: pageSlugProp }: PageSlugClientProps) {
  const params = useParams();
  const pageSlug = params.pageSlug as string || pageSlugProp;
  const { pages, currentPage, setCurrentPage, loading, error, site } = useWebBuilder();
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

  const displayPage = currentPage || serviceAreaPage;

  if (!displayPage) {
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
        <HeroSection hero={displayPage.hero} />

        <AboutSection aboutSection={displayPage.aboutSection} />

        <CTASection ctaSection={displayPage.ctaSection} />

        <WhyChooseUsSection whyChooseUsSection={displayPage.whyChooseUsSection} />

        <CompanyDetailSection companyDetailSection={displayPage.companyDetailSection} />

        <ProjectsSection projectsSection={displayPage.projectsSection} />

       

        <CTA2Section cta2Section={displayPage.cta2Section} />

        <CTA3Section cta3Section={displayPage.cta3Section} />

        <ServicesSection servicesSection={displayPage.servicesSection} />

        <TestimonialsSection testimonialsSection={displayPage.testimonialsSection} />
         <GallerySection gallerySection={displayPage.gallerySection} />
        <ServingAreasSection />

        <FAQSection faqSection={displayPage.faqSection} />
      </main>

      <Footer />
    </div>
  );
}
