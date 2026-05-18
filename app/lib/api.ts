import { Site, Page, Service, BlogPost, Project } from './types';
import api from './fetch-api';
import { unwrapApiPayload } from './api-response';
import { normalizePage } from './page-routes';
import { normalizeProject, normalizeProjects, projectLog, projectWarn, unwrapApiItem } from './projects';
import { getImageSrc } from './utils';

// Site API
export const siteApi = {
  getSiteBySlug: async (slug: string): Promise<Site> => {
    const response = await api.get(`/public/sites/${slug}`);
    return unwrapApiPayload<Site>(response);
  },
  
  getSites: async (): Promise<Site[]> => {
    const response = await api.get('/sites');
    return unwrapApiPayload<Site[]>(response);
  },
};

// Page API
export const pageApi = {
  getPagesBySite: async (siteSlug: string): Promise<Page[]> => {
    const response = await api.get(`/public/sites/${siteSlug}/pages`);
    const raw = unwrapApiPayload<Page[]>(response);
    const pages = Array.isArray(raw) ? raw : [];
    return pages.map((page) => normalizePage(page as Page));
  },
  
  getPageBySlug: async (siteSlug: string, pageSlug: string): Promise<Page> => {
    const response = await api.get(`/public/sites/${siteSlug}/pages/${pageSlug}`);
    const page = unwrapApiPayload<Page>(response);
    return normalizePage(page);
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
    return unwrapApiPayload<Service[]>(response);
  },
  
  getServiceBySlug: async (siteSlug: string, serviceSlug: string): Promise<Service> => {
    const response = await api.get(`/public/sites/${siteSlug}/services/${serviceSlug}`);
    return unwrapApiPayload<Service>(response);
  },
  
  getServices: async (serviceIds: string[]): Promise<Service[]> => {
    const response = await api.post('/public/services/batch', { serviceIds });
    return unwrapApiPayload<Service[]>(response);
  },
};

// Blog API
export const blogApi = {
  getPostsBySite: async (siteSlug: string, limit?: number): Promise<BlogPost[]> => {
    const url = limit ? `/public/sites/${siteSlug}/blog?limit=${limit}` : `/public/sites/${siteSlug}/blog`;
    const response = await api.get(url);
    return unwrapApiPayload<BlogPost[]>(response);
  },
  
  getPostBySlug: async (siteSlug: string, postSlug: string): Promise<BlogPost> => {
    const response = await api.get(`/public/sites/${siteSlug}/blog/${postSlug}`);
    return unwrapApiPayload<BlogPost>(response);
  },
};

// Projects API
export const projectApi = {
  getProjectsBySite: async (siteSlug: string, limit?: number): Promise<Project[]> => {
    const url = limit ? `/public/sites/${siteSlug}/projects?limit=${limit}` : `/public/sites/${siteSlug}/projects`;
    projectLog('getProjectsBySite: request', { siteSlug, url, limit });
    const response = await api.get(url);
    projectLog('getProjectsBySite: raw response keys', {
      siteSlug,
      keys: response && typeof response === 'object' ? Object.keys(response as object) : typeof response,
    });
    const projects = normalizeProjects(response, siteSlug);
    projectLog('getProjectsBySite: response', { siteSlug, count: projects.length });
    return projects;
  },

  getProjectBySlug: async (siteSlug: string, projectSlug: string): Promise<Project> => {
    const path = `/public/sites/${siteSlug}/projects/${projectSlug}`;
    projectLog('getProjectBySlug: request', { siteSlug, projectSlug, path });
    const response = await api.get(path);
    const raw = unwrapApiItem(response);
    const project = normalizeProject(raw, siteSlug);
    if (!project) {
      projectWarn('getProjectBySlug: failed to normalize project', { siteSlug, projectSlug, raw });
      throw new Error(`Project not found: ${projectSlug}`);
    }
    projectLog('getProjectBySlug: success', { siteSlug, projectSlug, id: project._id, title: project.title });
    return project;
  },
};

// Testimonials API
export const testimonialApi = {
  getTestimonialsBySite: async (siteSlug: string): Promise<{ title?: string; description?: string; testimonials: any[] }> => {
    const response = await api.get(`/testimonials?siteSlug=${siteSlug}`);
    const data = response.data?.data ?? response.data ?? { testimonials: [] };
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
  /** Public uploads URL: `{API}/api/uploads/{filename}` (see IMAGE_URL_GUIDE). */
  getMediaUrl: (path: string): string => getImageSrc(path),
};

export default api;
