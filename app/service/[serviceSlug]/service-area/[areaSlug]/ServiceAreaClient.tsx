'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Footer } from '@/app/components/layout/Footer';
import { HeroSection } from '@/app/components/sections/serving-area-detail-sections/Hero';
import { About } from '@/app/components/sections/serving-area-detail-sections/About';
import { ServiceOverview } from '@/app/components/sections/serving-area-detail-sections/ServiceOverview';
import { ServiceDetails } from '@/app/components/sections/serving-area-detail-sections/ServiceDetails';
import { WhyChooseUs } from '@/app/components/sections/serving-area-detail-sections/WhyChooseUs';
import { Highlights } from '@/app/components/sections/serving-area-detail-sections/Highlights';
import { OurServices } from '@/app/components/sections/serving-area-detail-sections/OurServices';
import { ServingAreas } from '@/app/components/sections/serving-area-detail-sections/ServingAreas';
import { FAQs } from '@/app/components/sections/serving-area-detail-sections/FAQs';
import { CTA } from '@/app/components/sections/serving-area-detail-sections/CTA';
import api from '@/app/lib/fetch-api';

interface ServiceAreaClientProps {
  serviceSlug: string;
  areaSlug: string;
}

export default function ServiceAreaClient({ serviceSlug: serviceSlugProp, areaSlug: areaSlugProp }: ServiceAreaClientProps) {
  const params = useParams();
  const serviceSlug = params.serviceSlug as string || serviceSlugProp;
  const areaSlug = params.areaSlug as string || areaSlugProp;
  
  const { site } = useWebBuilder();
  const [serviceAreaPage, setServiceAreaPage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceAreaPage = async () => {
      if (!site) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/public/sites/${site.slug}/service-areas/by-service/${serviceSlug}/${areaSlug}`);
        
        if (response.success) {
          setServiceAreaPage(response.data);
        } else {
          setError('Service area page not found');
        }
      } catch {
        setError('Failed to load service area page');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceAreaPage();
  }, [site, serviceSlug, areaSlug]);

  if (loading) {
    return null;
  }

  if (error || !serviceAreaPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Area Not Found</h2>
          <p className="text-gray-600 mb-4">The service area page could not be found.</p>
          <a href="/" className="inline-block text-blue-600 hover:underline">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const serviceOverviewData = serviceAreaPage.serviceOverview;
  const serviceDetailsData = serviceAreaPage.serviceDetails;
  const whyChooseUsData = serviceAreaPage.whyChooseUs;
  const servingAreasData = serviceAreaPage.servingAreas;

  return (
    <div className="min-h-screen">
      <main>
        <HeroSection hero={serviceAreaPage.hero} />
        <Highlights highlights={serviceAreaPage.highlights} />
        <About about={serviceAreaPage.about} />
        <OurServices services={serviceAreaPage.ourServices} />
        <CTA cta={serviceAreaPage.cta} />
        <ServiceOverview overview={serviceOverviewData} />

        {(serviceDetailsData || whyChooseUsData) && (
          <div
            className={
              serviceDetailsData && whyChooseUsData
                ? 'grid grid-cols-1 lg:grid-cols-2 items-stretch'
                : 'grid grid-cols-1'
            }
          >
            {serviceDetailsData && (
              <div className="min-w-0 h-full">
                <ServiceDetails details={serviceDetailsData} className="h-full" />
              </div>
            )}
            {whyChooseUsData && (
              <div className="min-w-0 h-full">
                <WhyChooseUs whyChooseUs={whyChooseUsData} className="h-full" />
              </div>
            )}
          </div>
        )}

        <FAQs faqs={serviceAreaPage.faqs} />
        {servingAreasData ? <ServingAreas service={servingAreasData} /> : null}
      </main>

      <Footer />
    </div>
  );
}
