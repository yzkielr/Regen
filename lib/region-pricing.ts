import type { VariantId } from './products'
import type { Region, RegionId } from './regions'

type ProductPriceTable = Readonly<Record<string, Readonly<Record<VariantId, number | null>>>>

/** Normal prices from "regen pricing web.xlsx", tab "idr pricing v2" (10 October 2026).
 * Rows 6-24 cover 16 catalog products and 3 additional selectable strengths.
 * IDR uses J / S / AB, never the after-voucher or voucher-amount columns.
 * Other currencies use their normal-price columns directly, without conversion.
 * Blank prices stay null; sold-out and unavailable formats retain their statuses.
 * J9 is #VALUE! because I9 says "out of stock": GHK-Cu 50mg Basic stays unpriced.
 * The source snapshot and cell references are in fixtures/pricing-v2.json.
 */
export const REGIONAL_PRODUCT_PRICES: Readonly<Record<RegionId, ProductPriceTable>> = {
  // AUD normal prices: Basic E, Cartridge N, Pen W.
  au: {
    'retatrutide': { basic: 170, cartridge: 230, pen: 310 }, // Row 6.
    'cjc-1295-ipamorelin': { basic: 130, cartridge: 180, pen: 270 }, // Row 14.
    'klow80': { basic: 180, cartridge: 240, pen: 320 }, // Row 13.
    'mots-c': { basic: 130, cartridge: 190, pen: 270 }, // Row 15.
    'nad-plus': { basic: 130, cartridge: 190, pen: 270 }, // Row 11.
    'tesamorelin': { basic: 150, cartridge: 210, pen: 290 }, // Row 7.
    'bpc-157': { basic: 130, cartridge: 190, pen: 270 }, // Row 18.
    'ghk-cu': { basic: 130, cartridge: 180, pen: 260 }, // Row 10.
    'tesamorelin-20mg': { basic: 160, cartridge: 220, pen: 300 }, // Row 8.
    'ghk-cu-50mg': { basic: null, cartridge: 160, pen: 250 }, // Row 9.
    'nad-plus-1000mg': { basic: 150, cartridge: 200, pen: 280 }, // Row 12.
    'semax': { basic: 130, cartridge: null, pen: null }, // Row 16.
    'selank': { basic: 130, cartridge: null, pen: null }, // Row 17.
    'hgh-191-aa-36iu': { basic: 170, cartridge: 220, pen: 300 }, // Row 19.
    'glutathione': { basic: 70, cartridge: 130, pen: 210 }, // Row 20.
    'tirzepatide': { basic: 130, cartridge: 190, pen: 270 }, // Row 21.
    'semaglutide': { basic: null, cartridge: 180, pen: 260 }, // Row 22.
    'cagrilintide': { basic: null, cartridge: 180, pen: 270 }, // Row 23.
    '5-amino-1mq': { basic: 110, cartridge: 170, pen: 250 }, // Row 24.
  },
  // EUR normal prices: Basic C, Cartridge L, Pen U.
  eu: {
    'retatrutide': { basic: 100, cartridge: 140, pen: 190 }, // Row 6.
    'cjc-1295-ipamorelin': { basic: 80, cartridge: 110, pen: 160 }, // Row 14.
    'klow80': { basic: 110, cartridge: 150, pen: 200 }, // Row 13.
    'mots-c': { basic: 80, cartridge: 120, pen: 170 }, // Row 15.
    'nad-plus': { basic: 80, cartridge: 120, pen: 170 }, // Row 11.
    'tesamorelin': { basic: 90, cartridge: 130, pen: 180 }, // Row 7.
    'bpc-157': { basic: 80, cartridge: 120, pen: 170 }, // Row 18.
    'ghk-cu': { basic: 80, cartridge: 110, pen: 160 }, // Row 10.
    'tesamorelin-20mg': { basic: 100, cartridge: 130, pen: 180 }, // Row 8.
    'ghk-cu-50mg': { basic: null, cartridge: 100, pen: 150 }, // Row 9.
    'nad-plus-1000mg': { basic: 90, cartridge: 130, pen: 180 }, // Row 12.
    'semax': { basic: 80, cartridge: null, pen: null }, // Row 16.
    'selank': { basic: 80, cartridge: null, pen: null }, // Row 17.
    'hgh-191-aa-36iu': { basic: 100, cartridge: 140, pen: 190 }, // Row 19.
    'glutathione': { basic: 40, cartridge: 80, pen: 130 }, // Row 20.
    'tirzepatide': { basic: 80, cartridge: 120, pen: 170 }, // Row 21.
    'semaglutide': { basic: null, cartridge: 110, pen: 160 }, // Row 22.
    'cagrilintide': { basic: null, cartridge: 110, pen: 160 }, // Row 23.
    '5-amino-1mq': { basic: 70, cartridge: 100, pen: 150 }, // Row 24.
  },
  // USD normal prices: Basic G, Cartridge P, Pen Y.
  us: {
    'retatrutide': { basic: 120, cartridge: 160, pen: 210 }, // Row 6.
    'cjc-1295-ipamorelin': { basic: 90, cartridge: 130, pen: 180 }, // Row 14.
    'klow80': { basic: 130, cartridge: 170, pen: 220 }, // Row 13.
    'mots-c': { basic: 90, cartridge: 130, pen: 190 }, // Row 15.
    'nad-plus': { basic: 90, cartridge: 130, pen: 190 }, // Row 11.
    'tesamorelin': { basic: 100, cartridge: 140, pen: 200 }, // Row 7.
    'bpc-157': { basic: 90, cartridge: 130, pen: 190 }, // Row 18.
    'ghk-cu': { basic: 90, cartridge: 130, pen: 180 }, // Row 10.
    'tesamorelin-20mg': { basic: 110, cartridge: 150, pen: 210 }, // Row 8.
    'ghk-cu-50mg': { basic: null, cartridge: 110, pen: 170 }, // Row 9.
    'nad-plus-1000mg': { basic: 100, cartridge: 140, pen: 200 }, // Row 12.
    'semax': { basic: 90, cartridge: null, pen: null }, // Row 16.
    'selank': { basic: 90, cartridge: null, pen: null }, // Row 17.
    'hgh-191-aa-36iu': { basic: 120, cartridge: 160, pen: 210 }, // Row 19.
    'glutathione': { basic: 50, cartridge: 90, pen: 150 }, // Row 20.
    'tirzepatide': { basic: 90, cartridge: 130, pen: 190 }, // Row 21.
    'semaglutide': { basic: null, cartridge: 120, pen: 180 }, // Row 22.
    'cagrilintide': { basic: null, cartridge: 130, pen: 180 }, // Row 23.
    '5-amino-1mq': { basic: 80, cartridge: 120, pen: 170 }, // Row 24.
  },
  // GBP normal prices: Basic D, Cartridge M, Pen V.
  uk: {
    'retatrutide': { basic: 90, cartridge: 120, pen: 160 }, // Row 6.
    'cjc-1295-ipamorelin': { basic: 70, cartridge: 100, pen: 140 }, // Row 14.
    'klow80': { basic: 100, cartridge: 130, pen: 170 }, // Row 13.
    'mots-c': { basic: 70, cartridge: 100, pen: 140 }, // Row 15.
    'nad-plus': { basic: 70, cartridge: 100, pen: 140 }, // Row 11.
    'tesamorelin': { basic: 80, cartridge: 110, pen: 150 }, // Row 7.
    'bpc-157': { basic: 70, cartridge: 100, pen: 140 }, // Row 18.
    'ghk-cu': { basic: 70, cartridge: 100, pen: 140 }, // Row 10.
    'tesamorelin-20mg': { basic: 80, cartridge: 110, pen: 160 }, // Row 8.
    'ghk-cu-50mg': { basic: null, cartridge: 90, pen: 130 }, // Row 9.
    'nad-plus-1000mg': { basic: 80, cartridge: 110, pen: 150 }, // Row 12.
    'semax': { basic: 70, cartridge: null, pen: null }, // Row 16.
    'selank': { basic: 70, cartridge: null, pen: null }, // Row 17.
    'hgh-191-aa-36iu': { basic: 90, cartridge: 120, pen: 160 }, // Row 19.
    'glutathione': { basic: 40, cartridge: 70, pen: 110 }, // Row 20.
    'tirzepatide': { basic: 70, cartridge: 100, pen: 140 }, // Row 21.
    'semaglutide': { basic: null, cartridge: 90, pen: 140 }, // Row 22.
    'cagrilintide': { basic: null, cartridge: 100, pen: 140 }, // Row 23.
    '5-amino-1mq': { basic: 60, cartridge: 90, pen: 130 }, // Row 24.
  },
  // SGD normal prices: Basic F, Cartridge O, Pen X.
  sg: {
    'retatrutide': { basic: 150, cartridge: 200, pen: 270 }, // Row 6.
    'cjc-1295-ipamorelin': { basic: 110, cartridge: 160, pen: 240 }, // Row 14.
    'klow80': { basic: 160, cartridge: 210, pen: 290 }, // Row 13.
    'mots-c': { basic: 120, cartridge: 170, pen: 240 }, // Row 15.
    'nad-plus': { basic: 120, cartridge: 170, pen: 240 }, // Row 11.
    'tesamorelin': { basic: 130, cartridge: 180, pen: 260 }, // Row 7.
    'bpc-157': { basic: 120, cartridge: 170, pen: 240 }, // Row 18.
    'ghk-cu': { basic: 110, cartridge: 160, pen: 230 }, // Row 10.
    'tesamorelin-20mg': { basic: 140, cartridge: 190, pen: 260 }, // Row 8.
    'ghk-cu-50mg': { basic: null, cartridge: 150, pen: 220 }, // Row 9.
    'nad-plus-1000mg': { basic: 130, cartridge: 180, pen: 250 }, // Row 12.
    'semax': { basic: 120, cartridge: null, pen: null }, // Row 16.
    'selank': { basic: 120, cartridge: null, pen: null }, // Row 17.
    'hgh-191-aa-36iu': { basic: 150, cartridge: 200, pen: 270 }, // Row 19.
    'glutathione': { basic: 60, cartridge: 110, pen: 190 }, // Row 20.
    'tirzepatide': { basic: 120, cartridge: 170, pen: 240 }, // Row 21.
    'semaglutide': { basic: null, cartridge: 160, pen: 230 }, // Row 22.
    'cagrilintide': { basic: null, cartridge: 160, pen: 240 }, // Row 23.
    '5-amino-1mq': { basic: 100, cartridge: 150, pen: 220 }, // Row 24.
  },
  // MYR normal prices: Basic H, Cartridge Q, Pen Z.
  my: {
    'retatrutide': { basic: 480, cartridge: 640, pen: 870 }, // Row 6.
    'cjc-1295-ipamorelin': { basic: 370, cartridge: 530, pen: 750 }, // Row 14.
    'klow80': { basic: 530, cartridge: 690, pen: 910 }, // Row 13.
    'mots-c': { basic: 380, cartridge: 540, pen: 770 }, // Row 15.
    'nad-plus': { basic: 380, cartridge: 540, pen: 770 }, // Row 11.
    'tesamorelin': { basic: 430, cartridge: 590, pen: 820 }, // Row 7.
    'bpc-157': { basic: 380, cartridge: 540, pen: 770 }, // Row 18.
    'ghk-cu': { basic: 360, cartridge: 520, pen: 750 }, // Row 10.
    'tesamorelin-20mg': { basic: 460, cartridge: 620, pen: 840 }, // Row 8.
    'ghk-cu-50mg': { basic: null, cartridge: 470, pen: 700 }, // Row 9.
    'nad-plus-1000mg': { basic: 420, cartridge: 580, pen: 810 }, // Row 12.
    'semax': { basic: 380, cartridge: null, pen: null }, // Row 16.
    'selank': { basic: 380, cartridge: null, pen: null }, // Row 17.
    'hgh-191-aa-36iu': { basic: 480, cartridge: 640, pen: 870 }, // Row 19.
    'glutathione': { basic: 210, cartridge: 370, pen: 590 }, // Row 20.
    'tirzepatide': { basic: 380, cartridge: 540, pen: 770 }, // Row 21.
    'semaglutide': { basic: null, cartridge: 510, pen: 740 }, // Row 22.
    'cagrilintide': { basic: null, cartridge: 530, pen: 750 }, // Row 23.
    '5-amino-1mq': { basic: 320, cartridge: 480, pen: 710 }, // Row 24.
  },
  // IDR normal prices: Basic J, Cartridge S, Pen AB.
  id: {
    'retatrutide': { basic: 2_099_000, cartridge: 2_799_000, pen: 3_799_000 }, // Row 6.
    'cjc-1295-ipamorelin': { basic: 1_598_000, cartridge: 2_298_000, pen: 3_298_000 }, // Row 14.
    'klow80': { basic: 2_300_000, cartridge: 3_000_000, pen: 4_000_000 }, // Row 13.
    'mots-c': { basic: 1_676_000, cartridge: 2_376_000, pen: 3_376_000 }, // Row 15.
    'nad-plus': { basic: 1_662_000, cartridge: 2_362_000, pen: 3_362_000 }, // Row 11.
    'tesamorelin': { basic: 1_872_000, cartridge: 2_572_000, pen: 3_572_000 }, // Row 7.
    'bpc-157': { basic: 1_662_000, cartridge: 2_362_000, pen: 3_362_000 }, // Row 18.
    'ghk-cu': { basic: 1_578_000, cartridge: 2_278_000, pen: 3_278_000 }, // Row 10.
    'tesamorelin-20mg': { basic: 1_992_800, cartridge: 2_692_800, pen: 3_692_800 }, // Row 8.
    'ghk-cu-50mg': { basic: null, cartridge: 2_051_000, pen: 3_051_000 }, // Row 9.
    'nad-plus-1000mg': { basic: 1_830_000, cartridge: 2_530_000, pen: 3_530_000 }, // Row 12.
    'semax': { basic: 1_662_000, cartridge: null, pen: null }, // Row 16.
    'selank': { basic: 1_662_000, cartridge: null, pen: null }, // Row 17.
    'hgh-191-aa-36iu': { basic: 2_090_000, cartridge: 2_790_000, pen: 3_790_000 }, // Row 19.
    'glutathione': { basic: 900_000, cartridge: 1_600_000, pen: 2_600_000 }, // Row 20.
    'tirzepatide': { basic: 1_662_000, cartridge: 2_362_000, pen: 3_362_000 }, // Row 21.
    'semaglutide': { basic: null, cartridge: 2_230_400, pen: 3_230_400 }, // Row 22.
    'cagrilintide': { basic: null, cartridge: 2_299_000, pen: 3_299_000 }, // Row 23.
    '5-amino-1mq': { basic: 1_389_000, cartridge: 2_099_000, pen: 3_099_000 }, // Row 24.
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

/** I9, J22 and J23 say "out of stock". Their foreign Basic cells are blank. */
const OUT_OF_STOCK: Partial<Record<RegionId, Readonly<Record<string, readonly VariantId[]>>>> = {
  id: { 'ghk-cu-50mg': ['basic'], semaglutide: ['basic'], cagrilintide: ['basic'] },
}

/** L16:S17 and U16:AB17 are dashes, so these formats are not available. */
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

  // Keep comma grouping for IDR (for example, IDR 2,099,000).
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
