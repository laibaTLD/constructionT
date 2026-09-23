import type { Metadata } from 'next'
import { Page, Site, Service, BlogPost, ServiceAreaPage } from './types'
import { getFaviconMimeType, getSiteFaviconUrl } from './favicon-url'
import { extractGoogleVerificationToken } from './integrations'
import { buildCanonicalUrl, getSiteOrigin, tiptapToText } from './seo'
import { getImageSrc } from './utils'

export { getSiteFaviconUrl } from './favicon-url'

interface SEOData {
  title?: string
  description?: string
  keywords?: string[]
  ogImageUrl?: string
  noIndex?: boolean
  /** Pathname such as `/` or `/privacy-policy`. */
  canonicalPath?: string
}

const indexableRobots: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
}

const hiddenRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
}

export function getMetadataBase(): URL | undefined {
  const fromSite = getSiteOrigin()
  const fromBase = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, '')
  const raw = fromSite || fromBase || ''
  if (!raw) return undefined
  try {
    return new URL(raw)
  } catch {
    return undefined
  }
}

export function canonicalMetadata(pathname: string): Metadata {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const absolute = buildCanonicalUrl(path)
  const canonical = absolute.startsWith('http') ? absolute : path
  return { alternates: { canonical } }
}

export function getSiteFaviconIcons(site?: Site | null): Metadata['icons'] | undefined {
  const url = getSiteFaviconUrl(site)
  if (!url) return undefined

  const type = getFaviconMimeType(url)
  return {
    icon: [{ url, type }],
    shortcut: url,
    apple: url,
  }
}

export function generateMetadata(seoData: SEOData, site?: Site): Metadata {
  const { title, description, keywords, ogImageUrl, noIndex } = seoData
  
  // Use site name as fallback and for title suffix
  const siteName = site?.business?.name || site?.name || 'Web Builder Site'
  const finalTitle = title ? `${title} | ${siteName}` : siteName
  
  const metadata: Metadata = {
    title: finalTitle,
    description: description || site?.business?.description || 'Generated site using Web Builder',
    keywords: keywords?.join(', ') || site?.seo?.keywords?.join(', '),
    robots: noIndex ? hiddenRobots : indexableRobots,
  }

  const metadataBase = getMetadataBase()
  if (metadataBase) {
    metadata.metadataBase = metadataBase
  }

  if (seoData.canonicalPath) {
    const path = seoData.canonicalPath.startsWith('/') ? seoData.canonicalPath : `/${seoData.canonicalPath}`
    const absolute = buildCanonicalUrl(path)
    const canonical = absolute.startsWith('http') ? absolute : path
    metadata.alternates = { canonical }
  }

  const faviconIcons = getSiteFaviconIcons(site)
  if (faviconIcons) {
    metadata.icons = faviconIcons
  }

  const canonical = metadata.alternates && 'canonical' in metadata.alternates
    ? metadata.alternates.canonical
    : undefined

  // Add Open Graph metadata
  if (ogImageUrl || site?.seo?.ogImageUrl || canonical) {
    metadata.openGraph = {
      title: finalTitle,
      description: description || site?.business?.description || 'Generated site using Web Builder',
      ...(typeof canonical === 'string' ? { url: canonical } : {}),
      ...(ogImageUrl || site?.seo?.ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl || site?.seo?.ogImageUrl || '',
                width: 1200,
                height: 630,
                alt: finalTitle,
              },
            ],
          }
        : {}),
    }
  }

  const googleToken = extractGoogleVerificationToken(site?.integrations?.searchConsoleVerification)
  if (googleToken) {
    metadata.verification = { google: googleToken }
  }

  return metadata
}

export function getPageSeoData(page: Page | ServiceAreaPage): SEOData {
  return {
    title: page.seo?.title,
    description: page.seo?.description,
    keywords: page.seo?.keywords,
    ogImageUrl: page.seo?.ogImageUrl,
    noIndex: page.seo?.noIndex,
  }
}

export function getServiceSeoData(service: Service): SEOData {
  return {
    title: nonEmptyString(service.seo?.title) || nonEmptyString(service.name),
    description: nonEmptyString(service.seo?.description),
    keywords: nonEmptyKeywords(service.seo?.keywords),
    ogImageUrl: nonEmptyString(service.seo?.ogImageUrl),
    noIndex: service.seo?.noIndex === true,
  }
}

/** SEO object stored on a service or service-area page in Sitify Studio. */
export type SitifySeo = {
  title?: string
  description?: string
  keywords?: string[]
  ogImageUrl?: string
  noIndex?: boolean
}

function nonEmptyString(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function nonEmptyKeywords(keywords?: string[] | null): string[] | undefined {
  if (!Array.isArray(keywords)) return undefined
  const cleaned = keywords
    .map((keyword) => (typeof keyword === 'string' ? keyword.trim() : ''))
    .filter((keyword) => keyword.length > 0)
  return cleaned.length > 0 ? cleaned : undefined
}

function resolveSeoImage(entityUrl?: string | null, siteUrl?: string | null): string | undefined {
  const raw = nonEmptyString(entityUrl) || nonEmptyString(siteUrl)
  if (!raw) return undefined
  return nonEmptyString(getImageSrc(raw))
}

function originFromAbsoluteUrl(value?: string | null): string | undefined {
  const raw = nonEmptyString(value)
  if (!raw) return undefined
  try {
    return new URL(raw).origin
  } catch {
    return undefined
  }
}

/** Public origin for canonical URLs: env site URL, then the origin already stored on the site. */
function resolvePublicOrigin(site?: Site): string | undefined {
  const fromEnv = getSiteOrigin()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const sitemapLoc = site?.files?.sitemap?.match(/<loc>\s*(https?:\/\/[^<\s]+)/i)?.[1]
  const fromSitemap = originFromAbsoluteUrl(sitemapLoc)
  if (fromSitemap) return fromSitemap

  const robotsSitemap = site?.files?.robotsTxt?.match(/Sitemap:\s*(https?:\/\/\S+)/i)?.[1]
  const fromRobots = originFromAbsoluteUrl(robotsSitemap)
  if (fromRobots) return fromRobots

  const schemaUrl = site?.files?.schemaJson?.match(/"url"\s*:\s*"(https?:\/\/[^"]+)"/i)?.[1]
  return originFromAbsoluteUrl(schemaUrl)
}

function absoluteCanonical(pathname: string, site?: Site): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const origin = resolvePublicOrigin(site)
  return origin ? `${origin}${path}` : buildCanonicalUrl(path)
}

/** On-page heading used when a service area page has no metadata title of its own. */
export function serviceAreaVisibleTitle(page: {
  hero?: { title?: unknown }
}): string | undefined {
  return nonEmptyString(tiptapToText(page.hero?.title))
}

/**
 * Metadata for one service or one service-area page.
 * Uses the shared generator for title suffix, canonical, favicon, and verification,
 * then applies Sitify SEO field rules for these two page types only.
 */
export function generateSitifyPageMetadata(
  seo: SitifySeo | null | undefined,
  site?: Site,
  options?: { fallbackTitle?: string; canonicalPath?: string }
): Metadata {
  const title = nonEmptyString(seo?.title) || nonEmptyString(options?.fallbackTitle)
  const description = nonEmptyString(seo?.description) || nonEmptyString(site?.seo?.description)
  const keywords = nonEmptyKeywords(seo?.keywords)
  const image = resolveSeoImage(seo?.ogImageUrl, site?.seo?.ogImageUrl)
  const indexable = seo?.noIndex !== true

  const metadata = generateMetadata(
    {
      title,
      description,
      keywords,
      ogImageUrl: image,
      noIndex: !indexable,
      canonicalPath: options?.canonicalPath,
    },
    site
  )

  // null clears keywords inherited from the root layout. An empty array would still emit a tag.
  metadata.keywords = keywords ?? null

  metadata.robots = {
    index: indexable,
    follow: true,
    googleBot: { index: indexable, follow: true },
  }

  if (options?.canonicalPath) {
    const canonical = absoluteCanonical(options.canonicalPath, site)
    metadata.alternates = { canonical }
    if (metadata.openGraph) {
      metadata.openGraph.url = canonical
    }
  }

  const resolvedTitle = typeof metadata.title === 'string' ? metadata.title : undefined
  const resolvedDescription = typeof metadata.description === 'string' ? metadata.description : undefined

  if (metadata.openGraph) {
    metadata.openGraph = {
      ...metadata.openGraph,
      ...(resolvedTitle ? { title: resolvedTitle } : {}),
      ...(resolvedDescription ? { description: resolvedDescription } : {}),
    }
    if (image) {
      metadata.openGraph.images = [{ url: image, width: 1200, height: 630, alt: resolvedTitle }]
    } else {
      delete metadata.openGraph.images
    }
  } else if (image || resolvedTitle || resolvedDescription) {
    metadata.openGraph = {
      ...(resolvedTitle ? { title: resolvedTitle } : {}),
      ...(resolvedDescription ? { description: resolvedDescription } : {}),
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: resolvedTitle }] } : {}),
    }
  }

  metadata.twitter = {
    card: 'summary_large_image',
    ...(resolvedTitle ? { title: resolvedTitle } : {}),
    ...(resolvedDescription ? { description: resolvedDescription } : {}),
    ...(image ? { images: [image] } : {}),
  }

  return metadata
}

export function getBlogPostSeoData(blogPost: BlogPost): SEOData {
  return {
    title: blogPost.seo?.title || blogPost.title,
    description: blogPost.seo?.description || blogPost.excerpt,
    keywords: blogPost.seo?.keywords,
    ogImageUrl: blogPost.seo?.ogImageUrl || blogPost.featuredImage?.url,
    noIndex: false, // Blog posts don't have noIndex in their schema
  }
}

export function getSiteSeoData(site: Site): SEOData {
  return {
    title: site.seo?.title,
    description: site.seo?.description,
    keywords: site.seo?.keywords,
    ogImageUrl: site.seo?.ogImageUrl,
    noIndex: false, // Sites don't have noIndex in their schema
  }
}
