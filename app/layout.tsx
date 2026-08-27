import type { Metadata, Viewport } from 'next'
import './globals.css'
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper'
import { GsapInit } from './components/ui/GsapInit'
import { LanguageProvider } from '@/app/i18n/LanguageProvider'
import { SiteFavicon } from './components/ui/SiteFavicon'
import { generateMetadata as buildMetadata, getSiteSeoData } from '@/app/lib/metadata'
import { siteApi } from '@/app/lib/api'
import { Site } from '@/app/lib/types'

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: 'Web Builder Site',
    description: 'Generated site using Web Builder',
  }

  try {
    const siteSlug = process.env.NEXT_PUBLIC_WEBBUILDER_SITE_SLUG
    if (!siteSlug) return fallback

    const site: Site = await siteApi.getSiteBySlug(siteSlug)
    if (!site) return fallback

    return buildMetadata(getSiteSeoData(site), site)
  } catch (error) {
    console.error('Error generating root metadata:', error)
    return fallback
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
