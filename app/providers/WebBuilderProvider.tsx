'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Site, Page, Service, BlogPost, Project } from '@/app/lib/types';
import { siteApi, pageApi, serviceApi, blogApi, projectApi, testimonialApi, serviceAreaApi } from '@/app/lib/api';

// Site slug from environment variable
const SITE_SLUG = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG || 'brightpath-home-services-mm9bo6ed-2n7p';





interface WebBuilderContextType {
  site: Site | null;
  pages: Page[];
  services: Service[];
  blogPosts: BlogPost[];
  projects: Project[];
  testimonials: { title?: string; description?: string; testimonials: any[] } | null;
  serviceAreaPages: any[];
  currentPage: Page | null;
  setCurrentPage: (page: Page | null) => void;
  loading: boolean;
  error: string | null;
  loadPage: (siteSlug: string, pageSlug: string) => Promise<void>;
}

const WebBuilderContext = createContext<WebBuilderContextType | undefined>(undefined);

export const useWebBuilder = () => {
  const context = useContext(WebBuilderContext);
  if (context === undefined) {
    throw new Error('useWebBuilder must be used within a WebBuilderProvider');
  }
  return context;
};

interface WebBuilderProviderProps {
  children: ReactNode;
}

export const WebBuilderProvider: React.FC<WebBuilderProviderProps> = ({ children }) => {
  const [site, setSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<{ title?: string; description?: string; testimonials: any[] } | null>(null);
  const [serviceAreaPages, setServiceAreaPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSite = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use real API when backend is available
      const siteData = await siteApi.getSiteBySlug(slug);
      setSite(siteData);
      
      await Promise.all([
        loadPages(siteData.slug),
        loadServicesBySiteSlug(siteData.slug),
        loadBlogPosts(siteData.slug),
        loadProjects(siteData.slug),
        loadTestimonials(siteData.slug),
        loadServiceAreaPages(siteData.slug),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load site');
    } finally {
      setLoading(false);
    }
  };

  const loadPage = async (siteSlug: string, pageSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const pageData = await pageApi.getPageBySlug(siteSlug, pageSlug);
      setCurrentPage(pageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async (siteSlug: string) => {
    try {
      const pagesData = await pageApi.getPagesBySite(siteSlug);
      setPages(pagesData);
    } catch (err) {
      console.warn('Failed to load pages:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadServicesBySiteSlug = async (siteSlug: string) => {
    try {
      const servicesData = await serviceApi.getServicesBySite(siteSlug);
      setServices(servicesData);
    } catch (err) {
      console.warn('Failed to load services:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadBlogPosts = async (siteSlug: string, limit?: number) => {
    try {
      const postsData = await blogApi.getPostsBySite(siteSlug, limit);
      setBlogPosts(postsData);
    } catch (err) {
      console.warn('Failed to load blog posts:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadProjects = async (siteSlug: string, limit?: number) => {
    try {
      const projectsData = await projectApi.getProjectsBySite(siteSlug, limit);
      setProjects(projectsData);
    } catch (err) {
      console.warn('Failed to load projects:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const loadTestimonials = async (siteSlug: string) => {
    console.log('[WebBuilderProvider] === loadTestimonials START ===', siteSlug);
    try {
      console.log('[WebBuilderProvider] Calling testimonialApi.getTestimonialsBySite...');
      const testimonialsData = await testimonialApi.getTestimonialsBySite(siteSlug);
      console.log('[WebBuilderProvider] Testimonials loaded SUCCESS:', testimonialsData);
      console.log('[WebBuilderProvider] Testimonials count:', testimonialsData?.testimonials?.length || 0);
      setTestimonials(testimonialsData);
    } catch (err) {
      console.error('[WebBuilderProvider] Testimonials loaded FAILED:', err instanceof Error ? err.message : err);
    }
    console.log('[WebBuilderProvider] === loadTestimonials END ===');
  };

  const loadServiceAreaPages = async (siteSlug: string) => {
    try {
      const serviceAreaPagesData = await serviceAreaApi.getServiceAreaPagesBySite(siteSlug);
      setServiceAreaPages(serviceAreaPagesData);
    } catch (err) {
      console.warn('Failed to load service area pages:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Auto-load site from env variable on mount
  useEffect(() => {
    if (!SITE_SLUG) {
      setError('NEXT_PUBLIC_WEBBUILDER_SITE_SLUG environment variable is not defined. Please check your .env file.');
      return;
    }
    loadSite(SITE_SLUG);
  }, []);

  // Poll for site updates every 3 seconds to detect theme/color changes from builder
  useEffect(() => {
    if (!site?.slug) return;

    const intervalId = setInterval(async () => {
      try {
        const siteData = await siteApi.getSiteBySlug(site.slug);
        setSite(prevSite => {
          // Only update if theme has changed
          if (prevSite && JSON.stringify(prevSite.theme) !== JSON.stringify(siteData.theme)) {
            return siteData;
          }
          return prevSite;
        });
      } catch (err) {
        // Silently ignore polling errors to not disrupt user experience
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  // Poll for projects updates every 5 seconds to detect new/updated published projects
  useEffect(() => {
    if (!site?.slug) return;

    const intervalId = setInterval(async () => {
      try {
        const projectsData = await projectApi.getProjectsBySite(site.slug);
        setProjects(prevProjects => {
          if (JSON.stringify(prevProjects) !== JSON.stringify(projectsData)) {
            return projectsData;
          }
          return prevProjects;
        });
      } catch (err) {
        // Silently ignore polling errors
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  // Poll for pages updates every 5 seconds so navigation updates after creating/publishing pages
  useEffect(() => {
    if (!site?.slug) return;

    const intervalId = setInterval(async () => {
      try {
        const pagesData = await pageApi.getPagesBySite(site.slug);
        setPages(prevPages => {
          if (JSON.stringify(prevPages) !== JSON.stringify(pagesData)) {
            return pagesData;
          }
          return prevPages;
        });
      } catch (err) {
        // Silently ignore polling errors
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  // Poll for services updates every 5 seconds to detect slug and content changes
  useEffect(() => {
    if (!site?.slug) return;

    const intervalId = setInterval(async () => {
      try {
        const servicesData = await serviceApi.getServicesBySite(site.slug);
        setServices(prevServices => {
          // Only update if services data has changed
          if (JSON.stringify(prevServices) !== JSON.stringify(servicesData)) {
            return servicesData;
          }
          return prevServices;
        });
      } catch (err) {
        // Silently ignore polling errors
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [site?.slug]);

  const contextValue: WebBuilderContextType = {
    site,
    pages,
    services,
    blogPosts,
    projects,
    testimonials,
    serviceAreaPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    loadPage,
  };

  return (
    <WebBuilderContext.Provider value={contextValue}>
      {children}
    </WebBuilderContext.Provider>
  );
};
