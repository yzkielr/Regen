import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_REGION,
  REGIONS,
  REGION_IDS,
  getRegion,
  getRegionFromPath,
  isRegionId,
  regionPath,
  switchRegionPath,
} from './regions.ts'

test('the seven requested markets have the correct currency, language and locale', () => {
  const expected = {
    au: ['AUD', 'en', 'en-AU'],
    eu: ['EUR', 'en', 'en-IE'],
    us: ['USD', 'en', 'en-US'],
    uk: ['GBP', 'en', 'en-GB'],
    sg: ['SGD', 'en', 'en-SG'],
    my: ['MYR', 'ms', 'ms-MY'],
    id: ['IDR', 'id', 'id-ID'],
  }
  assert.equal(REGIONS.length, 7)
  assert.equal(new Set(REGION_IDS).size, 7)
  assert.deepEqual([...REGION_IDS].sort(), Object.keys(expected).sort())
  for (const [id, settings] of Object.entries(expected)) {
    const region = getRegion(id)
    assert.equal(isRegionId(id), true)
    assert.deepEqual([region.currency, region.language, region.locale], settings)
    assert.ok(region.name.length > 0)
    assert.ok(region.nativeName.length > 0)
  }
  assert.equal(DEFAULT_REGION, 'eu')
})

test('invalid IDs are rejected without coercion or fallback to a market', () => {
  for (const value of ['', 'AU', 'MY', 'gb', 'usa', 'unknown', '../my', '/my', 'my?x=1', null, undefined, 1, {}, ['my']]) {
    assert.equal(isRegionId(value), false)
    assert.equal(getRegion(value), undefined)
  }
})

test('direct paths select their own market and unrelated or invalid routes do not', () => {
  for (const id of REGION_IDS) {
    for (const pathname of [`/${id}`, `/${id}/`, `/${id}/product/retatrutide`]) {
      assert.equal(getRegionFromPath(pathname)?.id, id)
    }
  }
  for (const pathname of ['/', '/product/retatrutide', '/api/contact', '/products/retatrutide.jpeg', '/verify/example', '/missing', '/AU', '/australia', '/myanmar']) {
    assert.equal(getRegionFromPath(pathname), undefined)
  }
})

test('regional home, anchor, query and product links stay on the chosen market', () => {
  for (const id of REGION_IDS) {
    assert.equal(regionPath(id), `/${id}`)
    assert.equal(regionPath(id, ''), `/${id}`)
    assert.equal(regionPath(id, '/'), `/${id}`)
    assert.equal(regionPath(id, '#katalog'), `/${id}#katalog`)
    assert.equal(regionPath(id, '#format'), `/${id}#format`)
    assert.equal(regionPath(id, '?source=catalog'), `/${id}?source=catalog`)
    assert.equal(regionPath(id, '/product/retatrutide'), `/${id}/product/retatrutide`)
    assert.equal(regionPath(id, 'product/retatrutide'), `/${id}/product/retatrutide`)
  }
})

test('switching region preserves the product and supports legacy product URLs', () => {
  for (const source of REGION_IDS) {
    for (const target of REGION_IDS) {
      assert.equal(switchRegionPath(`/${source}`, target), `/${target}`)
      assert.equal(switchRegionPath(`/${source}/`, target), `/${target}`)
      assert.equal(switchRegionPath(`/${source}/about`, target), `/${target}/about`)
      assert.equal(switchRegionPath(`/${source}/about/`, target), `/${target}/about`)
      assert.equal(switchRegionPath(`/${source}/product/cjc-1295-ipamorelin`, target), `/${target}/product/cjc-1295-ipamorelin`)
      assert.equal(switchRegionPath(`/${source}/product/retatrutide/`, target), `/${target}/product/retatrutide/`)
    }
  }
  assert.equal(switchRegionPath('/product/retatrutide', 'my'), '/my/product/retatrutide')
  assert.equal(switchRegionPath('/', 'id'), '/id')
})

test('unsupported routes fall back to the new regional home, not prefixed resources', () => {
  const unsupported = [
    '/verify/example',
    '/api/contact',
    '/products/retatrutide.jpeg',
    '/icon.svg',
    '/my/verify/example',
    '/my/product',
    '/my/product/retatrutide/extra',
    '/my/unknown',
    '/zz/product/retatrutide',
  ]
  for (const target of REGION_IDS) {
    for (const pathname of unsupported) {
      assert.equal(switchRegionPath(pathname, target), `/${target}`)
    }
  }
})
