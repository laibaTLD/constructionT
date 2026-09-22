import type { Metadata } from 'next'
import { canonicalMetadata } from '@/app/lib/metadata'

export const metadata: Metadata = canonicalMetadata('/contact-us')

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
