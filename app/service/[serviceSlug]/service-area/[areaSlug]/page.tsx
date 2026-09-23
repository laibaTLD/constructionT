import { Metadata } from 'next'
import { generateSitifyPageMetadata, serviceAreaVisibleTitle } from '@/app/lib/metadata'
import { Site } from '@/app/lib/types'
import api from '@/app/lib/fetch-api'
import { fetchSiteRecord } from '@/app/lib/site-favicon'
import ServiceAreaClient from './ServiceAreaClient'

interface ServiceAreaPageProps {
  params: Promise<{ serviceSlug: string; areaSlug: string }>
}

export async function generateMetadata({ params }: ServiceAreaPageProps): Promise<Metadata> {
  const { serviceSlug, areaSlug } = await params
  
  try {
    const site = (await fetchSiteRecord()) as Site | null
      ?? await (async () => {
        const defaultSiteResponse = await api.get('/public/sites/default')
        return defaultSiteResponse.success ? (defaultSiteResponse.data as Site) : null
      })()

    if (site?.slug) {
      
      // Try to fetch service area page by service and area
      const serviceAreaResponse = await api.get(`/public/sites/${site.slug}/service-areas/by-service/${serviceSlug}/${areaSlug}`)
      
      if (serviceAreaResponse.success && serviceAreaResponse.data) {
        const serviceAreaPage = serviceAreaResponse.data
        return generateSitifyPageMetadata(serviceAreaPage.seo, site, {
          fallbackTitle: serviceAreaVisibleTitle(serviceAreaPage),
          canonicalPath: `/service/${serviceSlug}/service-area/${areaSlug}`,
        })
      }
    }
  } catch (error) {
    console.log('Service area page not found in API, using fallback metadata')
  }
  
  // Fallback metadata for the area
  const areaName = areaSlug ? areaSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Service Area';
  return {
    title: `${areaName} - Construction Services`,
    description: `Professional construction and renovation services in ${areaName}. Contact us for all your building needs.`,
  }
}

export default async function ServiceAreaPage({ params }: ServiceAreaPageProps) {
  const { serviceSlug, areaSlug } = await params
  return <ServiceAreaClient serviceSlug={serviceSlug} areaSlug={areaSlug} />
}
