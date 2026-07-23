'use client';

import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';
import { ServiceHighlightsSection } from '@/app/components/sections/ServiceHighlightsSection';
import { CTASection } from '@/app/components/sections/CTASection';
import { TestimonialsSection } from '@/app/components/sections/TestimonialsSection';
import { FAQSection } from '@/app/components/sections/FAQSection';
import { ServingAreasSection } from '@/app/components/sections/ServingAreasSection';

export default function ServicesPage() {
  const { site, pages, loading, error } = useWebBuilder();

  // Get theme colors from site
  const themeColors = {
    primary: site?.theme?.darkPrimaryColor || '#000000',
    secondary: site?.theme?.darkSecondaryColor || '#EF4444',
    accent: site?.theme?.lightPrimaryColor || '#3B82F6',
    mainText: site?.theme?.darkPrimaryColor || '#1F2937',
    secondaryText: site?.theme?.darkSecondaryColor || '#6B7280',
    pageBackground: site?.theme?.pageBackgroundColor || '#FFFFFF',
    sectionBackground: site?.theme?.sectionBackgroundColorLight || '#F9FAFB',
    cardBackground: site?.theme?.cardBackgroundColorLight || '#FFFFFF',
    primaryButton: site?.theme?.primaryButtonColorLight || '#3B82F6',
    hoverActive: site?.theme?.hoverActiveColorLight || '#2563EB',
    inactive: site?.theme?.inactiveColorLight || '#9CA3AF',
  };

  // Get theme fonts from site
  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

  if (loading && !site) {
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
            borderWidth: '1px'
          }}
        >
          <h2 
            className="text-xl font-bold mb-2"
            style={{ 
              color: themeColors.secondary,
              fontFamily: themeFonts.heading
            }}
          >
            Error
          </h2>
          <p 
            style={{ 
              color: themeColors.secondary,
              fontFamily: themeFonts.body
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Find services page
  const servicesPage = pages.find((p: Page) => p.pageType === 'service-list');
  const displayPage = servicesPage;

  if (!displayPage) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ 
            color: themeColors.mainText,
            fontFamily: themeFonts.heading
          }}
        >
          No Services Page Found
        </h2>
        <p 
          style={{ 
            color: themeColors.secondaryText,
            fontFamily: themeFonts.body
          }}
        >
          Please create a page with type &quot;services&quot; in the site builder.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen selection:bg-blue-100 selection:text-blue-900"
      style={{ 
        backgroundColor: themeColors.pageBackground,
        fontFamily: themeFonts.body
      }}
    >
      <Header />

      <main>
        <HeroSection hero={displayPage.hero} />

        <ServiceHighlightsSection serviceHighlightsSection={displayPage.serviceHighlightsSection} />

        <ServicesSection servicesSection={displayPage.servicesSection} />

        <CTASection ctaSection={displayPage.ctaSection} />

        <TestimonialsSection testimonialsSection={displayPage.testimonialsSection} />

        <ServingAreasSection />

        <FAQSection faqSection={displayPage.faqSection} />
      </main>

      <Footer />
    </div>
  );
}
