import type { Page } from '@/app/lib/types';

const defaultSlugByType: Partial<Record<Page['pageType'], string>> = {
  about: 'about-us',
  contact: 'contact-us',
  'blog-list': 'blog',
  'service-list': 'services',
  testimonials: 'testimonials',
  'project-detail': 'project-detail',
};

export function getPageHref(page: Page): string {
  if (page.pageType === 'home') return '/';
  if (page.slug) {
    const slug = String(page.slug).replace(/^\/+|\/+$/g, '');
    return slug ? `/${slug}` : '/';
  }
  const byType = defaultSlugByType[page.pageType];
  return byType ? `/${byType}` : '/';
}
