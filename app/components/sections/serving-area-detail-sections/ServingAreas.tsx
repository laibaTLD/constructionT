'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import type { Page } from '@/app/lib/types';
import { ServingAreasSection } from '@/app/components/sections/ServingAreasSection';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { tiptapToText } from '@/app/lib/seo';

interface ServingAreasProps {
  /** CMS section config (title/description/slug only — areas come from live API) */
  service?: unknown;
  className?: string;
}

type ServingAreasSectionData = NonNullable<Page['servingAreasSection']>;

/** CMS config only — strip static area lists so pills always come from live API. */
export function stripStaticAreasFromConfig(service: unknown): unknown {
  if (!service || typeof service !== 'object') return service;
  const { areas, serviceAreas, items, locations, ...cms } = service as Record<string, unknown>;
  return cms;
}

function toPlainText(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    return t || undefined;
  }
  const text = tiptapToText(value).trim();
  return text || undefined;
}

function normalizeSectionConfig(
  service: unknown,
  serviceSlugFromUrl: string
): Page['servingAreasSection'] | null {
  const raw = stripStaticAreasFromConfig(service);
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;

  if (data?.enabled === false) return { enabled: false };

  const serviceSlug =
    (typeof data?.serviceSlug === 'string' && data.serviceSlug.trim()) ||
    serviceSlugFromUrl ||
    undefined;

  if (!data) return null;

  return {
    enabled: data.enabled !== false,
    title: data.title as ServingAreasSectionData['title'],
    description: (data.description ?? data.shortDescription) as ServingAreasSectionData['description'],
    serviceSlug,
  };
}

/** Service area coverage — live areas from builder API (same as home). */
export const ServingAreas: React.FC<ServingAreasProps> = ({ service, className }) => {
  const params = useParams();
  const serviceSlugFromUrl =
    typeof params?.serviceSlug === 'string' ? params.serviceSlug : '';

  const servingAreasSection = useMemo(
    () => normalizeSectionConfig(service, serviceSlugFromUrl),
    [service, serviceSlugFromUrl]
  );

  if (!servingAreasSection || servingAreasSection.enabled === false) return null;

  return (
    <ServingAreasSection
      enabled
      title={toPlainText(servingAreasSection.title)}
      description={toPlainText(servingAreasSection.description)}
      serviceSlug={
        (typeof servingAreasSection.serviceSlug === 'string' && servingAreasSection.serviceSlug) ||
        resolveServiceSlug({ slug: serviceSlugFromUrl }) ||
        ''
      }
      className={className}
    />
  );
};

export default ServingAreas;
