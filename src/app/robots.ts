import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/wp-admin/',
        '/wp-login.php',
        '/cart',
        '/checkout',
        '/my-account',
        '/account',
        '/login',
        '/register',
        '/api/',
        '/search',
        '/*?*',
      ],
    },
    sitemap: 'https://jamesboogie.com/sitemap.xml',
  }
}
