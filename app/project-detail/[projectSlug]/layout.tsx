import type { Metadata } from 'next'
import { canonicalMetadata } from '@/app/lib/metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}): Promise<Metadata> {
  const { projectSlug } = await params
  return canonicalMetadata(`/project-detail/${projectSlug}`)
}

export default function ProjectSlugLayout({ children }: { children: React.ReactNode }) {
  return children
}
