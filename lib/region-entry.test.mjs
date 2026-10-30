import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import * as regions from './regions.ts'
import * as detection from './region-detection.ts'
import * as siteSeo from './site-seo.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const source = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText

// Exercise the real root route and real mapping helpers. Framework request
// accessors, redirects and the JSX boundary are substituted so no server,
// browser, environment mutation or network request is needed.
async function enterRoot({ savedRegion, country = null, vercel, dismissed } = {}) {
  const events = []
  const suggestions = []
  const redirectSignal = Symbol('redirect')
  const result = { events, suggestions, redirect: null, element: null, dynamic: null }
  const cookies = new Map([
    [regions.REGION_COOKIE, savedRegion],
    [detection.REGION_SUGGESTION_DISMISSED_COOKIE, dismissed],
  ])
  const RegionLanding = () => null
  const rootModule = { exports: {} }
  const dependencies = {
    'next/headers': {
      cookies: async () => {
        events.push('cookies')
        return {
          get: (key) => {
            events.push(`cookie:${key}`)
            const value = cookies.get(key)
            return value === undefined ? undefined : { value }
          },
        }
      },
      headers: async () => {
        events.push('headers')
        return {
          get: (key) => {
            events.push(`header:${key}`)
            return key === detection.COUNTRY_HEADER ? country : null
          },
        }
      },
    },
    'next/navigation': {
      redirect: (url) => {
        result.redirect = url
        events.push(`redirect:${url}`)
        throw redirectSignal
      },
    },
    '@/components/region-landing': { RegionLanding },
    '@/lib/regions': regions,
    '@/lib/site-seo': siteSeo,
    '@/lib/region-detection': {
      ...detection,
      suggestedRegion: (options) => {
        suggestions.push({ ...options })
        return detection.suggestedRegion(options)
      },
    },
    'react/jsx-runtime': {
      jsx: (type, props) => ({ type, props }),
    },
  }
  vm.runInNewContext(compiled, {
    exports: rootModule.exports,
    module: rootModule,
    process: { env: { VERCEL: vercel } },
    require: (id) => {
      if (!Object.hasOwn(dependencies, id)) throw new Error(`Unexpected root-route dependency: ${id}`)
      return dependencies[id]
    },
  })
  result.dynamic = rootModule.exports.dynamic
  try {
    result.element = await rootModule.exports.default()
    assert.equal(result.element.type, RegionLanding)
  } catch (error) {
    if (error !== redirectSignal) throw error
  }
  return result
}

test('root entry is dynamic so one visitor cannot receive another visitor\'s country suggestion', async () => {
  const result = await enterRoot()
  assert.equal(result.dynamic, 'force-dynamic')
})

test('valid saved regions redirect before reading country headers or computing suggestions', async () => {
  for (const region of regions.REGIONS) {
    for (const dismissed of [undefined, '1']) {
      const result = await enterRoot({ savedRegion: region.id, country: 'MY', vercel: '1', dismissed })
      assert.equal(result.redirect, `/${region.id}`)
      assert.equal(result.element, null)
      assert.deepEqual(result.suggestions, [])
      assert.deepEqual(result.events, ['cookies', `cookie:${regions.REGION_COOKIE}`, `redirect:/${region.id}`])
    }
  }
})

test('first visits can receive all seven Vercel country suggestions without an automatic redirect', async () => {
  const countries = { AU: 'au', DE: 'eu', US: 'us', GB: 'uk', SG: 'sg', MY: 'my', ID: 'id' }
  for (const [country, expectedRegion] of Object.entries(countries)) {
    const result = await enterRoot({ country, vercel: '1' })
    assert.equal(result.redirect, null)
    assert.equal(result.element.props.suggestedRegionId, expectedRegion)
    assert.deepEqual(result.suggestions, [{ country, isVercel: true, dismissed: false }])
    assert.ok(result.events.indexOf(`cookie:${regions.REGION_COOKIE}`) < result.events.indexOf('headers'))
  }
})

test('local and non-Vercel environments ignore even a supported incoming country header', async () => {
  for (const vercel of [undefined, '', '0', 'true', 'preview']) {
    const result = await enterRoot({ country: 'MY', vercel })
    assert.equal(result.redirect, null)
    assert.equal(result.element.props.suggestedRegionId, null)
    assert.equal(result.suggestions[0].isVercel, false)
  }
})

test('a dismissed suggestion leaves the ordinary chooser available on Vercel', async () => {
  for (const country of ['AU', 'FR', 'US', 'GB', 'SG', 'MY', 'ID']) {
    const result = await enterRoot({ country, vercel: '1', dismissed: '1' })
    assert.equal(result.redirect, null)
    assert.equal(result.element.props.suggestedRegionId, null)
    assert.equal(result.suggestions[0].dismissed, true)
  }
})

test('missing, unsupported and malformed country hints yield the chooser without a suggestion', async () => {
  for (const country of [null, '', 'XX', 'localhost', '127.0.0.1', 'CH', 'NO', 'CA', 'NZ', 'MY,SG']) {
    const result = await enterRoot({ country, vercel: '1' })
    assert.equal(result.redirect, null)
    assert.equal(result.element.props.suggestedRegionId, null)
  }
})

test('invalid saved cookies never create redirect targets and do not block valid suggestions', async () => {
  for (const savedRegion of ['', 'unknown', 'MY', 'eu ', '/id', '../id', 'https://example.com', '__proto__']) {
    const local = await enterRoot({ savedRegion, country: 'MY' })
    assert.equal(local.redirect, null)
    assert.equal(local.element.props.suggestedRegionId, null)

    const hosted = await enterRoot({ savedRegion, country: 'MY', vercel: '1' })
    assert.equal(hosted.redirect, null)
    assert.equal(hosted.element.props.suggestedRegionId, 'my')
  }
})

test('only the explicit dismissal marker suppresses a valid suggestion', async () => {
  for (const dismissed of [undefined, '', '0', 'true', 'unknown']) {
    const result = await enterRoot({ country: 'ID', vercel: '1', dismissed })
    assert.equal(result.redirect, null)
    assert.equal(result.element.props.suggestedRegionId, 'id')
    assert.equal(result.suggestions[0].dismissed, false)
  }
})
