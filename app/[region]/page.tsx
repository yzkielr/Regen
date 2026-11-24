import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Products } from '@/components/products'
import { Principles } from '@/components/principles'
import { Testimonial } from '@/components/testimonial'
import { LabTesting } from '@/components/lab-testing'
import { Formats } from '@/components/formats'
import { Journey } from '@/components/journey'
import { Reviews } from '@/components/reviews'
import { Consultation } from '@/components/consultation'
import { Faq } from '@/components/faq'
import { SiteFooter } from '@/components/site-footer'
import { getRegion } from '@/lib/regions'
import { regionMetadata } from '@/lib/region-metadata'
import { regionalIdentity } from '@/lib/site-seo'

type Props = { params: Promise<{ region: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const region = getRegion((await params).region)
  return region ? regionMetadata(region) : { title: 'Region not found — Regen' }
}

export default async function RegionalHomePage({ params }: Props) {
  const region = getRegion((await params).region)
  if (!region) notFound()
  return (
    <div className="flex min-h-dvh flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(regionalIdentity(region)).replace(/</g, '\\u003c') }} />
      <SiteHeader forceSolid />
      <main className="flex-1">
        <Hero />
        <Products />
        <Principles />
        <Testimonial />
        <LabTesting />
        <Formats />
        <Journey />
        <Reviews />
        <Consultation />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  )
}
