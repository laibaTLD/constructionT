import { NextResponse } from 'next/server';
import { fetchSiteRecord } from '@/app/lib/site-favicon';
import type { Site } from '@/app/lib/types';

export const revalidate = 3600;

const EMPTY_SITEMAP =
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

const XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
};

export async function GET() {
  try {
    const site = (await fetchSiteRecord()) as Site | null;
    const xml = (site?.files?.sitemap || '').trim();
    return new NextResponse(xml || EMPTY_SITEMAP, { headers: XML_HEADERS });
  } catch (error) {
    console.error('Error serving sitemap.xml:', error);
    return new NextResponse(EMPTY_SITEMAP, { headers: XML_HEADERS });
  }
}
