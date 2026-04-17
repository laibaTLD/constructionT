import { Site, Page, Service, BlogPost, Project } from './types';
import api from './fetch-api';

// Site API
export const siteApi = {
  getSiteBySlug: async (slug: string): Promise<Site> => {
    const response = await api.get(`/public/sites/${slug}`);
    return response.data?.data ?? response.data;
  },
  
  getSites: async (): Promise<Site[]> => {
    const response = await api.get('/sites');
    return response.data?.data ?? response.data;
  },
};

// Page API
export const pageApi = {
  getPagesBySite: async (siteSlug: string): Promise<Page[]> => {
    const response = await api.get(`/public/sites/${siteSlug}/pages`);
    return response.data?.data ?? response.data;
  },
  
  getPageBySlug: async (siteSlug: string, pageSlug: string): Promise<Page> => {
    const response = await api.get(`/public/sites/${siteSlug}/pages/${pageSlug}`);
    return response.data?.data ?? response.data;
  },
  
  getPage: async (pageId: string): Promise<Page> => {
    const response = await api.get(`/pages/${pageId}`);
    return response.data;
  },
};

// Service API
export const serviceApi = {
  getServicesBySite: async (siteSlug: string): Promise<Service[]> => {
    const response = await api.get(`/public/sites/${siteSlug}/services`);
    return response.data?.data ?? response.data;
  },
  
  getServiceBySlug: async (siteSlug: string, serviceSlug: string): Promise<Service> => {
    const response = await api.get(`/public/sites/${siteSlug}/services/${serviceSlug}`);
    return response.data?.data ?? response.data;
  },
  
  getServices: async (serviceIds: string[]): Promise<Service[]> => {
    const response = await api.post('/public/services/batch', { serviceIds });
    return response.data?.data ?? response.data;
  },
};

// Blog API
export const blogApi = {
  getPostsBySite: async (siteSlug: string, limit?: number): Promise<BlogPost[]> => {
    const url = limit ? `/public/sites/${siteSlug}/blog?limit=${limit}` : `/public/sites/${siteSlug}/blog`;
    const response = await api.get(url);
    return response.data?.data ?? response.data;
  },
  
  getPostBySlug: async (siteSlug: string, postSlug: string): Promise<BlogPost> => {
    const response = await api.get(`/public/sites/${siteSlug}/blog/${postSlug}`);
    return response.data?.data ?? response.data;
  },
};

// Projects API
export const projectApi = {
  getProjectsBySite: async (siteSlug: string, limit?: number): Promise<Project[]> => {
    const url = limit ? `/public/sites/${siteSlug}/projects?limit=${limit}` : `/public/sites/${siteSlug}/projects`;
    const response = await api.get(url);
    return response.data?.data ?? response.data;
  },

  getProjectBySlug: async (siteSlug: string, projectSlug: string): Promise<Project> => {
    const response = await api.get(`/public/sites/${siteSlug}/projects/${projectSlug}`);
    return response.data?.data ?? response.data;
  },
};

// Testimonials API
export const testimonialApi = {
  getTestimonialsBySite: async (siteSlug: string): Promise<{ title?: string; description?: string; testimonials: any[] }> => {
    const response = await api.get(`/testimonials?siteSlug=${siteSlug}`);
    console.log('[testimonialApi] Raw response:', response);
    console.log('[testimonialApi] response.data:', response.data);
    // Handle both { data: { testimonials: [] } } and { testimonials: [] } structures
    const data = response.data?.data ?? response.data ?? { testimonials: [] };
    console.log('[testimonialApi] Extracted data:', data);
    return data;
  },
};

// Service Area Pages API
export const serviceAreaApi = {
  getServiceAreaPagesBySite: async (siteSlug: string): Promise<any[]> => {
    // Try both endpoint patterns for compatibility
    try {
      const response = await api.get(`/public/sites/${siteSlug}/service-area-pages`);
      return response.data?.data ?? response.data ?? [];
    } catch (err) {
      // Fallback to empty array if endpoint doesn't exist
      console.warn('Service area pages endpoint not available');
      return [];
    }
  },
};

// Media API for public access
export const mediaApi = {
  getMediaUrl: (path: string): string => {
    // If already a full URL, return as-is
    if (path?.startsWith('http')) {
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(path);
      return isLocal ? path : path.replace(/^http:\/\//i, 'https://');
    }
    
    // Remove leading slash and /uploads/ prefix if present
    let cleanPath = path?.replace(/^\//, '') || '';
    cleanPath = cleanPath.replace(/^uploads\//, '');
    
    if (!cleanPath) return '';
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
    const isLocalBase = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(baseUrl);
    const httpsBaseUrl = isLocalBase ? baseUrl : baseUrl.replace(/^http:\/\//i, 'https://');
    return `${httpsBaseUrl}/uploads/${cleanPath}`;
  },
};

export default api;
