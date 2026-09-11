'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useRegion } from '@/components/region-provider'
import type { Product } from '@/lib/products'
import { catalogCopy, getProductCopy } from '@/lib/product-copy'
import { getRegionalPriceAmount, getRegionalPriceLabel } from '@/lib/region-pricing'

export function ProductCard({ product }: { product: Product }) {
  const { region, language, href } = useRegion()
  const copy = catalogCopy[language]
  const localized = getProductCopy(product, language)
  const catalogVariant = 'basic'
  const showStartingPrice = getRegionalPriceAmount(region.id, product.slug, catalogVariant) !== null

  return (
    <Link
      href={href(`/product/${product.slug}`)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-square bg-white">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={`Regen ${product.name} — ${copy.imageAlt}`}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
          {localized.category}
        </span>
        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] font-display text-base font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {localized.tagline}
        </p>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 gap-y-1 pt-3">
          <span className="font-display text-base font-bold text-primary sm:text-lg">
            {showStartingPrice && <><span className="block text-xs font-medium text-muted-foreground">{copy.startingPrice}</span>{' '}</>}
            {getRegionalPriceLabel(region, product.slug, catalogVariant)}
          </span>
          <span className="text-xs text-muted-foreground">/ {copy.variants[catalogVariant].label.toLowerCase()}</span>
        </div>
        <span className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors group-hover:bg-secondary/70">
          {copy.viewProduct}
          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
