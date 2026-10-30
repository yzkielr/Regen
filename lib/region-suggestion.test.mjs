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
const jsxRuntime = require('react/jsx-runtime')

// Execute the actual TSX components and their click handlers without a browser
// or extra test dependencies. React state and browser side effects are small
// controlled doubles; card dimensions below test the actual class contract,
// not pixel geometry (which is covered by browser QA).
function compileComponent(path) {
  return ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText
}

const suggestionSource = compileComponent('../components/region-suggestion.tsx')
const landingSource = compileComponent('../components/region-landing.tsx')

function loadComponent(source, dependencies, globals = {}) {
  const componentModule = { exports: {} }
  vm.runInNewContext(source, {
    module: componentModule,
    exports: componentModule.exports,
    require(id) {
      if (Object.hasOwn(dependencies, id)) return dependencies[id]
      throw new Error(`Unexpected component dependency: ${id}`)
    },
    ...globals,
  })
  return componentModule.exports
}

const sharedDependencies = {
  'react/jsx-runtime': jsxRuntime,
  'next/link': 'RegionalLink',
  'lucide-react': { ArrowUpRight: 'ArrowUpRight', Globe2: 'Globe2' },
  '@/lib/regions': regions,
  '@/lib/site-seo': siteSeo,
}

function descendants(node) {
  if (node == null || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(descendants)
  return [node, ...descendants(node.props?.children)]
}

function createSuggestionHarness({ protocol = 'https:', focusTargetExists = true } = {}) {
  const savedRegions = []
  const cookieWrites = []
  const focusCalls = []
  const navigations = []
  const state = []
  let stateIndex = 0
  const location = {
    protocol,
    assign: (url) => navigations.push(url),
    replace: (url) => navigations.push(url),
    set href(url) { navigations.push(url) },
  }

  const { RegionSuggestion } = loadComponent(suggestionSource, {
    ...sharedDependencies,
    react: {
      useState(initial) {
        const index = stateIndex++
        if (!(index in state)) state[index] = initial
        return [state[index], (value) => { state[index] = value }]
      },
    },
    '@/components/region-provider': { rememberRegion: (id) => savedRegions.push(id) },
    '@/lib/region-detection': detection,
  }, {
    window: { location },
    document: {
      set cookie(value) { cookieWrites.push(value) },
      getElementById(id) {
        return focusTargetExists ? {
          focus: (options) => focusCalls.push({ id, preventScroll: options.preventScroll }),
        } : null
      },
    },
  })

  return {
    savedRegions,
    cookieWrites,
    focusCalls,
    navigations,
    render(suggestedRegionId) {
      stateIndex = 0
      return RegionSuggestion({ suggestedRegionId, focusTargetId: 'choose-region-title' })
    },
  }
}

function acceptLink(tree) {
  return descendants(tree).find((node) => node.type === 'RegionalLink')
}

function dismissButton(tree) {
  return descendants(tree).find((node) => node.type === 'button')
}

test('null, missing and invalid hints render nothing without saving or redirecting', () => {
  for (const hint of [null, undefined, '', 'zz', 'ID', '../id', 'Indonesia', 1, {}, ['id']]) {
    const harness = createSuggestionHarness()
    assert.equal(harness.render(hint), null, String(hint))
    assert.deepEqual(harness.savedRegions, [])
    assert.deepEqual(harness.cookieWrites, [])
    assert.deepEqual(harness.navigations, [])
    assert.deepEqual(harness.focusCalls, [])
  }
})

test('all seven accept links save the selected region only after deliberate activation', () => {
  for (const region of regions.REGIONS) {
    const harness = createSuggestionHarness()
    const link = acceptLink(harness.render(region.id))
    assert.ok(link, region.id)
    assert.equal(link.props.href, regions.regionPath(region.id), region.id)
    assert.equal(link.props.hrefLang, region.id === 'eu' ? 'en' : region.locale, region.id)
    assert.equal(link.props.prefetch, false, region.id)
    assert.deepEqual(harness.savedRegions, [], region.id)
    assert.deepEqual(harness.cookieWrites, [], region.id)
    assert.deepEqual(harness.navigations, [], region.id)

    link.props.onClick()

    assert.deepEqual(harness.savedRegions, [region.id], region.id)
    assert.deepEqual(harness.cookieWrites, [], region.id)
    // Navigation is the Link's native action, not an automatic location change.
    assert.deepEqual(harness.navigations, [], region.id)
  }
})

for (const protocol of ['https:', 'http:']) {
  test(`dismissal on ${protocol} saves only a session preference and focuses the chooser`, () => {
    const harness = createSuggestionHarness({ protocol })
    const button = dismissButton(harness.render('id'))
    assert.equal(button.props.type, 'button')

    button.props.onClick()

    const secure = protocol === 'https:' ? '; Secure' : ''
    assert.deepEqual(harness.cookieWrites, [
      `${detection.REGION_SUGGESTION_DISMISSED_COOKIE}=1; Path=/; SameSite=Lax${secure}`,
    ])
    assert.doesNotMatch(harness.cookieWrites[0], /Max-Age|Expires|country|\bIP\b/i)
    assert.deepEqual(harness.savedRegions, [])
    assert.deepEqual(harness.navigations, [])
    assert.deepEqual(harness.focusCalls, [{ id: 'choose-region-title', preventScroll: true }])
    assert.equal(harness.render('id'), null)
    assert.equal(harness.render('au'), null, 'Dismissal remains in effect for this chooser session')
  })
}

test('dismissal remains safe when the focus destination is no longer mounted', () => {
  const harness = createSuggestionHarness({ focusTargetExists: false })
  assert.doesNotThrow(() => dismissButton(harness.render('my')).props.onClick())
  assert.equal(harness.render('my'), null)
  assert.equal(harness.cookieWrites.length, 1)
  assert.deepEqual(harness.focusCalls, [])
})

const { RegionLanding } = loadComponent(landingSource, {
  ...sharedDependencies,
  '@/components/logo': { Logo: 'BrandLogo' },
  '@/components/region-suggestion': { RegionSuggestion: 'SuggestedRegion' },
})

test('the actual chooser gives all seven cards equal height and no full-row last-card span', () => {
  const nodes = descendants(RegionLanding({}))
  const navigation = nodes.find((node) => node.type === 'nav')
  const cards = descendants(navigation).filter((node) => node.type === 'RegionalLink')
  assert.equal(cards.length, 7)
  assert.match(navigation.props.className, /\bsm:grid-cols-2\b/)
  assert.equal(new Set(cards.map((card) => card.props.className)).size, 1)

  for (const card of cards) {
    assert.match(card.props.className, /\bh-24\b/, card.props.href)
    assert.doesNotMatch(card.props.className, /col-span|grid-column/, card.props.href)
  }
  assert.equal(cards.at(-1).props.href, '/id')
})

test('the chooser forwards an optional suggestion and provides its keyboard-focus target', () => {
  for (const hint of [undefined, null, ...regions.REGION_IDS]) {
    const nodes = descendants(RegionLanding({ suggestedRegionId: hint }))
    const suggestion = nodes.find((node) => node.type === 'SuggestedRegion')
    const heading = nodes.find((node) => node.props?.id === suggestion.props.focusTargetId)
    assert.equal(suggestion.props.suggestedRegionId, hint ?? null)
    assert.equal(heading.type, 'h2')
    assert.equal(heading.props.tabIndex, -1)
    assert.equal(suggestion.props.focusTargetId, 'choose-region-title')
  }
})
