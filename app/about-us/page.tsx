'use client';

import { useState, useEffect } from 'react';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { ServiceHighlightsSection } from '@/app/components/sections/ServiceHighlightsSection';
import { CTASection } from '@/app/components/sections/CTASection';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';

interface Page {
  _id: string;
  name: string;
  slug: string;
  pageType: string;
  aboutSection?: {
    enabled: boolean;
    title?: { type: string; content: any[] };
    description?: { type: string; content: any[] };
    image?: { url: string; altText?: string };
    features?: Array<{ icon: string; label: string; description: string }>;
  };
  serviceHighlightsSection?: {
    enabled: boolean;
    title?: { type: string; content: any[] };
    description?: { type: string; content: any[] };
    highlights?: Array<{ title: any; description: any }>;
    layout?: string;
  };
  ctaSection?: {
    enabled: boolean;
    title?: { type: string; content: any[] };
    description?: { type: string; content: any[] };
    primaryButton?: { label: string; href: string };
    backgroundImage?: string;
    backgroundColor?: string;
  };
}

export default function AboutPage() {
  const { site } = useWebBuilder();
  const [homePage, setHomePage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomePage = async () => {
      try {
        console.log('=== Fetching Home Page Data ===');
        console.log('Site ID:', site?._id);
        
        if (!site?._id) {
          console.log('No site ID available');
          setLoading(false);
          return;
        }

        // Get auth token from localStorage - try multiple possible keys
        const token = localStorage.getItem('accessToken') || 
                      localStorage.getItem('token') || 
                      localStorage.getItem('auth_token');
        console.log('Auth token available:', !!token);
        console.log('Token key used:', token ? (localStorage.getItem('accessToken') ? 'accessToken' : localStorage.getItem('token') ? 'token' : 'auth_token') : 'none');
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('Adding Authorization header');
        } else {
          console.log('No token found in localStorage');
        }

        console.log('Making API call to:', `/api/pages?siteId=${site._id}&pageType=home`);
        const response = await fetch(`/api/pages?siteId=${site._id}&pageType=home`, {
          headers,
        });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.success && data.data?.pages?.length > 0) {
          console.log('Found pages:', data.data.pages.length);
          console.log('Pages list:', data.data.pages.map((p: Page) => ({ id: p._id, name: p.name, pageType: p.pageType })));
          
          // Filter for actual home pages
          const homePages = data.data.pages.filter((p: Page) => p.pageType === 'home');
          console.log('Home pages after filtering:', homePages.length);
          
          if (homePages.length > 0) {
            const homePageId = homePages[0]._id;
            console.log('Fetching full home page data for ID:', homePageId);
            
            const homeResponse = await fetch(`/api/pages/${homePageId}`, {
              headers,
            });
            console.log('Home page detail response status:', homeResponse.status);
            
            if (!homeResponse.ok) {
              console.error('Home page detail response not OK:', homeResponse.status);
              setLoading(false);
              return;
            }
            
            const homeData = await homeResponse.json();
            console.log('Full home page data:', homeData);
            
            if (homeData.success && homeData.data?.page) {
              console.log('Setting home page data:', homeData.data.page);
              console.log('Home page aboutSection:', homeData.data.page.aboutSection);
              setHomePage(homeData.data.page);
            } else {
              console.log('No page data in response');
            }
          } else {
            console.log('No home pages found after filtering');
          }
        } else {
          console.log('No pages found or API returned no data');
        }
      } catch (err) {
        console.error('Error fetching home page:', err);
      } finally {
        setLoading(false);
        console.log('=== Fetch Complete ===');
      }
    };

    fetchHomePage();
  }, [site?._id]);

  // Default configurations for about page sections (fallback)
  const defaultAboutSection = {
    enabled: true,
    title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'About Us' }] }] },
    description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'We are dedicated to delivering exceptional service and creating lasting value for our clients.' }] }] },
    features: [
      { icon: 'check', label: 'Quality Service', description: 'We deliver top-notch solutions tailored to your needs.' },
      { icon: 'users', label: 'Expert Team', description: 'Our experienced professionals are here to help.' },
      { icon: 'clock', label: 'Timely Delivery', description: 'We respect your time and deliver on schedule.' },
    ],
  };

  const defaultServiceHighlightsSection = {
    enabled: true,
    title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Our Impact' }] }] },
    description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Numbers that speak for themselves' }] }] },
    layout: 'grid' as const,
    highlights: [
      { title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '500+' }] }] }, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Projects Completed' }] }] } },
      { title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '98%' }] }] }, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Client Satisfaction' }] }] } },
      { title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '10+' }] }] }, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Years Experience' }] }] } },
      { title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '50+' }] }] }, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Team Members' }] }] } },
    ],
  };

  const defaultCtaSection = {
    enabled: true,
    title: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ready to Get Started?' }] }] },
    description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Contact us today to discuss your project and see how we can help.' }] }] },
    primaryButton: {
      label: 'Contact Us',
      href: '/contact-us',
    },
  };

  // Use home page data if available, otherwise use defaults
  const aboutSection = homePage?.aboutSection?.enabled 
    ? { ...homePage.aboutSection, features: homePage.aboutSection.features || [] }
    : defaultAboutSection;
  const serviceHighlightsSection = homePage?.serviceHighlightsSection?.enabled
    ? { 
        ...homePage.serviceHighlightsSection, 
        highlights: homePage.serviceHighlightsSection.highlights || [],
        layout: (homePage.serviceHighlightsSection.layout as 'grid' | 'carousel' | 'list') || 'grid'
      }
    : defaultServiceHighlightsSection;
  const ctaSection = homePage?.ctaSection?.enabled ? homePage.ctaSection : defaultCtaSection;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* About Section */}
        <AboutSection aboutSection={aboutSection} />

        {/* Service Highlights Section */}
        <ServiceHighlightsSection serviceHighlightsSection={serviceHighlightsSection} />

        {/* CTA Section */}
        <CTASection ctaSection={ctaSection} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
