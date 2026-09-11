'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  FlaskConical,
  FileCheck2,
  Truck,
  Headset,
  MessageCircle,
} from 'lucide-react'
import { ConsultationButton } from '@/components/consultation-button'
import { useRegion } from '@/components/region-provider'
import { getProductVariants, type Product, type VariantId } from '@/lib/products'
import { catalogCopy, getProductCopy } from '@/lib/product-copy'
import { getRegionalPriceLabel } from '@/lib/region-pricing'

const uspIcons = [FlaskConical, FileCheck2, Truck, Headset]

// Simpan foto Paket Basic di public/products/basic-package.jpeg.
// Foto paket ini dipakai bersama oleh semua halaman produk.
const BASIC_PACKAGE_IMAGE = '/products/basic-package.png'

type ProductSelection = {
  regionId: string
  productSlug: string
  variant: VariantId
  activeImage: number
}

export function ProductDetail({ product }: { product: Product }) {
  const { region, language, href } = useRegion()
  const copy = catalogCopy[language]
  const localized = getProductCopy(product, language)
  const variants = getProductVariants(region.id)

  // Urutan thumbnail: Cartridge Set, Pen Package, Paket Basic, foto produk.
  const gallery: {
    src: string
    alt: string
    variant: VariantId | null
  }[] = [
    {
      src: '/products/cartridge-package.jpeg',
      alt: `Regen ${product.name} — ${copy.variants.cartridge.alt}`,
      variant: 'cartridge',
    },
    {
      src: '/products/pen-package.jpeg',
      alt: `Regen ${product.name} — ${copy.variants.pen.alt}`,
      variant: 'pen',
    },
    {
      src: BASIC_PACKAGE_IMAGE,
      alt: `Regen ${product.name} — ${copy.variants.basic.label}`,
      variant: 'basic',
    },
    {
      src: product.image || '/placeholder.svg',
      alt: `Regen ${product.name} — ${copy.imageAlt}`,
      variant: null,
    },
  ]

  const defaultSelection: ProductSelection = {
    regionId: region.id,
    productSlug: product.slug,
    variant: variants[0].id,
    activeImage: Math.max(0, gallery.findIndex((img) => img.variant === variants[0].id)),
  }
  const [selection, setSelection] = useState<ProductSelection>(defaultSelection)
  // A client-side region or product change must not carry an unavailable
  // package or a different product's gallery selection into the new page.
  const currentSelection = selection.regionId === region.id &&
    selection.productSlug === product.slug &&
    variants.some((v) => v.id === selection.variant)
    ? selection
    : defaultSelection
  const { variant, activeImage } = currentSelection
  const active = copy.variants[variant]

  function selectVariant(id: VariantId) {
    const idx = gallery.findIndex((img) => img.variant === id)
    setSelection({
      ...currentSelection,
      variant: id,
      activeImage: idx >= 0 ? idx : activeImage,
    })
  }

  function selectImage(idx: number) {
    const imageVariant = gallery[idx].variant
    // Semua foto dapat dilihat. Pilihan harga hanya mengikuti paket yang
    // tersedia di region aktif; Paket Basic tetap khusus Indonesia.
    const availableVariant = variants.find((v) => v.id === imageVariant)
    setSelection({
      ...currentSelection,
      activeImage: idx,
      variant: availableVariant?.id ?? variant,
    })
  }

  return (
    <section className="bg-background pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Link
          href={href('#katalog')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {copy.backToCatalog}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left: product image gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card">
              <Image
                key={gallery[activeImage].src}
                src={gallery[activeImage].src}
                alt={gallery[activeImage].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img, idx) => {
                const selected = idx === activeImage
                return (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => selectImage(idx)}
                    aria-label={`${copy.viewImage} ${img.alt}`}
                    aria-pressed={selected}
                    className={`relative aspect-square overflow-hidden rounded-xl border bg-card transition-all ${
                      selected
                        ? 'border-accent ring-1 ring-accent'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 25vw, 150px"
                      className="object-contain p-1"
                    />
                  </button>
                )
              })}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {copy.photoNotice}
            </p>
          </div>

          {/* Right: product info */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {localized.category}
            </span>
            <h1 className="mt-2 text-balance font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              {localized.description}
            </p>

            <div className="mt-5 flex flex-wrap items-baseline gap-2" aria-live="polite">
              <span className="font-display text-2xl font-bold text-primary sm:text-3xl">
                {getRegionalPriceLabel(region, product.slug, variant)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {active.label.toLowerCase()}
              </span>
            </div>
            {variant !== 'basic' && (
              <p className="mt-1 text-xs text-muted-foreground">
                {copy.labelReference}: {localized.dosage}
              </p>
            )}

            {/* Variant selector */}
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-foreground">
                {copy.selectFormat}
              </legend>
              <div className={`mt-3 grid gap-3 ${region.id === 'id' ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3' : 'grid-cols-2'}`}>
                {variants.map((v) => {
                  const selected = v.id === variant
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => selectVariant(v.id)}
                      aria-pressed={selected}
                      className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-border bg-card hover:border-accent/50'
                      }`}
                    >
                      <span className="font-display text-sm font-semibold text-foreground">
                        {copy.variants[v.id].label}
                      </span>
                      <span className="mt-1 font-display text-base font-bold text-primary sm:text-lg">
                        {getRegionalPriceLabel(region, product.slug, v.id)}
                      </span>
                      <span className="mt-1 text-xs leading-snug text-muted-foreground">
                        {copy.variants[v.id].note}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {copy.priceNotice}
            </p>

            <ConsultationButton
              size="lg"
              productName={region.id === 'id' ? `${product.name} — ${active.label}` : product.name}
              className="mt-6 w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {copy.orderConsultation}
            </ConsultationButton>

            {/* USP icons row */}
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-6 sm:grid-cols-4">
              {uspIcons.map((Icon, index) => (
                <li
                  key={copy.usps[index]}
                  className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left"
                >
                  <Icon className="size-5 text-accent" aria-hidden="true" />
                  <span className="text-xs leading-snug text-muted-foreground">
                    {copy.usps[index]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl border border-border bg-muted/50 p-4 text-xs font-semibold leading-relaxed text-foreground">
              {copy.researchOnly}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
