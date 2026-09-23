import { Metadata } from 'next'
import { generateSitifyPageMetadata } from '@/app/lib/metadata'
import { Service, Site } from '@/app/lib/types'
import api from '@/app/lib/fetch-api'
import { fetchSiteRecord } from '@/app/lib/site-favicon'
import ServiceClient from './ServiceClient'

interface ServicePageProps {
  params: { serviceSlug: string }
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params
  
  try {
    const site = (await fetchSiteRecord()) as Site | null
      ?? await (async () => {
        const defaultSiteResponse = await api.get('/public/sites/default')
        return defaultSiteResponse.success ? (defaultSiteResponse.data as Site) : null
      })()

    if (site?.slug) {
      
      // Fetch all services and find by slug
      const servicesResponse = await api.get(`/public/sites/${site.slug}/services`)
      
      if (servicesResponse.success && servicesResponse.data) {
        const services: Service[] = servicesResponse.data
        const service = services.find(s => s.slug === serviceSlug)
        
        if (service) {
          return generateSitifyPageMetadata(service.seo, site, {
            fallbackTitle: service.name,
            canonicalPath: `/service/${serviceSlug}`,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error generating service metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: 'Service Not Found',
    description: 'The requested service could not be found.',
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { serviceSlug } = await params
  return <ServiceClient serviceSlug={serviceSlug} />
}
