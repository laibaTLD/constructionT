import type { Metadata, Viewport } from 'next'
import './globals.css'
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper'
import { GsapInit } from './components/ui/GsapInit'
import { LanguageProvider } from '@/app/i18n/LanguageProvider'
import { SiteFavicon } from './components/ui/SiteFavicon'
import { generateMetadata as buildMetadata, getSiteSeoData } from '@/app/lib/metadata'
import { Site } from '@/app/lib/types'
import { fetchSiteRecord } from '@/app/lib/site-favicon'
import { getFaviconMimeType, getSiteFaviconUrl } from '@/app/lib/favicon-url'

const fallbackMetadata: Metadata = {
  title: 'Web Builder Site',
  description: 'Generated site using Web Builder',
  icons: { icon: [{ url: '/icon' }] },
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const site = (await fetchSiteRecord()) as Site | null
    if (!site) return fallbackMetadata

    const metadata = buildMetadata(getSiteSeoData(site), site)
    if (!metadata.icons) {
      metadata.icons = { icon: [{ url: '/icon' }] }
    }
    return metadata
  } catch (error) {
    console.error('Error generating root metadata:', error)
    return fallbackMetadata
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let faviconHref = ''
  try {
    const site = await fetchSiteRecord()
    faviconHref = getSiteFaviconUrl(site)
  } catch {
    faviconHref = ''
  }

  const faviconType = faviconHref ? getFaviconMimeType(faviconHref) : undefined

  return (
    <html lang="en">
      {faviconHref ? (
        <head>
          <link rel="icon" href={faviconHref} {...(faviconType ? { type: faviconType } : {})} />
          <link rel="shortcut icon" href={faviconHref} {...(faviconType ? { type: faviconType } : {})} />
          <link rel="apple-touch-icon" href={faviconHref} />
        </head>
      ) : null}
      <body suppressHydrationWarning className="overflow-x-clip">
        <GsapInit />
        <ErrorBoundary>
          <WebBuilderProvider>
            <SiteFavicon />
            <LanguageProvider>
              <ThemeFontWrapper>
                <main className="min-h-screen w-full min-w-0 overflow-x-clip">
                  {children}
                </main>
              </ThemeFontWrapper>
            </LanguageProvider>
          </WebBuilderProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
