import { getSiteFaviconAsset } from '@/app/lib/site-favicon'

export const runtime = 'nodejs'
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function Icon() {
  const asset = await getSiteFaviconAsset()
  if (!asset) {
    return new Response(null, { status: 404 })
  }

  return new Response(asset.body, {
    headers: {
      'Content-Type': asset.contentType,
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
    },
  })
}
