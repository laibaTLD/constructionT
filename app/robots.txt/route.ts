import { NextRequest, NextResponse } from 'next/server';
import { getSiteOrigin } from '@/app/lib/seo';
import { fetchSiteRecord } from '@/app/lib/site-favicon';
import type { Site } from '@/app/lib/types';

export const revalidate = 3600;

const FILE_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
};

function resolveOrigin(request: NextRequest): string {
  const fromSite = getSiteOrigin();
  if (fromSite) return fromSite.replace(/\/$/, '');

  const fromBase = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
  if (fromBase) return fromBase;

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
  }

  return 'http://localhost:3000';
}

function fallbackRobots(origin: string): string {
  return `User-Agent: *\nAllow: /\nDisallow: /api/\nDisallow: /_next/\nDisallow: /admin/\nDisallow: /private/\nSitemap: ${origin}/sitemap.xml\n`;
}

export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);

  try {
    const site = (await fetchSiteRecord()) as Site | null;
    const body = (site?.files?.robotsTxt || '').trim();
    return new NextResponse(body || fallbackRobots(origin), { headers: FILE_HEADERS });
  } catch (error) {
    console.error('Error serving robots.txt:', error);
    return new NextResponse(fallbackRobots(origin), { headers: FILE_HEADERS });
  }
}
