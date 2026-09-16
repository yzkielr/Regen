import type { VariantId } from './products'
import type { Region, RegionId } from './regions'

type ProductPriceTable = Readonly<Record<string, Readonly<Record<VariantId, number | null>>>>

/** Published prices from the supplied "regen pricing web(2).xlsx", tab "idr pricing".
 * Each amount is taken directly from its currency/package cell.
 * No exchange-rate conversion or flat per-region price is used.
 * Rows 5-23 cover the sixteen catalog products and the selectable
 * Tesamorelin 10/20mg, GHK-Cu 50/100mg and NAD+ 500/1000mg strengths.
 * Blank prices stay null. Stock status and formats marked "-" are stored separately below.
 * Coming-soon products are not included.
 * Each region uses its published currency column; only priced or inquiry
 * formats can be selected. Semax and Selank list Basic Package only.
 */
export const REGIONAL_PRODUCT_PRICES: Readonly<Record<RegionId, ProductPriceTable>> = {
  // AUD: Basic E, Cartridge L, Pen S.
  au: {
    'retatrutide': { basic: 120, cartridge: 140, pen: 220 }, // Row 5.
    'cjc-1295-ipamorelin': { basic: 80, cartridge: 100, pen: 180 }, // Row 13.
    'klow80': { basic: 140, cartridge: 150, pen: 230 }, // Row 12.
    'mots-c': { basic: 90, cartridge: 100, pen: 180 }, // Row 14.
    'nad-plus': { basic: 90, cartridge: 100, pen: 180 }, // Row 10.
    'tesamorelin': { basic: 100, cartridge: 120, pen: 200 }, // Row 6.
    'bpc-157': { basic: 90, cartridge: 100, pen: 180 }, // Row 17.
    'ghk-cu': { basic: 80, cartridge: 100, pen: 180 }, // Row 9.
    'tesamorelin-20mg': { basic: 110, cartridge: 130, pen: 210 }, // Row 7.
    'ghk-cu-50mg': { basic: null, cartridge: 80, pen: 160 }, // Row 8.
    'nad-plus-1000mg': { basic: 100, cartridge: 120, pen: 190 }, // Row 11.
    'semax': { basic: 90, cartridge: null, pen: null }, // Row 15.
    'selank': { basic: 90, cartridge: null, pen: null }, // Row 16.
    'hgh-191-aa-36iu': { basic: 120, cartridge: 140, pen: 220 }, // Row 18.
    'glutathione': { basic: 30, cartridge: 40, pen: 120 }, // Row 19.
    'tirzepatide': { basic: 90, cartridge: 100, pen: 180 }, // Row 20.
    'semaglutide': { basic: null, cartridge: 90, pen: 170 }, // Row 21.
    'cagrilintide': { basic: null, cartridge: 100, pen: 180 }, // Row 22.
    '5-amino-1mq': { basic: 70, cartridge: 80, pen: 160 }, // Row 23.
  },
  // EUR: Basic C, Cartridge J, Pen Q.
  eu: {
    'retatrutide': { basic: 70, cartridge: 80, pen: 130 }, // Row 5.
    'cjc-1295-ipamorelin': { basic: 50, cartridge: 60, pen: 110 }, // Row 13.
    'klow80': { basic: 80, cartridge: 90, pen: 140 }, // Row 12.
    'mots-c': { basic: 50, cartridge: 60, pen: 110 }, // Row 14.
    'nad-plus': { basic: 50, cartridge: 60, pen: 110 }, // Row 10.
    'tesamorelin': { basic: 60, cartridge: 70, pen: 120 }, // Row 6.
    'bpc-157': { basic: 50, cartridge: 60, pen: 110 }, // Row 17.
    'ghk-cu': { basic: 50, cartridge: 60, pen: 110 }, // Row 9.
    'tesamorelin-20mg': { basic: 70, cartridge: 80, pen: 130 }, // Row 7.
    'ghk-cu-50mg': { basic: null, cartridge: 50, pen: 100 }, // Row 8.
    'nad-plus-1000mg': { basic: 60, cartridge: 70, pen: 120 }, // Row 11.
    'semax': { basic: 50, cartridge: null, pen: null }, // Row 15.
    'selank': { basic: 50, cartridge: null, pen: null }, // Row 16.
    'hgh-191-aa-36iu': { basic: 70, cartridge: 80, pen: 130 }, // Row 18.
    'glutathione': { basic: 10, cartridge: 20, pen: 70 }, // Row 19.
    'tirzepatide': { basic: 50, cartridge: 60, pen: 110 }, // Row 20.
    'semaglutide': { basic: null, cartridge: 60, pen: 100 }, // Row 21.
    'cagrilintide': { basic: null, cartridge: 60, pen: 110 }, // Row 22.
    '5-amino-1mq': { basic: 40, cartridge: 50, pen: 100 }, // Row 23.
  },
  // USD: Basic G, Cartridge N, Pen U.
  us: {
    'retatrutide': { basic: 90, cartridge: 100, pen: 150 }, // Row 5.
    'cjc-1295-ipamorelin': { basic: 60, cartridge: 70, pen: 130 }, // Row 13.
    'klow80': { basic: 100, cartridge: 110, pen: 170 }, // Row 12.
    'mots-c': { basic: 60, cartridge: 70, pen: 130 }, // Row 14.
    'nad-plus': { basic: 60, cartridge: 70, pen: 130 }, // Row 10.
    'tesamorelin': { basic: 70, cartridge: 80, pen: 140 }, // Row 6.
    'bpc-157': { basic: 60, cartridge: 70, pen: 130 }, // Row 17.
    'ghk-cu': { basic: 60, cartridge: 70, pen: 120 }, // Row 9.
    'tesamorelin-20mg': { basic: 80, cartridge: 90, pen: 150 }, // Row 7.
    'ghk-cu-50mg': { basic: null, cartridge: 50, pen: 110 }, // Row 8.
    'nad-plus-1000mg': { basic: 70, cartridge: 80, pen: 140 }, // Row 11.
    'semax': { basic: 60, cartridge: null, pen: null }, // Row 15.
    'selank': { basic: 60, cartridge: null, pen: null }, // Row 16.
    'hgh-191-aa-36iu': { basic: 90, cartridge: 100, pen: 150 }, // Row 18.
    'glutathione': { basic: 20, cartridge: 30, pen: 90 }, // Row 19.
    'tirzepatide': { basic: 60, cartridge: 70, pen: 130 }, // Row 20.
    'semaglutide': { basic: null, cartridge: 70, pen: 120 }, // Row 21.
    'cagrilintide': { basic: null, cartridge: 70, pen: 130 }, // Row 22.
    '5-amino-1mq': { basic: 50, cartridge: 60, pen: 110 }, // Row 23.
  },
  // GBP: Basic D, Cartridge K, Pen R.
  uk: {
    'retatrutide': { basic: 60, cartridge: 70, pen: 110 }, // Row 5.
    'cjc-1295-ipamorelin': { basic: 40, cartridge: 50, pen: 90 }, // Row 13.
    'klow80': { basic: 70, cartridge: 80, pen: 120 }, // Row 12.
    'mots-c': { basic: 40, cartridge: 50, pen: 90 }, // Row 14.
    'nad-plus': { basic: 40, cartridge: 50, pen: 90 }, // Row 10.
    'tesamorelin': { basic: 50, cartridge: 60, pen: 100 }, // Row 6.
    'bpc-157': { basic: 40, cartridge: 50, pen: 90 }, // Row 17.
    'ghk-cu': { basic: 40, cartridge: 50, pen: 90 }, // Row 9.
    'tesamorelin-20mg': { basic: 60, cartridge: 70, pen: 110 }, // Row 7.
    'ghk-cu-50mg': { basic: null, cartridge: 40, pen: 80 }, // Row 8.
    'nad-plus-1000mg': { basic: 50, cartridge: 60, pen: 100 }, // Row 11.
    'semax': { basic: 40, cartridge: null, pen: null }, // Row 15.
    'selank': { basic: 40, cartridge: null, pen: null }, // Row 16.
    'hgh-191-aa-36iu': { basic: 60, cartridge: 70, pen: 110 }, // Row 18.
    'glutathione': { basic: 10, cartridge: 20, pen: 60 }, // Row 19.
    'tirzepatide': { basic: 40, cartridge: 50, pen: 90 }, // Row 20.
    'semaglutide': { basic: null, cartridge: 50, pen: 90 }, // Row 21.
    'cagrilintide': { basic: null, cartridge: 50, pen: 90 }, // Row 22.
    '5-amino-1mq': { basic: 30, cartridge: 40, pen: 80 }, // Row 23.
  },
  // SGD: Basic F, Cartridge M, Pen T.
  sg: {
    'retatrutide': { basic: 110, cartridge: 120, pen: 200 }, // Row 5.
    'cjc-1295-ipamorelin': { basic: 70, cartridge: 90, pen: 160 }, // Row 13.
    'klow80': { basic: 120, cartridge: 140, pen: 210 }, // Row 12.
    'mots-c': { basic: 80, cartridge: 90, pen: 170 }, // Row 14.
    'nad-plus': { basic: 80, cartridge: 90, pen: 170 }, // Row 10.
    'tesamorelin': { basic: 90, cartridge: 110, pen: 180 }, // Row 6.
    'bpc-157': { basic: 80, cartridge: 90, pen: 170 }, // Row 17.
    'ghk-cu': { basic: 70, cartridge: 90, pen: 160 }, // Row 9.
    'tesamorelin-20mg': { basic: 100, cartridge: 120, pen: 190 }, // Row 7.
    'ghk-cu-50mg': { basic: null, cartridge: 70, pen: 140 }, // Row 8.
    'nad-plus-1000mg': { basic: 90, cartridge: 110, pen: 180 }, // Row 11.
    'semax': { basic: 80, cartridge: null, pen: null }, // Row 15.
    'selank': { basic: 80, cartridge: null, pen: null }, // Row 16.
    'hgh-191-aa-36iu': { basic: 110, cartridge: 120, pen: 200 }, // Row 18.
    'glutathione': { basic: 20, cartridge: 40, pen: 110 }, // Row 19.
    'tirzepatide': { basic: 80, cartridge: 90, pen: 170 }, // Row 20.
    'semaglutide': { basic: null, cartridge: 80, pen: 160 }, // Row 21.
    'cagrilintide': { basic: null, cartridge: 90, pen: 160 }, // Row 22.
    '5-amino-1mq': { basic: 60, cartridge: 70, pen: 150 }, // Row 23.
  },
  // MYR: Basic H, Cartridge O, Pen V.
  my: {
    'retatrutide': { basic: 370, cartridge: 410, pen: 640 }, // Row 5.
    'cjc-1295-ipamorelin': { basic: 250, cartridge: 300, pen: 530 }, // Row 13.
    'klow80': { basic: 410, cartridge: 460, pen: 690 }, // Row 12.
    'mots-c': { basic: 270, cartridge: 310, pen: 550 }, // Row 14.
    'nad-plus': { basic: 260, cartridge: 310, pen: 540 }, // Row 10.
    'tesamorelin': { basic: 310, cartridge: 360, pen: 590 }, // Row 6.
    'bpc-157': { basic: 260, cartridge: 310, pen: 540 }, // Row 17.
    'ghk-cu': { basic: 240, cartridge: 290, pen: 520 }, // Row 9.
    'tesamorelin-20mg': { basic: 340, cartridge: 390, pen: 620 }, // Row 7.
    'ghk-cu-50mg': { basic: null, cartridge: 240, pen: 470 }, // Row 8.
    'nad-plus-1000mg': { basic: 300, cartridge: 350, pen: 580 }, // Row 11.
    'semax': { basic: 260, cartridge: null, pen: null }, // Row 15.
    'selank': { basic: 260, cartridge: null, pen: null }, // Row 16.
    'hgh-191-aa-36iu': { basic: 360, cartridge: 410, pen: 640 }, // Row 18.
    'glutathione': { basic: 90, cartridge: 130, pen: 370 }, // Row 19.
    'tirzepatide': { basic: 260, cartridge: 310, pen: 540 }, // Row 20.
    'semaglutide': { basic: null, cartridge: 280, pen: 510 }, // Row 21.
    'cagrilintide': { basic: null, cartridge: 300, pen: 530 }, // Row 22.
    '5-amino-1mq': { basic: 200, cartridge: 250, pen: 480 }, // Row 23.
  },
  // IDR: Basic I, Cartridge P, Pen W.
  id: {
    'retatrutide': { basic: 1_599_000, cartridge: 1_799_000, pen: 2_799_000 }, // Row 5.
    'cjc-1295-ipamorelin': { basic: 1_098_000, cartridge: 1_298_000, pen: 2_298_000 }, // Row 13.
    'klow80': { basic: 1_800_000, cartridge: 2_000_000, pen: 3_000_000 }, // Row 12.
    'mots-c': { basic: 1_176_000, cartridge: 1_376_000, pen: 2_376_000 }, // Row 14.
    'nad-plus': { basic: 1_162_000, cartridge: 1_362_000, pen: 2_362_000 }, // Row 10.
    'tesamorelin': { basic: 1_372_000, cartridge: 1_572_000, pen: 2_572_000 }, // Row 6.
    'bpc-157': { basic: 1_162_000, cartridge: 1_362_000, pen: 2_362_000 }, // Row 17.
    'ghk-cu': { basic: 1_078_000, cartridge: 1_278_000, pen: 2_278_000 }, // Row 9.
    'tesamorelin-20mg': { basic: 1_492_800, cartridge: 1_692_800, pen: 2_692_800 }, // Row 7.
    'ghk-cu-50mg': { basic: null, cartridge: 1_051_000, pen: 2_051_000 }, // Row 8.
    'nad-plus-1000mg': { basic: 1_330_000, cartridge: 1_530_000, pen: 2_530_000 }, // Row 11.
    'semax': { basic: 1_162_000, cartridge: null, pen: null }, // Row 15.
    'selank': { basic: 1_162_000, cartridge: null, pen: null }, // Row 16.
    'hgh-191-aa-36iu': { basic: 1_590_000, cartridge: 1_790_000, pen: 2_790_000 }, // Row 18.
    'glutathione': { basic: 400_000, cartridge: 600_000, pen: 1_600_000 }, // Row 19.
    'tirzepatide': { basic: 1_162_000, cartridge: 1_362_000, pen: 2_362_000 }, // Row 20.
    'semaglutide': { basic: null, cartridge: 1_230_400, pen: 2_230_400 }, // Row 21.
    'cagrilintide': { basic: null, cartridge: 1_299_000, pen: 2_299_000 }, // Row 22.
    '5-amino-1mq': { basic: 889_000, cartridge: 1_099_000, pen: 2_099_000 }, // Row 23.
  },
}

/** Retained export for existing callers; shares the updated IDR table. */
export const INDONESIAN_PRODUCT_PRICES: ProductPriceTable = REGIONAL_PRODUCT_PRICES.id

/** @deprecated Use getRegionalPriceAmount with a product slug.
 * Retained for import compatibility. Flat region-wide fallback prices are
 * retired because the workbook now specifies prices for each product.
 */
export const REGIONAL_PRICES: Record<RegionId, Record<Exclude<VariantId, 'basic'>, number | null>> = {
  au: { cartridge: null, pen: null },
  eu: { cartridge: null, pen: null },
  us: { cartridge: null, pen: null },
  uk: { cartridge: null, pen: null },
  sg: { cartridge: null, pen: null },
  my: { cartridge: null, pen: null },
  id: { cartridge: null, pen: null },
}

export function getRegionalPriceAmount(regionId: RegionId, productSlug: string, variant: VariantId): number | null {
  if (!Object.hasOwn(REGIONAL_PRODUCT_PRICES, regionId)) return null

  const regionalPrices = REGIONAL_PRODUCT_PRICES[regionId]
  if (!Object.hasOwn(regionalPrices, productSlug)) return null

  const prices = regionalPrices[productSlug]
  return Object.hasOwn(prices, variant) ? prices[variant] : null
}

export type RegionalPriceStatus = 'available' | 'out-of-stock' | 'unavailable' | 'inquiry'

/** I8, I21 and I22 say "out of stock". Their foreign Basic cells are blank. */
const OUT_OF_STOCK: Partial<Record<RegionId, Readonly<Record<string, readonly VariantId[]>>>> = {
  id: { 'ghk-cu-50mg': ['basic'], semaglutide: ['basic'], cagrilintide: ['basic'] },
}

/** J15:W16 are dashes in every currency, so these formats are not listed. */
const UNAVAILABLE_FORMATS: Readonly<Record<string, readonly VariantId[]>> = {
  semax: ['cartridge', 'pen'],
  selank: ['cartridge', 'pen'],
}

export function getRegionalPriceStatus(regionId: RegionId, productSlug: string, variant: VariantId): RegionalPriceStatus {
  if (Object.hasOwn(UNAVAILABLE_FORMATS, productSlug) && UNAVAILABLE_FORMATS[productSlug].includes(variant)) {
    return 'unavailable'
  }
  const unavailable = Object.hasOwn(OUT_OF_STOCK, regionId) ? OUT_OF_STOCK[regionId] : undefined
  if (unavailable && Object.hasOwn(unavailable, productSlug) && unavailable[productSlug].includes(variant)) {
    return 'out-of-stock'
  }
  return getRegionalPriceAmount(regionId, productSlug, variant) === null ? 'inquiry' : 'available'
}

export function isRegionalVariantSelectable(regionId: RegionId, productSlug: string, variant: VariantId): boolean {
  const status = getRegionalPriceStatus(regionId, productSlug, variant)
  return status === 'available' || status === 'inquiry'
}

/** Catalog and wheel use the first package with an actual published price. */
export function getCatalogPriceVariant(regionId: RegionId, productSlug: string): VariantId {
  const variants: VariantId[] = ['basic', 'cartridge', 'pen']
  return variants.find((variant) => getRegionalPriceStatus(regionId, productSlug, variant) === 'available')
    ?? variants.find((variant) => isRegionalVariantSelectable(regionId, productSlug, variant))
    ?? 'basic'
}

export function formatRegionPrice(region: Region, productSlug: string, variant: VariantId): string | null {
  const amount = getRegionalPriceAmount(region.id, productSlug, variant)
  if (amount === null) return null

  // Keep comma grouping for IDR (for example, IDR 1,599,000).
  // Other currencies retain their regional formatting.
  return new Intl.NumberFormat(region.currency === 'IDR' ? 'en-US' : region.locale, {
    style: 'currency',
    currency: region.currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: region.currency === 'IDR' ? 0 : 2,
  }).format(amount)
}

export function getRegionalPriceLabel(region: Region, productSlug: string, variant: VariantId): string {
  const status = getRegionalPriceStatus(region.id, productSlug, variant)
  if (status === 'unavailable') {
    return region.language === 'en' ? 'Format unavailable' : 'Format tidak tersedia'
  }
  if (status === 'out-of-stock') {
    if (region.language === 'id') return 'Stok habis'
    if (region.language === 'ms') return 'Kehabisan stok'
    return 'Out of stock'
  }
  const price = formatRegionPrice(region, productSlug, variant)
  if (price !== null) return price
  if (region.language === 'ms') return `Tanya harga ${region.currency}`
  if (region.language === 'id') return `Tanya harga ${region.currency}`
  return `Request ${region.currency} pricing`
}
