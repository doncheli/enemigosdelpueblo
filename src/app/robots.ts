import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.enemigosdelpueblo.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/doncheli_admin', '/doncheli_admin/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
