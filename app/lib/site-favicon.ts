import 'server-only'
import { NextResponse } from 'next/server'
import { cache } from 'react'
import { getApiBaseUrl, getImageSrc } from '@/app/lib/utils'

export function getSiteSlug(): string | undefined {
  const slug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG?.trim()
  return slug || undefined
}

export function getFaviconMimeType(url: string): string | undefined {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  if (ext === 'svg') return 'image/svg+xml'
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'ico') return 'image/x-icon'
  return undefined
}

export const fetchSiteRecord = cache(async (): Promise<any | null> => {
  const siteSlug = getSiteSlug()
  if (!siteSlug) return null

  const siteResponse = await fetch(`${getApiBaseUrl()}/public/sites/${siteSlug}`, {
    next: { revalidate: 60 },
  })

  if (!siteResponse.ok) return null

  const siteData = await siteResponse.json()
  return siteData.data?.data ?? siteData.data ?? null
})

export function getSiteFaviconUrl(site?: { seo?: { faviconUrl?: unknown } } | null): string {
  return getImageSrc(site?.seo?.faviconUrl)
}

export async function getSiteFaviconAsset(): Promise<{
  url: string
  body: ArrayBuffer
  contentType: string
} | null> {
  const site = await fetchSiteRecord()
  const url = getSiteFaviconUrl(site)
  if (!url) return null

  const imageRes = await fetch(url, { next: { revalidate: 60 } })
  if (!imageRes.ok) return null

  const contentType =
    imageRes.headers.get('content-type') ||
    getFaviconMimeType(url) ||
    'image/png'

  return {
    url,
    body: await imageRes.arrayBuffer(),
    contentType,
  }
}

export async function serveSiteFavicon(): Promise<NextResponse> {
  try {
    const asset = await getSiteFaviconAsset()
    if (!asset) {
      return new NextResponse(null, { status: 404 })
    }

    return new NextResponse(asset.body, {
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error serving site favicon:', error)
    return new NextResponse(null, { status: 404 })
  }
}
