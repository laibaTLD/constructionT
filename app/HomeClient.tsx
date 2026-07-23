'use client';

import dynamic from 'next/dynamic';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Page } from '@/app/lib/types';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';

// Below-fold sections — code-split to shrink initial JS
const CTASection = dynamic(() => import('@/app/components/sections/CTASection').then(m => ({ default: m.CTASection })));
const WhyChooseUsSection = dynamic(() => import('@/app/components/sections/WhyChooseUsSection').then(m => ({ default: m.WhyChooseUsSection })));
const CTA3Section = dynamic(() => import('@/app/components/sections/CTA3Section').then(m => ({ default: m.CTA3Section })));
const CompanyDetailSection = dynamic(() => import('@/app/components/sections/CompanyDetailSection').then(m => ({ default: m.CompanyDetailSection })));
const ProjectsSection = dynamic(() => import('@/app/components/sections/ProjectsSection').then(m => ({ default: m.ProjectsSection })));
const GallerySection = dynamic(() => import('@/app/components/sections/GallerySection').then(m => ({ default: m.GallerySection })));
const CTA2Section = dynamic(() => import('@/app/components/sections/CTA2Section').then(m => ({ default: m.CTA2Section })));
const TestimonialsSection = dynamic(() => import('@/app/components/sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const ServingAreasSection = dynamic(() => import('@/app/components/sections/ServingAreasSection').then(m => ({ default: m.ServingAreasSection })));
const FAQSection = dynamic(() => import('@/app/components/sections/FAQSection').then(m => ({ default: m.FAQSection })));
const ContactSection = dynamic(() => import('./components/sections/ContactSection').then(m => ({ default: m.ContactSection })));

export default function HomeClient() {
  const { site, pages, loading, error } = useWebBuilder();

  const themeColors = {
    primary: 'var(--wb-primary)',
    secondary: 'var(--wb-primary)',
    accent: 'var(--wb-primary)',
    mainText: 'var(--wb-text-main)',
    secondaryText: 'var(--wb-text-secondary)',
    pageBackground: 'var(--wb-page-bg)',
    sectionBackground: 'var(--wb-section-bg-light)',
    cardBackground: 'var(--wb-card-bg-light)',
    primaryButton: 'var(--wb-primary)',
    hoverActive: 'var(--wb-primary-hover)',
    inactive: 'var(--color-gray-400)',
  };

  const themeFonts = {
    heading: site?.theme?.headingFont,
    body: site?.theme?.bodyFont,
  };

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

  const homePage = (pages || []).find((p: Page) => p.pageType === 'home');
  const displayPage = homePage;

  if (!site || !displayPage) {
    return null;
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
        <AboutSection aboutSection={displayPage.aboutSection} />
        <ServicesSection servicesSection={displayPage.servicesSection} />
        <CTASection ctaSection={displayPage.ctaSection} />
        <WhyChooseUsSection whyChooseUsSection={displayPage.whyChooseUsSection} />
        <CTA3Section cta3Section={displayPage.cta3Section} />
        <CompanyDetailSection companyDetailSection={displayPage.companyDetailSection} />
        <ProjectsSection projectsSection={displayPage.projectsSection} />
        <GallerySection gallerySection={displayPage.gallerySection} />
        <CTA2Section cta2Section={displayPage.cta2Section} />
        <TestimonialsSection testimonialsSection={displayPage.testimonialsSection} />
        <ServingAreasSection />
        <FAQSection faqSection={displayPage.faqSection} />
        <ContactSection contactSection={displayPage.contactSection} />
      </main>
      
      <Footer />
    </div>
  );
}
