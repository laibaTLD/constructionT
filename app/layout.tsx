import type { Metadata, Viewport } from 'next'
import './globals.css'
import { WebBuilderProvider } from '@/app/providers/WebBuilderProvider'
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary'
import { ThemeFontWrapper } from './components/ui/ThemeFontWrapper'
import { GsapInit } from './components/ui/GsapInit'
import { LanguageProvider } from '@/app/i18n/LanguageProvider'

export const metadata: Metadata = {
  title: 'Web Builder Site',
  description: 'Generated site using Web Builder',
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
