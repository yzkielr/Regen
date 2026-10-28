import { readFileSync } from 'node:fs'

// Expectations come from the live Sheet snapshot, not the production table.
export const snapshot = JSON.parse(readFileSync(new URL('./pricing-v2-after-discount.json', import.meta.url), 'utf8'))
const productsByRow = [
  ['retatrutide', null], ['tesamorelin', '10mg'], ['tesamorelin', '20mg'],
  ['ghk-cu', '50mg'], ['ghk-cu', '100mg'], ['nad-plus', '500mg'], ['nad-plus', '1000mg'],
  ['klow80', null], ['cjc-1295-ipamorelin', null], ['mots-c', null], ['semax', null],
  ['selank', null], ['bpc-157', null], ['hgh-191-aa-36iu', null], ['glutathione', null],
  ['tirzepatide', null], ['semaglutide', null], ['cagrilintide', null], ['5-amino-1mq', null],
]
const extraStrengthKeys = { 8: 'tesamorelin-20mg', 9: 'ghk-cu-50mg', 12: 'nad-plus-1000mg' }
export const priceCases = snapshot.rows.map((row, index) => ({
  ...row,
  // Owner override dated 26 October 2026; retain the original Sheet snapshot.
  prices: row.row === 6 ? { ...row.prices, id: [1599000, 1099000, 2799000] } : row.prices,
  productSlug: productsByRow[index][0],
  strengthId: productsByRow[index][1],
  priceKey: extraStrengthKeys[row.row] ?? productsByRow[index][0],
}))

export function expectedLabel(region, product, variantIndex) {
  const amount = product.prices[region.id][variantIndex]
  if (amount !== null) {
    return new Intl.NumberFormat(region.currency === 'IDR' ? 'en-US' : region.locale, {
      style: 'currency', currency: region.currency, currencyDisplay: 'code',
      minimumFractionDigits: 0, maximumFractionDigits: region.currency === 'IDR' ? 0 : 2,
    }).format(amount).replaceAll('\u00a0', ' ')
  }
  if (variantIndex > 0 && ['semax', 'selank'].includes(product.productSlug)) {
    return region.language === 'en' ? 'Format unavailable' : 'Format tidak tersedia'
  }
  if (region.id === 'id' && variantIndex === 0 && [9, 22, 23].includes(product.row)) return 'Stok habis'
  return region.language === 'en' ? `Request ${region.currency} pricing` : `Tanya harga ${region.currency}`
}
