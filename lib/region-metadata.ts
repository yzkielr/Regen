import type { Metadata } from 'next'
import { DEFAULT_REGION, REGIONS, regionPath, type Region } from '@/lib/regions'
import { SITE_NAME } from '@/lib/site-seo'

const descriptions = {
  en: 'Explore research peptides, product information and regional support from Regen Longevity Lab, with prices in your local currency.',
  ms: 'Lihat katalog peptida penyelidikan Regen Longevity Lab, maklumat produk, harga dalam MYR dan bantuan untuk Malaysia.',
  id: 'Jelajahi katalog peptida riset Regen Longevity Lab, informasi produk, harga dalam Rupiah, dan bantuan untuk Indonesia.',
}

export function regionAlternates(region: Region, path = ''): Metadata['alternates'] {
  return {
    canonical: regionPath(region.id, path),
    languages: {
      'x-default': path ? regionPath(DEFAULT_REGION, path) : '/',
      ...Object.fromEntries(REGIONS.map((item) => [item.id === 'eu' ? 'en' : item.locale, regionPath(item.id, path)])),
    },
  }
}

export function regionMetadata(region: Region): Metadata {
  const title = `${SITE_NAME} | ${region.name}`
  const description = descriptions[region.language]
  return {
    title, description,
    alternates: regionAlternates(region),
    openGraph: { title, description, siteName: SITE_NAME, type: 'website', url: regionPath(region.id), locale: region.locale.replace('-', '_') },
  }
}
