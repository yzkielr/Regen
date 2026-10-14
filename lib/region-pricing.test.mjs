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

test('all 399 product/strength, region and package slots match normal-price source cells', () => {
  assert.equal(snapshot.sheet, 'idr pricing v2')
  assert.deepEqual(snapshot.normalPriceColumns.id, ['J', 'S', 'AB'])
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
        const cell = snapshot.normalPriceColumns[region.id][index] + item.row
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

test('IDR matches the normal prices independently read from the supplied screenshot', () => {
  const expected = [
    [2099000,2799000,3799000], [1872000,2572000,3572000], [1992800,2692800,3692800],
    [null,2051000,3051000], [1578000,2278000,3278000], [1662000,2362000,3362000],
    [1830000,2530000,3530000], [2300000,3000000,4000000], [1598000,2298000,3298000],
    [1676000,2376000,3376000], [1662000,null,null], [1662000,null,null],
    [1662000,2362000,3362000], [2090000,2790000,3790000], [900000,1600000,2600000],
    [1662000,2362000,3362000], [null,2230400,3230400], [null,2299000,3299000],
    [1389000,2099000,3099000],
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
      assert.equal(getCatalogPriceVariant(region.id, item.priceKey), variants[item.prices[region.id].findIndex((price) => price !== null)])
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
