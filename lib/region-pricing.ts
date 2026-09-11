import type { VariantId } from './products'
import type { Region, RegionId } from './regions'

type ProductPriceTable = Readonly<Record<string, Readonly<Record<VariantId, number | null>>>>

/** Published prices from the supplied "regen pricing web.xlsx", tab "idr pricing".
 * Each amount is taken directly from its currency/package cell.
 * No exchange-rate conversion or flat per-region price is used.
 * Rows 5, 6, 9, 10, 12, 13, 14 and 17 match the eight existing catalog products
 * and strengths. Other strengths and coming-soon products are not included.
 * Basic, Cartridge and Pen packages are available in every region, with
 * each region using the corresponding published currency column.
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
  const price = formatRegionPrice(region, productSlug, variant)
  if (price !== null) return price
  if (region.language === 'ms') return `Tanya harga ${region.currency}`
  if (region.language === 'id') return `Tanya harga ${region.currency}`
  return `Request ${region.currency} pricing`
}
