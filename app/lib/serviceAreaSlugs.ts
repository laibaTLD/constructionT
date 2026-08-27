export function normalizeSlug(value: string | null | undefined): string {
  if (!value) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function resolveServiceSlug(
  service: { slug?: string | null; name?: string | null } | null | undefined
): string {
  if (!service) return '';
  if (service.slug) return normalizeSlug(service.slug);
  if (service.name) return normalizeSlug(service.name);
  return '';
}
