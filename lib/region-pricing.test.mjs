import assert from 'node:assert/strict'
import test from 'node:test'
import { products, getProductStrengths, getProductVariants } from './products.ts'
import { REGIONS, getRegion } from './regions.ts'
import {
  REGIONAL_PRODUCT_PRICES, INDONESIAN_PRODUCT_PRICES, REGIONAL_PRICES,
  getRegionalPriceAmount, getRegionalPriceStatus, getRegionalPriceLabel,
  getCatalogPriceVariant, isRegionalVariantSelectable, formatRegionPrice,
} from './region-pricing.ts'
import { snapshot, priceCases, expectedLabel } from './fixtures/pricing-v2-cases.mjs'

const variants = ['basic', 'cartridge', 'pen']

test('all 399 slots match source cells plus the single owner override', () => {
  assert.equal(snapshot.sheet, 'idr pricing v2')
  assert.deepEqual(snapshot.priceColumns.id, ['I', 'R', 'AA'])
  assert.equal(priceCases.length, 19)
  assert.equal(REGIONS.length, 7)
  let numericPrices = 0
  for (const region of REGIONS) {
    assert.deepEqual(Object.keys(REGIONAL_PRODUCT_PRICES[region.id]).sort(), priceCases.map((item) => item.priceKey).sort())
    assert.deepEqual(getProductVariants(region.id).map((variant) => variant.id), variants)
    assert.deepEqual(REGIONAL_PRICES[region.id], { cartridge: null, pen: null })
    for (const item of priceCases) {
      for (const [index, variant] of variants.entries()) {
        const amount = item.prices[region.id][index]
        const cell = snapshot.priceColumns[region.id][index] + item.row
        assert.equal(getRegionalPriceAmount(region.id, item.priceKey, variant), amount, cell + ': ' + item.priceKey + '/' + region.id)
        assert.equal(getRegionalPriceLabel(region, item.priceKey, variant).replaceAll('\u00a0', ' '), expectedLabel(region, item, index), cell)
        if (amount !== null) {
          assert.ok(Number.isSafeInteger(amount) && amount > 0, cell)
          numericPrices++
        } else assert.equal(formatRegionPrice(region, item.priceKey, variant), null)
      }
    }
  }
  assert.equal(numericPrices, 350)
  assert.equal(INDONESIAN_PRODUCT_PRICES, REGIONAL_PRODUCT_PRICES.id)
})

test('IDR uses the final after-discount values without subtracting a voucher twice', () => {
  const expected = [
    [1599000,1099000,2799000], [1372000,1572000,2572000], [1492800,1692800,2692800],
    [null,1051000,2051000], [1078000,1278000,2278000], [1162000,1362000,2362000],
    [1330000,1530000,2530000], [1800000,2000000,3000000], [1098000,1298000,2298000],
    [1176000,1376000,2376000], [1162000,null,null], [1162000,null,null],
    [1162000,1362000,2362000], [1590000,1790000,2790000], [400000,600000,1600000],
    [1162000,1362000,2362000], [null,1230400,2230400], [null,1299000,2299000],
    [889000,1099000,2099000],
  ]
  for (const [index, item] of priceCases.entries()) {
    assert.deepEqual(variants.map((variant) => getRegionalPriceAmount('id', item.priceKey, variant)), expected[index], item.priceKey)
  }
})

test('every catalog product and selectable strength has exactly one matching source row', () => {
  const keys = products.flatMap((product) => {
    const strengths = getProductStrengths(product)
    return strengths.length ? strengths.map((strength) => strength.priceKey) : [product.slug]
  })
  assert.deepEqual(keys.sort(), priceCases.map((item) => item.priceKey).sort())
  for (const item of priceCases.filter((item) => item.strengthId)) {
    const product = products.find((product) => product.slug === item.productSlug)
    const strength = getProductStrengths(product).find((strength) => strength.id === item.strengthId)
    assert.equal(strength.priceKey, item.priceKey)
    assert.equal(strength.mg + ' mg', item.strength)
  }
})

test('unpriced and unavailable formats preserve source status without numeric fallbacks', () => {
  for (const region of REGIONS) {
    for (const item of priceCases) {
      for (const [index, variant] of variants.entries()) {
        const unavailable = index > 0 && ['semax', 'selank'].includes(item.productSlug)
        const outOfStock = region.id === 'id' && index === 0 && [9,22,23].includes(item.row)
        const status = unavailable ? 'unavailable' : outOfStock ? 'out-of-stock'
          : item.prices[region.id][index] === null ? 'inquiry' : 'available'
        assert.equal(getRegionalPriceStatus(region.id, item.priceKey, variant), status)
        assert.equal(isRegionalVariantSelectable(region.id, item.priceKey, variant), status === 'available' || status === 'inquiry')
      }
      const cheapest=item.prices[region.id].flatMap((price,index)=>price===null?[]:[{price,index}]).sort((a,b)=>a.price-b.price)[0]
      assert.equal(getCatalogPriceVariant(region.id, item.priceKey), variants[cheapest.index])
    }
  }
})

test('unknown keys and formats never inherit a price', () => {
  const invalid = [undefined, null, '', 'unknown', '__proto__', 'constructor', 'toString', 'hasOwnProperty']
  for (const region of REGIONS) {
    for (const key of [...invalid, 'retatrutide-20mg']) {
      for (const variant of variants) assert.equal(getRegionalPriceAmount(region.id, key, variant), null)
    }
    for (const variant of invalid) assert.equal(getRegionalPriceAmount(region.id, 'retatrutide', variant), null)
  }
  for (const region of invalid) assert.equal(getRegionalPriceAmount(region, 'retatrutide', 'basic'), null)
  assert.equal(getRegionalPriceLabel(getRegion('id'), 'unknown', 'basic'), 'Tanya harga IDR')
})
