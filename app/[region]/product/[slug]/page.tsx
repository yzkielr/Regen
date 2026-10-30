import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductDetail } from '@/components/product-detail'
import { Formats } from '@/components/formats'
import { LabTesting } from '@/components/lab-testing'
import { Reviews } from '@/components/reviews'
import { RecommendedProducts } from '@/components/recommended-products'
import { Faq } from '@/components/faq'
import { getProduct } from '@/lib/products'
import { getProductCopy } from '@/lib/product-copy'
import { getRegion, regionPath } from '@/lib/regions'
import { regionAlternates } from '@/lib/region-metadata'
import { SITE_NAME } from '@/lib/site-seo'

type Props = { params: Promise<{ region: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: id, slug } = await params
  const region = getRegion(id)
  const product = getProduct(slug)
  if (!region || !product) return { title: 'Product not found — Regen' }
  const title = `${product.name} | ${SITE_NAME} ${region.name}`
  const { description } = getProductCopy(product, region.language)
  return {
    title, description,
    alternates: regionAlternates(region, `/product/${slug}`),
    openGraph: { title, description, siteName: SITE_NAME, type: 'website', url: regionPath(region.id, `/product/${slug}`), locale: region.locale.replace('-', '_') },
  }
}

export default async function RegionalProductPage({ params }: Props) {
  const { region, slug } = await params
  const product = getProduct(slug)
  if (!getRegion(region) || !product) notFound()
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader forceSolid />
      <main className="flex-1">
        <ProductDetail product={product} />
        <Formats />
        <LabTesting />
        <Reviews />
        <RecommendedProducts currentSlug={product.slug} />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  )
}
