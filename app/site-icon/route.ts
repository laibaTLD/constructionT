import { NextResponse } from 'next/server';
import { getApiBaseUrl, getImageSrc } from '@/app/lib/utils';

export const revalidate = 60;

export async function GET() {
  try {
    const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG;
    if (!siteSlug) {
      return new NextResponse(null, { status: 404 });
    }

    const siteResponse = await fetch(`${getApiBaseUrl()}/public/sites/${siteSlug}`, {
      next: { revalidate: 60 },
    });

    if (!siteResponse.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const siteData = await siteResponse.json();
    const site = siteData.data?.data ?? siteData.data;
    const faviconUrl = getImageSrc(site?.seo?.faviconUrl);

    if (!faviconUrl) {
      return new NextResponse(null, { status: 404 });
    }

    const imageRes = await fetch(faviconUrl, { next: { revalidate: 60 } });
    if (!imageRes.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = imageRes.headers.get('content-type') || 'image/x-icon';
    const buffer = await imageRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error serving site favicon:', error);
    return new NextResponse(null, { status: 404 });
  }
}
