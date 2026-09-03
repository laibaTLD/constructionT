import { serveSiteFavicon } from '@/app/lib/site-favicon'

export const runtime = 'nodejs'
export const revalidate = 60
export const dynamic = 'force-dynamic'

export async function GET() {
  return serveSiteFavicon()
}
