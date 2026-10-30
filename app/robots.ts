import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-seo'

/**
 * The authenticity verification pages are unlisted: they are only meant to be
 * reached by scanning the QR code on a physical product card, so they are kept
 * out of search results along with the protected lab-document route.
 */
export default function robots(): MetadataRoute.Robots {
  // /coa pages and PDFs send noindex metadata/headers. Allow crawling so
  // search engines can see that instruction; do not list them in a sitemap.
  return {
    sitemap: `${SITE_URL}/sitemap.xml`,
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/verify', '/verify/', '/api/'],
    },
  }
}
