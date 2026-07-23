import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Absolute API base URL ending with /api — required for SSR/build fetch */
export function getApiBaseUrl(): string {
  const fromPublic = process.env.NEXT_PUBLIC_API_URL?.trim()
  const fromBackend = process.env.BACKEND_API_URL?.trim()

  let raw =
    fromPublic ||
    (fromBackend
      ? fromBackend.replace(/\/$/, '').replace(/\/api$/, '') + '/api'
      : '') ||
    (process.env.NODE_ENV === 'production'
      ? 'https://sitifystudio.com/api'
      : 'http://localhost:5000/api')

  raw = raw.replace(/\/$/, '')

  // Relative paths break Node fetch during next build / SSR
  if (raw.startsWith('/')) {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sitifystudio.com')
    raw = `${origin}${raw.startsWith('/') ? raw : `/${raw}`}`
  }

  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(raw)
  return !isLocal && raw.startsWith('http://')
    ? raw.replace(/^http:\/\//i, 'https://')
    : raw
}

export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, '')
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

  if (typeof path === 'object') {
    path = path.url ?? path.src ?? path.path ?? ''
  }

  const pathStr = String(path).trim()
  if (!pathStr || pathStr === '[object Object]') return ''

  if (/^https?:\/\//i.test(pathStr)) {
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(pathStr)
    return isLocal ? pathStr : pathStr.replace(/^http:\/\//i, 'https://')
  }

  if (pathStr.startsWith('data:')) return pathStr

  const origin = getApiOrigin()

  if (/^\/?api\//i.test(pathStr)) {
    const normalized = pathStr.startsWith('/') ? pathStr : `/${pathStr}`
    return `${origin}${normalized}`
  }

  let cleanPath = pathStr.replace(/^\//, '')
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.slice('uploads/'.length)
  }
  if (!cleanPath) return ''

  return `${origin}/api/uploads/${cleanPath}`
}
