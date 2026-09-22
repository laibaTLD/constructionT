import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LegalDocumentView } from '@/app/components/legal/LegalDocumentView';
import { hasLegalBody } from '@/app/lib/legal';
import { generateMetadata as buildMetadata } from '@/app/lib/metadata';
import { fetchSiteRecord } from '@/app/lib/site-favicon';
import type { Site } from '@/app/lib/types';

const FALLBACK_TITLE = 'Privacy Policy';
const FALLBACK_DESCRIPTION = 'Privacy policy for this website.';

export async function generateMetadata(): Promise<Metadata> {
  const site = (await fetchSiteRecord()) as Site | null;
  const doc = site?.legal?.privacyPolicy;

  return buildMetadata(
    {
      title: doc?.heading?.trim() || FALLBACK_TITLE,
      description: doc?.description?.trim() || FALLBACK_DESCRIPTION,
      canonicalPath: '/privacy-policy',
    },
    site ?? undefined
  );
}

export default async function PrivacyPolicyPage() {
  const site = (await fetchSiteRecord()) as Site | null;
  const doc = site?.legal?.privacyPolicy;
  if (!hasLegalBody(doc)) notFound();

  return <LegalDocumentView document={doc!} fallbackHeading={FALLBACK_TITLE} />;
}
