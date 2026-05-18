import { Page, Project, Site } from './types';
import { unwrapApiPayload } from './api-response';

const LOG_PREFIX = '[Projects]';

export function isSectionEnabled(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  return Boolean(value);
}

export function projectLog(...args: unknown[]) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEBUG_PROJECTS !== 'true') {
    return;
  }
  console.log(LOG_PREFIX, ...args);
}

export function projectWarn(...args: unknown[]) {
  console.warn(LOG_PREFIX, ...args);
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

  projectWarn('unwrapApiList: unrecognized response shape', {
    keys: Object.keys(record),
    dataType: record.data == null ? 'null' : Array.isArray(record.data) ? 'array' : typeof record.data,
  });
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
    projectWarn('normalizeProject: skipped invalid project', { _id, title, slug, siteSlug, keys: Object.keys(record) });
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

  projectLog('normalizeProjects', {
    siteSlug,
    rawCount: list.length,
    payloadType: Array.isArray(payload) ? 'array' : typeof payload,
  });

  if (list.length === 0) {
    projectWarn('normalizeProjects: empty list', {
      siteSlug,
      topLevelKeys: raw && typeof raw === 'object' ? Object.keys(raw as object) : typeof raw,
    });
  }

  const normalized = list
    .map((item) => normalizeProject(item, siteSlug))
    .filter((p): p is Project => p !== null);

  projectLog('normalizeProjects: result', {
    siteSlug,
    count: normalized.length,
    slugs: normalized.map((p) => p.slug),
    ids: normalized.map((p) => p._id),
  });

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
  if (siteId !== projectSiteId) {
    projectWarn('projectBelongsToSite: siteId mismatch (keeping project from site API)', {
      siteSlug: site.slug,
      siteId,
      projectSiteId,
      projectSlug: project.slug,
    });
  }
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

  if (embedded.length > 0) {
    projectLog('normalizeEmbeddedSectionProjects', {
      count: embedded.length,
      slugs: embedded.map((p) => p.slug),
    });
  }

  return embedded;
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

  projectLog('resolveProjectsForSection', {
    siteSlug: site?.slug,
    totalFromProvider: projects.length,
    embeddedCount: embedded.length,
    published: published.length,
    selectedIds,
    resolved: resolved.length,
    resolvedSlugs: resolved.map((p) => p.slug),
  });

  if (selectedIds.length > 0 && resolved.length === 0 && published.length > 0) {
    projectWarn('resolveProjectsForSection: projectIds did not match — showing all published', {
      selectedIds,
      availableIds: published.map((p) => p._id),
    });
    resolved = published;
  }

  if (resolved.length === 0 && published.length > 0 && !projectsSection?.projectIds?.length) {
    projectWarn('resolveProjectsForSection: falling back to all published projects');
    resolved = published;
  }

  return resolved;
}
