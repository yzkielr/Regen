import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import { REGIONS } from './regions.ts'
import { products } from './products.ts'
import { SITE_URL, SITE_NAME, SITE_IDENTITY } from './site-seo.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const cache = new Map()
function load(file) {
  if (cache.has(file)) return cache.get(file)
  const source = readFileSync(new URL('../' + file, import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(compiled, { module, exports: module.exports, URL, require(id) {
    assert.ok(id.startsWith('@/lib/'), 'Unexpected dependency: ' + id)
    return load(id.slice(2) + '.ts')
  } })
  cache.set(file, module.exports)
  return module.exports
}

test('sitemap discovers every public catalog URL and excludes unlisted or private pages', () => {
  const entries = load('app/sitemap.ts').default()
  const urls = new Set(entries.map(entry => entry.url))
  assert.equal(entries.length, 1 + REGIONS.length * (1 + products.length))
  assert.equal(urls.size, entries.length)
  assert.ok(urls.has(SITE_URL + '/'))
  for (const region of REGIONS) {
    assert.ok(urls.has(`${SITE_URL}/${region.id}`))
    for (const product of products) assert.ok(urls.has(`${SITE_URL}/${region.id}/product/${product.slug}`))
  }
  for (const entry of entries) {
    assert.equal(new URL(entry.url).origin, SITE_URL)
    assert.doesNotMatch(entry.url, /\/(coa|verify|admin|api|privacy-policy)(\/|$)/)
    assert.equal(new URL(entry.url).search, '')
    assert.equal(entry.lastModified, undefined, 'Do not claim a new edit date on every build')
  }
  assert.equal(load('app/robots.ts').default().sitemap, SITE_URL + '/sitemap.xml')
})

test('language alternatives are reciprocal and product fallbacks retain the same product', () => {
  const entries = load('app/sitemap.ts').default()
  const byUrl = new Map(entries.map(entry => [entry.url, entry]))
  const { regionAlternates, regionMetadata } = load('lib/region-metadata.ts')
  for (const entry of entries) {
    assert.equal(Object.keys(entry.alternates.languages).length, 8)
    for (const target of Object.values(entry.alternates.languages)) {
      assert.ok(byUrl.has(target), target)
      assert.deepEqual(byUrl.get(target).alternates.languages, entry.alternates.languages)
      const product = entry.url.split('/product/')[1]
      if (product) assert.equal(target.split('/product/')[1], product)
    }
  }
  for (const region of REGIONS) {
    assert.equal(regionMetadata(region).title, `${SITE_NAME} | ${region.name}`)
    assert.equal(regionMetadata(region).openGraph.siteName, SITE_NAME)
    assert.equal(regionAlternates(region).canonical, '/' + region.id)
  }
  const website = SITE_IDENTITY['@graph'].find(node => node['@type'] === 'WebSite')
  const organization = SITE_IDENTITY['@graph'].find(node => node['@type'] === 'Organization')
  assert.equal(website.name, SITE_NAME)
  assert.equal(website.url, SITE_URL + '/')
  assert.equal(website.publisher['@id'], organization['@id'])
})
