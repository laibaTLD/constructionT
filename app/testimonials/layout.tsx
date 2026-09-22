import type { Metadata } from 'next'
import { canonicalMetadata } from '@/app/lib/metadata'

export const metadata: Metadata = canonicalMetadata('/testimonials')

export default function TestimonialsLayout({ children }: { children: React.ReactNode }) {
  return children
}
