import { readFileSync } from 'node:fs'

// Expectations come from the live Sheet snapshot, not the production table.
export const snapshot = JSON.parse(readFileSync(new URL('./pricing-v2-after-discount.json', import.meta.url), 'utf8'))
const productsByRow = [
  ['retatrutide', '10mg'], ['tesamorelin', '10mg'], ['tesamorelin', '20mg'],
  ['ghk-cu', '50mg'], ['ghk-cu', '100mg'], ['nad-plus', '500mg'], ['nad-plus', '1000mg'],
  ['klow80', null], ['cjc-1295-ipamorelin', null], ['mots-c', '10mg'], ['semax', null],
  ['selank', null], ['bpc-157', '10mg'], ['hgh-191-aa-36iu', null], ['glutathione', null],
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

// Owner supplied these additional IDR strengths on 12 November 2026.
// Foreign prices are added from the independently verified snapshot below.
for (const [mg, cartridge, pen] of [[20, 1799000, 3499000], [60, 3999000, 4999000]]) {
  priceCases.push({
    row: `owner-2026-11-12-${mg}mg`, product: 'Retatrutide', strength: `${mg} mg`,
    productSlug: 'retatrutide', strengthId: `${mg}mg`, priceKey: `retatrutide-${mg}mg`,
    unavailableFormats: ['basic'],
    prices: { au: [null,null,null], eu: [null,null,null], us: [null,null,null], uk: [null,null,null], sg: [null,null,null], my: [null,null,null], id: [null,cartridge,pen] },
  })
}

export const motsSnapshot = JSON.parse(readFileSync(new URL('./mots-c-pricing-20261112.json', import.meta.url), 'utf8'))
for (const row of motsSnapshot.rows.filter((row) => row.row !== 15)) {
  const strengthId = row.strength.replaceAll(' ', '')
  priceCases.push({
    ...row, productSlug: 'mots-c', strengthId, priceKey: `mots-c-${strengthId}`,
    prices: { au: [null,null,null], eu: [null,null,null], us: [null,null,null], uk: [null,null,null], sg: [null,null,null], my: [null,null,null], id: row.prices },
  })
}

export const bpcBlendSnapshot = JSON.parse(readFileSync(new URL('./bpc-tb500-pricing-20261112.json', import.meta.url), 'utf8'))
priceCases.push({
  ...bpcBlendSnapshot, productSlug: 'bpc-157', strengthId: 'tb-500', priceKey: 'bpc-157-tb-500',
  prices: { au: [null,null,null], eu: [null,null,null], us: [null,null,null], uk: [null,null,null], sg: [null,null,null], my: [null,null,null], id: bpcBlendSnapshot.prices },
})

// Verified live Sheet rows 25-29, 13 November 2026: round foreign prices UP to tens.
export const regionalSnapshot = JSON.parse(readFileSync(new URL('./regional-pricing-20261113.json', import.meta.url), 'utf8'))
for (const row of regionalSnapshot.rows) {
  const item = priceCases.find((item) => item.priceKey === row.priceKey)
  item.prices = { ...row.prices, id: item.prices.id }
}

// Verified Sheet row 20; only Basic/Cartridge changed, Pen preserved.
const glutaSnapshot = JSON.parse(readFileSync(new URL('./glutathione-pricing-20261118.json', import.meta.url), 'utf8'))
priceCases.find(row => row.priceKey === 'glutathione').prices = glutaSnapshot.prices

export function expectedLabel(region, product, variantIndex) {
  const amount = product.prices[region.id][variantIndex]
  if (amount !== null) {
    return new Intl.NumberFormat(region.currency === 'IDR' ? 'en-US' : region.locale, {
      style: 'currency', currency: region.currency, currencyDisplay: 'code',
      minimumFractionDigits: 0, maximumFractionDigits: region.currency === 'IDR' ? 0 : 2,
    }).format(amount).replaceAll('\u00a0', ' ')
  }
  if ((variantIndex > 0 && ['semax', 'selank'].includes(product.productSlug)) || product.unavailableFormats?.includes(['basic', 'cartridge', 'pen'][variantIndex])) {
    return region.language === 'en' ? 'Format unavailable' : 'Format tidak tersedia'
  }
  if (region.id === 'id' && variantIndex === 0 && [9, 22, 23].includes(product.row)) return 'Stok habis'
  return region.language === 'en' ? `Request ${region.currency} pricing` : `Tanya harga ${region.currency}`
}
