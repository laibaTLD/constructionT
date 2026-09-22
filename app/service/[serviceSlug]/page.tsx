import { Metadata } from 'next'
import { generateMetadata as buildMetadata, getServiceSeoData } from '@/app/lib/metadata'
import { Service, Site } from '@/app/lib/types'
import api from '@/app/lib/fetch-api'
import ServiceClient from './ServiceClient'

interface ServicePageProps {
  params: { serviceSlug: string }
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params
  
  try {
    // Fetch default site first
    const defaultSiteResponse = await api.get('/public/sites/default')
    
    if (defaultSiteResponse.success && defaultSiteResponse.data) {
      const site: Site = defaultSiteResponse.data
      
      // Fetch all services and find by slug
      const servicesResponse = await api.get(`/public/sites/${site.slug}/services`)
      
      if (servicesResponse.success && servicesResponse.data) {
        const services: Service[] = servicesResponse.data
        const service = services.find(s => s.slug === serviceSlug)
        
        if (service) {
          return buildMetadata({ ...getServiceSeoData(service), canonicalPath: `/service/${serviceSlug}` }, site)
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

export default function ServicePage({ params }: ServicePageProps) {
  return <ServiceClient serviceSlug={params.serviceSlug} />
}
