import type { Metadata } from 'next'
import { canonicalMetadata } from '@/app/lib/metadata'

export const metadata: Metadata = canonicalMetadata('/about-us')

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
