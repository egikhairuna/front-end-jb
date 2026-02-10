import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jamesboogie.com'
  
  // Static routes
  const routes = [
    '',
    '/faq',
    '/how-to-order',
    '/our-people',
    '/our-story',
    '/shop',
    '/ventile',
    '/contact-us',
    '/our-services',
    '/privacy-policy',
    '/returns-refunds',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
 
  return routes
}
