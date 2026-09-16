'use client'

import { useState } from 'react'
import { ProductImage as Image } from '@/components/product-image'
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
import { getDefaultProductStrength, getProductStrengths, getProductVariants, type Product, type VariantId } from '@/lib/products'
import { catalogCopy, getProductCopy } from '@/lib/product-copy'
import { getRegionalPriceLabel, isRegionalVariantSelectable } from '@/lib/region-pricing'

const uspIcons = [FlaskConical, FileCheck2, Truck, Headset]

// Simpan foto Basic Package di public/product/basic-package.png.
// Foto paket ini dipakai bersama oleh semua halaman produk.
const BASIC_PACKAGE_IMAGE = '/products/basic-package.png'

type ProductSelection = {
  regionId: string
  productSlug: string
  strengthId: string | null
  variant: VariantId
  activeImage: number
}

export function ProductDetail({ product }: { product: Product }) {
  const { region, language, href } = useRegion()
  const copy = catalogCopy[language]
  const variants = getProductVariants(region.id)
  const strengths = getProductStrengths(product)
  const defaultStrength = getDefaultProductStrength(product)
  const defaultVariant = variants.find((v) => v.id === 'cartridge')?.id ?? variants[0].id
  const [selection, setSelection] = useState<ProductSelection>({
    regionId: region.id,
    productSlug: product.slug,
    strengthId: defaultStrength?.id ?? null,
    variant: defaultVariant,
    activeImage: 0,
  })
  const sameProduct = selection.productSlug === product.slug
  const strength = (sameProduct ? strengths.find((item) => item.id === selection.strengthId) : undefined) ?? defaultStrength
  const priceKey = strength?.priceKey ?? product.slug
  const localized = getProductCopy(product, language, strength?.id)

  function availableVariant(requested: VariantId, key: string): VariantId {
    const available = variants.filter((v) => isRegionalVariantSelectable(region.id, key, v.id))
    return available.find((v) => v.id === requested)?.id
      ?? available.find((v) => v.id === 'cartridge')?.id
      ?? available[0]?.id
      ?? defaultVariant
  }

  // Keep the chosen mg when changing region. A sold-out or unlisted package
  // switches to an available format; switching product restores its defaults.
  const variant = availableVariant(sameProduct ? selection.variant : defaultVariant, priceKey)
  const active = copy.variants[variant]

  // Urutan thumbnail: Cartridge Package, Pen Package, Basic Package, foto produk.
  const gallery: {
    src: string
    alt: string
    variant: VariantId | null
  }[] = [
    {
      src: '/products/cartridge-package.jpeg',
      alt: `Regen ${localized.name} — ${copy.variants.cartridge.alt}`,
      variant: 'cartridge',
    },
    {
      src: '/products/pen-package.jpeg',
      alt: `Regen ${localized.name} — ${copy.variants.pen.alt}`,
      variant: 'pen',
    },
    {
      src: BASIC_PACKAGE_IMAGE,
      alt: `Regen ${localized.name} — ${copy.variants.basic.label}`,
      variant: 'basic',
    },
    {
      src: localized.image || '/placeholder.svg',
      alt: `Regen ${localized.name} — ${copy.imageAlt}`,
      variant: null,
    },
  ]

  const activeImage = sameProduct && selection.variant === variant &&
    selection.strengthId === (strength?.id ?? null) && gallery[selection.activeImage]
    ? selection.activeImage
    : Math.max(0, gallery.findIndex((img) => img.variant === variant))
  const currentSelection: ProductSelection = {
    regionId: region.id,
    productSlug: product.slug,
    strengthId: strength?.id ?? null,
    variant,
    activeImage,
  }

  function selectStrength(id: string) {
    const next = strengths.find((item) => item.id === id)
    if (!next) return
    const nextVariant = availableVariant(variant, next.priceKey)
    setSelection({
      ...currentSelection,
      strengthId: next.id,
      variant: nextVariant,
      activeImage: Math.max(0, gallery.findIndex((img) => img.variant === nextVariant)),
    })
  }

  function selectVariant(id: VariantId) {
    if (!isRegionalVariantSelectable(region.id, priceKey, id)) return
    const idx = gallery.findIndex((img) => img.variant === id)
    setSelection({
      ...currentSelection,
      variant: id,
      activeImage: idx >= 0 ? idx : activeImage,
    })
  }

  function selectImage(idx: number) {
    const imageVariant = gallery[idx].variant
    if (imageVariant && !isRegionalVariantSelectable(region.id, priceKey, imageVariant)) return
    // Foto paket memilih format yang sama dan harga dalam mata uang region aktif.
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
                    disabled={img.variant !== null && !isRegionalVariantSelectable(region.id, priceKey, img.variant)}
                    aria-label={`${copy.viewImage} ${img.alt}`}
                    aria-pressed={selected}
                    className={`relative aspect-square overflow-hidden rounded-xl border bg-card transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
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
              {strength && strength.id !== defaultStrength?.id && !strength.image
                ? copy.strengthPhotoNotice
                : copy.photoNotice}
            </p>
          </div>

          {/* Right: product info */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {localized.category}
            </span>
            <h1 className="mt-2 text-balance font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {localized.name}
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              {localized.description}
            </p>

            <div className="mt-5 flex flex-wrap items-baseline gap-2" aria-live="polite">
              <span className="font-display text-2xl font-bold text-primary sm:text-3xl">
                {getRegionalPriceLabel(region, priceKey, variant)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {active.label.toLowerCase()}
              </span>
            </div>
            {variant !== 'basic' && localized.dosage && (
              <p className="mt-1 text-xs text-muted-foreground">
                {copy.labelReference}: {localized.dosage}
              </p>
            )}

            {/* Strength selector sits directly above the package formats. */}
            {strengths.length > 1 && (
              <fieldset className="mt-6">
                <legend className="text-sm font-medium text-foreground">
                  {copy.selectStrength}
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {strengths.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectStrength(option.id)}
                      aria-pressed={option.id === strength?.id}
                      className={`min-h-[72px] min-w-0 whitespace-nowrap rounded-2xl border px-2 py-4 text-left font-display text-2xl font-bold text-primary transition-colors sm:min-h-[80px] sm:px-5 sm:py-5 sm:text-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        option.id === strength?.id
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-border bg-card hover:border-accent/50'
                      }`}
                    >
                      {option.mg} mg
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Variant selector */}
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-foreground">
                {copy.selectFormat}
              </legend>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {variants.map((v) => {
                  const selected = v.id === variant
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => selectVariant(v.id)}
                      disabled={!isRegionalVariantSelectable(region.id, priceKey, v.id)}
                      aria-pressed={selected}
                      className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        selected
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-border bg-card hover:border-accent/50'
                      }`}
                    >
                      <span className="font-display text-sm font-semibold text-foreground">
                        {copy.variants[v.id].label}
                      </span>
                      <span className="mt-1 font-display text-base font-bold text-primary sm:text-lg">
                        {getRegionalPriceLabel(region, priceKey, v.id)}
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
              productName={`${localized.name} — ${active.label}`}
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
