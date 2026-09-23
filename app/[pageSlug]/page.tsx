import { Metadata } from 'next'
import { generateMetadata as buildMetadata, generateSitifyPageMetadata, getPageSeoData, serviceAreaVisibleTitle } from '@/app/lib/metadata'
import { Page, ServiceAreaPage, Site } from '@/app/lib/types'
import api from '@/app/lib/fetch-api'
import { fetchSiteRecord } from '@/app/lib/site-favicon'
import PageSlugClient from './PageSlugClient'

interface PageSlugPageProps {
  params: Promise<{ pageSlug: string }>
}

export async function generateMetadata({ params }: PageSlugPageProps): Promise<Metadata> {
  const { pageSlug } = await params
  
  try {
    // Try to fetch default site first
    const defaultSiteResponse = await api.get('/public/sites/default')
    
    if (defaultSiteResponse.success && defaultSiteResponse.data) {
      const site: Site = defaultSiteResponse.data
      
      // Try to fetch page data by slug. A missing page throws; service areas are checked next.
      let pageResponse: { success?: boolean; data?: Page } | null = null
      try {
        pageResponse = await api.get(`/public/sites/${site.slug}/pages/${pageSlug}`)
      } catch (error: any) {
        if (!error?.message?.includes('Page not found')) {
          throw error
        }
      }

      if (pageResponse?.success && pageResponse.data) {
        const page: Page = pageResponse.data
        return buildMetadata({ ...getPageSeoData(page), canonicalPath: `/${pageSlug}` }, site)
      }
      
      // Service area pages use the site this template already loads.
      const areaSite = ((await fetchSiteRecord()) as Site | null) ?? site
      const serviceAreaResponse = await api.get(`/public/sites/${areaSite.slug}/service-areas/${pageSlug}`)
      
      if (serviceAreaResponse.success && serviceAreaResponse.data) {
        const serviceAreaPage: ServiceAreaPage = serviceAreaResponse.data
        return generateSitifyPageMetadata(serviceAreaPage.seo, areaSite, {
          fallbackTitle: serviceAreaVisibleTitle(serviceAreaPage),
          canonicalPath: `/${pageSlug}`,
        })
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: 'Page Not Found',
    description: 'The requested page could not be found.',
  }
}

export default async function PageSlugPage({ params }: PageSlugPageProps) {
  const { pageSlug } = await params
  return <PageSlugClient key={pageSlug} pageSlug={pageSlug} />
}
