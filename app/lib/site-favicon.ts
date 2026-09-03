import 'server-only'
import { NextResponse } from 'next/server'
import { cache } from 'react'
import { getApiBaseUrl } from '@/app/lib/utils'
import { getFaviconMimeType, getSiteFaviconUrl } from '@/app/lib/favicon-url'

export { getFaviconMimeType, getSiteFaviconUrl } from '@/app/lib/favicon-url'

export function getSiteSlug(): string | undefined {
  const slug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG?.trim()
  return slug || undefined
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
