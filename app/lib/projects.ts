import { Page, Project, Site } from './types';
import { unwrapApiPayload } from './api-response';

export function isSectionEnabled(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  return Boolean(value);
}

export function isProjectIntroEnabled(projectSection: Page['projectSection'] | undefined): boolean {
  return projectSection != null && isSectionEnabled(projectSection.enabled);
}

export function isProjectsPortfolioEnabled(projectsSection: Page['projectsSection'] | undefined): boolean {
  return projectsSection != null && isSectionEnabled(projectsSection.enabled);
}

/** Extract Mongo/ObjectId/string ids for matching projectIds in CMS sections. */
export function normalizeId(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.$oid === 'string') return record.$oid;
    if (record._id != null) return normalizeId(record._id);
    if (typeof record.id === 'string') return record.id;
  }
  return String(value);
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Unwrap list payloads: [], { data: [] }, { data: { projects: [] } }. */
export function unwrapApiList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== 'object') return [];

  const record = response as Record<string, unknown>;

  if (Array.isArray(record.data)) return record.data as T[];

  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    const nested = record.data as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data as T[];
    if (Array.isArray(nested.projects)) return nested.projects as T[];
    if (Array.isArray(nested.items)) return nested.items as T[];
  }

  if (Array.isArray(record.projects)) return record.projects as T[];
  if (Array.isArray(record.items)) return record.items as T[];

  return [];
}

/** Unwrap a single resource: entity, { data: entity }, or { data: [entity] }. */
export function unwrapApiItem(response: unknown): unknown {
  const payload = unwrapApiPayload(response);
  if (Array.isArray(payload)) return payload[0] ?? null;
  return payload;
}

function normalizeImageField(raw: unknown): Project['featuredImage'] | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const img = raw as Record<string, unknown>;
  const url =
    typeof img.url === 'string'
      ? img.url
      : typeof img.src === 'string'
        ? img.src
        : typeof img.path === 'string'
          ? img.path
          : null;
  if (!url) return undefined;
  return {
    url,
    altText: typeof img.altText === 'string' ? img.altText : undefined,
  };
}

/** Map API project documents to the template Project shape. */
export function normalizeProject(raw: unknown, siteSlug?: string): Project | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const _id = normalizeId(record._id ?? record.id);
  const title =
    typeof record.title === 'string'
      ? record.title
      : typeof record.name === 'string'
        ? record.name
        : null;
  const slug =
    typeof record.slug === 'string' && record.slug.trim()
      ? record.slug.trim()
      : title
        ? slugifyTitle(title)
        : null;

  if (!_id || !title || !slug) {
    return null;
  }

  let featuredImage =
    normalizeImageField(record.featuredImage) ??
    normalizeImageField(record.thumbnailImage) ??
    normalizeImageField(record.image);

  if (!featuredImage && Array.isArray(record.images) && record.images.length > 0) {
    featuredImage = normalizeImageField(record.images[0]);
  }

  const galleryImages = Array.isArray(record.galleryImages)
    ? record.galleryImages
        .map((img) => normalizeImageField(img))
        .filter((img): img is NonNullable<typeof img> => Boolean(img))
    : Array.isArray(record.images)
      ? record.images
          .slice(1)
          .map((img) => normalizeImageField(img))
          .filter((img): img is NonNullable<typeof img> => Boolean(img))
      : undefined;

  const status =
    record.status === 'draft' || record.status === 'published' || record.status === 'archived'
      ? record.status
      : 'published';

  return {
    _id,
    siteId: normalizeId(record.siteId) ?? '',
    title,
    slug,
    status,
    featuredImage,
    galleryImages,
    shortDescription: record.shortDescription,
    description: record.description,
    category: typeof record.category === 'string' ? record.category : undefined,
    clientName: typeof record.clientName === 'string' ? record.clientName : undefined,
    date: typeof record.date === 'string' ? record.date : undefined,
    location: typeof record.location === 'string' ? record.location : undefined,
    servicesUsed: Array.isArray(record.servicesUsed)
      ? record.servicesUsed.filter((s): s is string => typeof s === 'string')
      : undefined,
    seo: record.seo as Project['seo'],
    publishedAt: typeof record.publishedAt === 'string' ? record.publishedAt : undefined,
    createdBy: typeof record.createdBy === 'string' ? record.createdBy : '',
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : '',
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : '',
  };
}

export function normalizeProjects(raw: unknown, siteSlug?: string): Project[] {
  const payload = unwrapApiPayload(raw);
  const list = unwrapApiList<unknown>(payload ?? raw);

  const normalized = list
    .map((item) => normalizeProject(item, siteSlug))
    .filter((p): p is Project => p !== null);

  return normalized;
}

export function isPublishedProject(project: Project): boolean {
  return !project.status || project.status === 'published';
}

/** Projects from site-scoped public API are already filtered; only warn on mismatch. */
export function projectBelongsToSite(project: Project, site: Site | null): boolean {
  if (!site) return true;
  const siteId = normalizeId(site._id);
  const projectSiteId = normalizeId(project.siteId);
  if (!siteId || !projectSiteId) return true;
  return true;
}

export function normalizeProjectIdList(ids: unknown[] | undefined): string[] {
  if (!ids?.length) return [];
  return ids.map((id) => normalizeId(id)).filter((id): id is string => Boolean(id));
}

type ProjectsSectionConfig = Page['projectsSection'] & {
  projects?: unknown[];
};

/** CMS may send `projectIds` or legacy `projects` (ids or populated docs). */
export function getSectionProjectIds(projectsSection: ProjectsSectionConfig | undefined): string[] {
  if (!projectsSection) return [];

  const fromProjectIds = normalizeProjectIdList(projectsSection.projectIds);
  if (fromProjectIds.length > 0) return fromProjectIds;

  const legacy = projectsSection.projects;
  if (!Array.isArray(legacy) || legacy.length === 0) return [];

  return legacy
    .map((item) => {
      if (typeof item === 'string') return normalizeId(item);
      if (item && typeof item === 'object') return normalizeId((item as Record<string, unknown>)._id ?? item);
      return null;
    })
    .filter((id): id is string => Boolean(id));
}

/** Legacy `projectsSection.projects` may contain populated project documents. */
export function normalizeEmbeddedSectionProjects(
  projectsSection: ProjectsSectionConfig | undefined
): Project[] {
  const legacy = projectsSection?.projects;
  if (!Array.isArray(legacy) || legacy.length === 0) return [];

  const embedded = legacy
    .map((item) => (typeof item === 'object' && item !== null ? normalizeProject(item) : null))
    .filter((p): p is Project => p !== null);

  return embedded;
}

export function getPublishedProjectsForSite(projects: Project[], site: Site | null): Project[] {
  return projects.filter((p) => projectBelongsToSite(p, site)).filter(isPublishedProject);
}

function projectSortDate(project: Project): string {
  return project.publishedAt || project.updatedAt || project.createdAt || '';
}

/** Newest first by publishedAt, then updatedAt, then createdAt. */
export function sortProjectsByLatest(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => projectSortDate(b).localeCompare(projectSortDate(a)));
}

export function getLatestPublishedProjectsForSite(
  projects: Project[],
  site: Site | null,
  limit?: number
): Project[] {
  const sorted = sortProjectsByLatest(getPublishedProjectsForSite(projects, site));
  if (limit != null && limit > 0) return sorted.slice(0, limit);
  return sorted;
}

export function resolveProjectsForSection(
  projects: Project[],
  projectsSection: Page['projectsSection'] | undefined,
  site: Site | null
): Project[] {
  const siteScoped = projects.filter((p) => projectBelongsToSite(p, site));
  const published = siteScoped.filter(isPublishedProject);
  const embedded = normalizeEmbeddedSectionProjects(projectsSection as ProjectsSectionConfig);
  const selectedIds = getSectionProjectIds(projectsSection as ProjectsSectionConfig);

  let resolved: Project[];

  if (embedded.length > 0) {
    resolved = embedded.filter(isPublishedProject);
  } else if (selectedIds.length > 0) {
    resolved = published.filter((p) => selectedIds.includes(String(p._id)));
  } else {
    resolved = published;
  }

  return resolved;
}
