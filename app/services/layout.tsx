import type { Metadata } from 'next'
import { canonicalMetadata } from '@/app/lib/metadata'

export const metadata: Metadata = canonicalMetadata('/services')

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
