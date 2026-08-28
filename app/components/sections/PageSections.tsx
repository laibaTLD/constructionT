'use client';

import dynamic from 'next/dynamic';
import { Page } from '@/app/lib/types';
import { tiptapToText } from '@/app/lib/seo';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ServiceHighlightsSection } from '@/app/components/sections/ServiceHighlightsSection';
import { ServicesSection } from '@/app/components/sections/ServicesSection';

const CTASection = dynamic(() =>
  import('@/app/components/sections/CTASection').then((m) => ({ default: m.CTASection }))
);
const WhyChooseUsSection = dynamic(() =>
  import('@/app/components/sections/WhyChooseUsSection').then((m) => ({ default: m.WhyChooseUsSection }))
);
const CTA3Section = dynamic(() =>
  import('@/app/components/sections/CTA3Section').then((m) => ({ default: m.CTA3Section }))
);
const CompanyDetailSection = dynamic(() =>
  import('@/app/components/sections/CompanyDetailSection').then((m) => ({ default: m.CompanyDetailSection }))
);
const ProjectsSection = dynamic(() =>
  import('@/app/components/sections/ProjectsSection').then((m) => ({ default: m.ProjectsSection }))
);
const GallerySection = dynamic(() =>
  import('@/app/components/sections/GallerySection').then((m) => ({ default: m.GallerySection }))
);
const CTA2Section = dynamic(() =>
  import('@/app/components/sections/CTA2Section').then((m) => ({ default: m.CTA2Section }))
);
const TestimonialsSection = dynamic(() =>
  import('@/app/components/sections/TestimonialsSection').then((m) => ({ default: m.TestimonialsSection }))
);
const ServingAreasSection = dynamic(() =>
  import('@/app/components/sections/ServingAreasSection').then((m) => ({ default: m.ServingAreasSection }))
);
const FAQSection = dynamic(() =>
  import('@/app/components/sections/FAQSection').then((m) => ({ default: m.FAQSection }))
);
const BlogSection = dynamic(() =>
  import('@/app/components/sections/BlogSection').then((m) => ({ default: m.BlogSection }))
);
const CustomSection = dynamic(() =>
  import('@/app/components/sections/CustomSection').then((m) => ({ default: m.CustomSection }))
);
const ContactSection = dynamic(() =>
  import('@/app/components/sections/ContactSection').then((m) => ({ default: m.ContactSection }))
);

function toPlainText(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  const text = tiptapToText(value).trim();
  return text || undefined;
}

interface PageSectionsProps {
  page: Page;
}

export function PageSections({ page }: PageSectionsProps) {
  const customSections = [...(page.customSections || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <>
      <HeroSection hero={page.hero} />
      <AboutSection aboutSection={page.aboutSection} />
      <ServiceHighlightsSection serviceHighlightsSection={page.serviceHighlightsSection} />
      <ServicesSection servicesSection={page.servicesSection} />
      <CTASection ctaSection={page.ctaSection} />
      <WhyChooseUsSection whyChooseUsSection={page.whyChooseUsSection} />
      <CTA3Section cta3Section={page.cta3Section} />
      <CompanyDetailSection companyDetailSection={page.companyDetailSection} />
      <ProjectsSection projectsSection={page.projectsSection} />
      <GallerySection gallerySection={page.gallerySection} />
      <CTA2Section cta2Section={page.cta2Section} />
      <TestimonialsSection testimonialsSection={page.testimonialsSection} />
      {page.servingAreasSection?.enabled ? (
        <ServingAreasSection
          enabled
          title={toPlainText(page.servingAreasSection.title)}
          description={toPlainText(page.servingAreasSection.description)}
          serviceSlug={page.servingAreasSection.serviceSlug || ''}
        />
      ) : null}
      <FAQSection faqSection={page.faqSection} />
      <BlogSection blogSection={page.blogSection} />
      {customSections.map((section) => (
        <CustomSection key={section._id || section.key} section={section} />
      ))}
      <ContactSection contactSection={page.contactSection} />
    </>
  );
}
