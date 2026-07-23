import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function getApiOrigin(): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api')

  // Relative /api (production same-origin)
  if (apiBase.startsWith('/')) return ''

  const origin = apiBase.replace(/\/api\/?$/, '')
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(origin)
  return isLocal ? origin : origin.replace(/^http:\/\//i, 'https://')
}

/**
 * Resolves image URLs for Media Library images.
 * - External URLs (http/https) are returned as-is
 * - Backend paths (/api/uploads/...) are prefixed with API origin
 * - Relative uploads paths resolve to {origin}/api/uploads/...
 * - Media objects with { url } are supported
 */
export function getImageSrc(path: string | undefined | null | any): string {
  if (!path) return ''

  // Media object: { url, altText, ... }
  if (typeof path === 'object') {
    path = path.url ?? path.src ?? path.path ?? ''
  }

  const pathStr = String(path).trim()
  if (!pathStr || pathStr === '[object Object]') return ''

  // Already an absolute URL
  if (/^https?:\/\//i.test(pathStr)) {
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(pathStr)
    return isLocal ? pathStr : pathStr.replace(/^http:\/\//i, 'https://')
  }

  // Data URL
  if (pathStr.startsWith('data:')) return pathStr

  const origin = getApiOrigin()

  // Backend API media path: /api/uploads/... or api/uploads/...
  if (/^\/?api\//i.test(pathStr)) {
    const normalized = pathStr.startsWith('/') ? pathStr : `/${pathStr}`
    return `${origin}${normalized}`
  }

  // /uploads/... or bare filename
  let cleanPath = pathStr.replace(/^\//, '')
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.slice('uploads/'.length)
  }
  if (!cleanPath) return ''

  return `${origin}/api/uploads/${cleanPath}`
}
