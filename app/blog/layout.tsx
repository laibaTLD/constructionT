import type { Metadata } from 'next'
import { canonicalMetadata } from '@/app/lib/metadata'

export const metadata: Metadata = canonicalMetadata('/blog')

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
