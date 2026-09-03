import { getImageSrc } from '@/app/lib/utils'

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

export function getSiteFaviconUrl(site?: { seo?: { faviconUrl?: unknown } } | null): string {
  return getImageSrc(site?.seo?.faviconUrl)
}
