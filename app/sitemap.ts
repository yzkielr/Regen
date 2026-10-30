import type { MetadataRoute } from 'next'
import { products } from '@/lib/products'
import { REGIONS, regionPath } from '@/lib/regions'
import { regionAlternates } from '@/lib/region-metadata'
import { SITE_URL } from '@/lib/site-seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (path: string) => new URL(path, SITE_URL).href
  const languages = (path = '') => Object.fromEntries(
    Object.entries(regionAlternates(REGIONS[0], path)!.languages!).map(([language, url]) => [language, absolute(String(url))]),
  )

  // Only public catalog pages belong here. COAs, QR verification, admin pages
  // and the draft privacy policy must stay out of search discovery.
  return [
    { url: absolute('/'), alternates: { languages: languages() } },
    ...REGIONS.flatMap((region) => [
      { url: absolute(regionPath(region.id)), alternates: { languages: languages() } },
      ...products.map((product) => {
        const path = `/product/${product.slug}`
        return { url: absolute(regionPath(region.id, path)), alternates: { languages: languages(path) } }
      }),
    ]),
  ]
}
