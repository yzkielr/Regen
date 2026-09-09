'use client'

import { Product3DCarousel } from '@/components/product-3d-carousel'
import { ProductCard } from '@/components/product-card'
import { ConsultationButton } from '@/components/consultation-button'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'
import { products } from '@/lib/products'
import { useRegion } from '@/components/region-provider'
import { catalogCopy } from '@/lib/product-copy'

// Panggil <Products /> sekali di halaman.
// Komponen ini sudah mencakup carousel di atas dan katalog grid di bawah.
export function Products() {
  const { language } = useRegion()
  const copy = catalogCopy[language]

  return (
    <>
      <Product3DCarousel />

      <section id="katalog" className="bg-background py-16 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="heading-gradient text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {copy.heading}
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              {copy.intro}
            </p>
          </Reveal>

          <Stagger className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <StaggerItem key={product.slug} className="h-full">
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-10 text-center">
            <ConsultationButton
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {copy.talkToTeam}
            </ConsultationButton>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-3 rounded-xl border border-border bg-muted/50 p-4 text-center text-xs leading-relaxed text-muted-foreground">
            <p>{copy.priceNotice}</p>
            <p>{copy.photoNotice}</p>
            <p className="font-semibold text-foreground">{copy.researchOnly}</p>
          </div>
        </div>
      </section>
    </>
  )
}
