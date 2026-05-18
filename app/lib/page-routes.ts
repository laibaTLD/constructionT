import { Page } from './types';

type RoutablePage = Pick<Page, 'pageType' | 'slug' | '_id'> & { pageSlug?: string };

/** App routes keyed by CMS pageType (slug from API is often missing). */
const PAGE_TYPE_PATH: Record<string, string> = {
  home: '/',
  about: '/about-us',
  contact: '/contact-us',
  'service-list': '/services',
  'blog-list': '/blog',
  'project-detail': '/project-detail',
  testimonials: '/testimonials',
  'serving-areas': '/serving-areas',
};

export function resolvePageSlug(page: RoutablePage): string | undefined {
  const slug = page.slug?.trim() || page.pageSlug?.trim();
  return slug || undefined;
}

export function normalizePage<T extends RoutablePage>(page: T): T & { slug: string } {
  const slug = resolvePageSlug(page) || (page.pageType === 'home' ? 'home' : page.pageType);
  return { ...page, slug };
}

export function getPageHref(page: RoutablePage): string {
  const fromType = PAGE_TYPE_PATH[page.pageType];
  if (fromType) return fromType;

  const slug = resolvePageSlug(page);
  if (slug) return slug === 'home' ? '/' : `/${slug}`;

  return `/${page.pageType}`;
}
