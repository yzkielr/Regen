import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import * as productData from './products.ts'
import * as pricing from './region-pricing.ts'
import { REGIONS, getRegion, regionPath } from './regions.ts'
import { priceCases, expectedLabel } from './fixtures/pricing-v2-cases.mjs'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const jsxRuntime = require('react/jsx-runtime')
const variants = ['basic', 'cartridge', 'pen']
const compile = (file) => ts.transpileModule(readFileSync(new URL('../components/' + file + '.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText
const cardSource = compile('product-card')
const detailSource = compile('product-detail')
const productCopy = load(ts.transpileModule(readFileSync(new URL('./product-copy.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, { './products': productData })

function load(source, dependencies) {
  const module = { exports: {} }
  vm.runInNewContext(source, { module, exports: module.exports, Intl, require(id) {
    if (!Object.hasOwn(dependencies, id)) throw new Error('Unexpected dependency: ' + id)
    return dependencies[id]
  } })
  return module.exports
}
function nodes(node) {
  if (node == null || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(nodes)
  return [node, ...nodes(node.props?.children)]
}
function text(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node !== 'object') return String(node)
  if (Array.isArray(node)) return node.map(text).join('')
  return text(node.props?.children)
}
const normalize = (node) => text(node).replace(/\s+/g, ' ').trim()
const children = (node) => [node.props?.children].flat(Infinity).filter(Boolean)
function priceAndUnit(tree) {
  const blocks = nodes(tree).filter((node) => node.type === 'div' &&
    children(node).some((child) => child.type === 'span' && normalize(child).startsWith('/ ')))
  assert.equal(blocks.length, 1)
  const spans = children(blocks[0]).filter((node) => node.type === 'span')
  return { price: normalize(spans[0]), unit: normalize(spans[1]) }
}
function fieldset(tree, legend) {
  const matches = nodes(tree).filter((node) => node.type === 'fieldset' &&
    children(node).some((child) => child.type === 'legend' && normalize(child) === legend))
  assert.equal(matches.length, 1, legend)
  return matches[0]
}
function packageButtons(tree, region) {
  return nodes(fieldset(tree, productCopy.catalogCopy[region.language].selectFormat)).filter((node) => node.type === 'button')
}
function harness(regionId) {
  let region = getRegion(regionId)
  const state = []
  let cursor = 0
  const dependencies = {
    'react/jsx-runtime': jsxRuntime,
    react: { useState(initial) {
      const index = cursor++
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial
      return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value }]
    } },
    '@/components/product-image': { ProductImage: 'ProductImage' },
    'next/link': 'RegionalLink',
    'lucide-react': { ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', FlaskConical: 'FlaskConical', FileCheck2: 'FileCheck2', Truck: 'Truck', Headset: 'Headset', MessageCircle: 'MessageCircle' },
    '@/components/consultation-button': { ConsultationButton: 'ConsultationButton' },
    '@/components/region-provider': { useRegion: () => ({ region, language: region.language, href: (path) => regionPath(region.id, path) }) },
    '@/lib/products': productData, '@/lib/product-copy': productCopy, '@/lib/region-pricing': pricing,
  }
  const { ProductCard } = load(cardSource, dependencies)
  const { ProductDetail } = load(detailSource, dependencies)
  return {
    get region() { return region },
    setRegion(id) { region = getRegion(id) },
    card(product) { return ProductCard({ product }) },
    detail(product) { cursor = 0; return ProductDetail({ product }) },
  }
}
function selectStrength(h, product, item) {
  let tree = h.detail(product)
  if (item.strengthId) {
    const copy = productCopy.catalogCopy[h.region.language]
    const button = nodes(fieldset(tree, copy.selectStrength)).find((node) =>
      node.type === 'button' && normalize(node).replaceAll(' ', '') === item.strengthId)
    assert.ok(button, item.priceKey)
    button.props.onClick()
    tree = h.detail(product)
  }
  return tree
}
function assertPrimary(tree, region, item, index) {
  const copy = productCopy.catalogCopy[region.language]
  assert.deepEqual(priceAndUnit(tree), { price: expectedLabel(region, item, index), unit: '/ ' + copy.variants[variants[index]].label.toLowerCase() })
  assert.doesNotMatch(normalize(tree), /voucher|after discount|#VALUE!|\bNaN\b|\bFDA\b|EGRIFTA/i)
  const h1 = nodes(tree).find((node) => node.type === 'h1')
  const inquiry = nodes(tree).find((node) => node.type === 'ConsultationButton')
  assert.equal(inquiry.props.productName, normalize(h1) + ' — ' + copy.variants[variants[index]].label)
}

test('all 112 catalog/recommendation cards show the lowest priced package in the selected currency', () => {
  assert.equal(productData.products.length, 16)
  for (const region of REGIONS) {
    const h = harness(region.id)
    const copy = productCopy.catalogCopy[region.language]
    for (const product of productData.products) {
      const item = priceCases.find((item) => item.priceKey === product.slug)
      const index = item.prices[region.id].flatMap((amount,index)=>amount===null?[]:[{amount,index}]).sort((a,b)=>a.amount-b.amount)[0].index
      const card = h.card(product)
      assert.equal(card.props.href, '/' + region.id + '/product/' + product.slug)
      assert.deepEqual(priceAndUnit(card), {
        price: copy.startingPrice + ' ' + expectedLabel(region, item, index),
        unit: '/ ' + copy.variants[variants[index]].label.toLowerCase(),
      }, region.id + '/' + product.slug)
      assert.doesNotMatch(normalize(card), /voucher|after discount|#VALUE!|\bNaN\b|\bFDA\b/i)
    }
  }
})

test('all 399 detail package buttons and every selectable price match the workbook after strength selection', () => {
  let checked = 0
  for (const region of REGIONS) {
    for (const item of priceCases) {
      const product = productData.products.find((product) => product.slug === item.productSlug)
      const h = harness(region.id)
      let tree = selectStrength(h, product, item)
      const expectedName = item.strengthId
        ? productData.getProductStrengths(product).find((strength) => strength.id === item.strengthId).name
        : product.name
      assert.equal(normalize(nodes(tree).find((node) => node.type === 'h1')), expectedName)
      for (let index = 0; index < 3; index++) {
        const buttons = packageButtons(tree, region)
        assert.equal(buttons.length, 3)
        const button = buttons[index]
        const spans = children(button)
        assert.equal(normalize(spans[1]), expectedLabel(region, item, index), region.id + '/' + item.priceKey + '/' + variants[index])
        const disabled = (index > 0 && ['semax', 'selank'].includes(item.productSlug)) ||
          (region.id === 'id' && index === 0 && [9,22,23].includes(item.row))
        assert.equal(button.props.disabled, disabled)
        const before = priceAndUnit(tree)
        button.props.onClick()
        tree = h.detail(product)
        if (disabled) assert.deepEqual(priceAndUnit(tree), before)
        else assertPrimary(tree, region, item, index)
        checked++
      }
    }
  }
  assert.equal(checked, 399)
})

test('package photos select the same published price and cannot select a sold-out package', () => {
  for (const item of priceCases) {
    const product = productData.products.find((product) => product.slug === item.productSlug)
    const h = harness('id')
    let tree = selectStrength(h, product, item)
    for (const [photoIndex, variantIndex] of [1,2,0].entries()) {
      const photos = nodes(tree).filter((node) => node.type === 'button' && node.props['aria-label'])
      assert.equal(photos.length, 4)
      const button = photos[photoIndex]
      const before = priceAndUnit(tree)
      button.props.onClick()
      tree = h.detail(product)
      if (button.props.disabled) assert.deepEqual(priceAndUnit(tree), before)
      else assertPrimary(tree, h.region, item, variantIndex)
    }
  }
})

test('switching region preserves strength and applies IDR discounts or the foreign currency price', () => {
  for (const item of priceCases) {
    const product = productData.products.find((product) => product.slug === item.productSlug)
    const h = harness('id')
    let tree = selectStrength(h, product, item)
    const index = ['semax','selank'].includes(item.productSlug) ? 0 : 2
    packageButtons(tree, h.region)[index].props.onClick()
    for (const region of REGIONS) {
      h.setRegion(region.id)
      tree = h.detail(product)
      assertPrimary(tree, region, item, index)
    }
  }
})

test('unknown product pricing stays an inquiry without a starting-price claim', () => {
  for (const region of REGIONS) {
    const h = harness(region.id)
    const product = { ...productData.products[0], slug: 'unpriced-test' }
    const card = h.card(product)
    const expected = region.language === 'en' ? 'Request ' + region.currency + ' pricing' : 'Tanya harga ' + region.currency
    assert.equal(priceAndUnit(card).price, expected)
    let tree = h.detail(product)
    for (let i = 0; i < 3; i++) {
      packageButtons(tree, region)[i].props.onClick()
      tree = h.detail(product)
      assert.equal(priceAndUnit(tree).price, expected)
    }
  }
})
