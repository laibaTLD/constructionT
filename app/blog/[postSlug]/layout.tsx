import type { Metadata } from 'next'
import { canonicalMetadata } from '@/app/lib/metadata'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postSlug: string }>
}): Promise<Metadata> {
  const { postSlug } = await params
  return canonicalMetadata(`/blog/${postSlug}`)
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return children
}
