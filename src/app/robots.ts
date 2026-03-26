import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/wp-admin/', '/links'],
      },
    ],
    sitemap: 'https://jamesboogie.com/sitemap.xml',
  }
}

