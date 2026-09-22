import type { Metadata } from 'next'
import { Page, Site, Service, BlogPost, ServiceAreaPage } from './types'
import { getFaviconMimeType, getSiteFaviconUrl } from './favicon-url'
import { extractGoogleVerificationToken } from './integrations'
import { buildCanonicalUrl, getSiteOrigin } from './seo'

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
    title: service.seo?.title || service.name,
    description: service.seo?.description,
    keywords: service.seo?.keywords,
    ogImageUrl: service.seo?.ogImageUrl,
    noIndex: false, // Services don't have noIndex in their schema
  }
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
