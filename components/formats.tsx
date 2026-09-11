'use client'

import Image from 'next/image'
import { ConsultationButton } from '@/components/consultation-button'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'
import { useRegion } from '@/components/region-provider'
import { catalogCopy } from '@/lib/product-copy'
import { getProductVariants, type VariantId } from '@/lib/products'

const formatImages: Record<VariantId, string> = {
  basic: '/products/basic-package.png',
  cartridge: '/products/cartridge-package.jpeg',
  pen: '/products/pen-package.jpeg',
}

export function Formats() {
  const { language, region } = useRegion()
  const copy = catalogCopy[language]
  const formats = getProductVariants(region.id)
  const hasBasic = formats.some((format) => format.id === 'basic')

  return (
    <section id="format" className="bg-secondary py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="heading-gradient text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {copy.formatsHeading}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {copy.formatsBody}
          </p>
        </Reveal>

        <Stagger className={`mt-12 grid gap-6 ${hasBasic ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {formats.map((format) => (
            <StaggerItem
              key={format.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="relative aspect-square bg-card">
                <Image
                  src={formatImages[format.id]}
                  alt={`Regen — ${copy.variants[format.id].alt}`}
                  fill
                  sizes={hasBasic ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 50vw'}
                  className="object-contain"
                />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {copy.formats[format.id].name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {copy.formats[format.id].body}
                </p>
              </div>
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
      </div>
    </section>
  )
}
