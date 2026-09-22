import type { Metadata, Viewport } from 'next'
import './globals.css'
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper'
import { PathnameKey } from './components/layout/PathnameKey'
import { Header } from './components/layout/Header'
import { LanguageProvider } from '@/app/i18n/LanguageProvider'
import { SiteFavicon } from './components/ui/SiteFavicon'
import { generateMetadata as buildMetadata, getMetadataBase, getSiteSeoData } from '@/app/lib/metadata'
import { Site } from '@/app/lib/types'
import { fetchSiteRecord } from '@/app/lib/site-favicon'
import { getGtmNoscriptInnerHtml } from '@/app/lib/integrations'
import { GtmNoscript, SiteHeadIntegrations } from '@/app/components/SiteIntegrations'
import { JsonLd } from '@/app/components/JsonLd'

const fallbackMetadata: Metadata = {
  title: 'Web Builder Site',
  description: 'Generated site using Web Builder',
  icons: { icon: [{ url: '/icon' }] },
  robots: { index: true, follow: true },
  metadataBase: getMetadataBase(),
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
  let site: Site | null = null
  try {
    site = (await fetchSiteRecord()) as Site | null
  } catch (error) {
    console.error('Error loading site integrations:', error)
  }

  const gtmNoscriptInnerHtml = getGtmNoscriptInnerHtml(site)

  return (
    <html lang="en">
      <head>
        <SiteHeadIntegrations site={site} />
        <JsonLd schemaJson={site?.files?.schemaJson} />
      </head>
      <body suppressHydrationWarning className="overflow-x-clip">
        <GtmNoscript html={gtmNoscriptInnerHtml} />
        <ErrorBoundary>
          <WebBuilderProvider>
            <SiteFavicon />
            <LanguageProvider>
              <ThemeFontWrapper>
                <Header />
                <div className="min-h-screen w-full min-w-0 overflow-x-clip">
                  <PathnameKey>{children}</PathnameKey>
                </div>
              </ThemeFontWrapper>
            </LanguageProvider>
          </WebBuilderProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
