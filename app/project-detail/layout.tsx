import type { Metadata } from 'next'
import { canonicalMetadata } from '@/app/lib/metadata'

export const metadata: Metadata = canonicalMetadata('/project-detail')

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
