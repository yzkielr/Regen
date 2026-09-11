import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import { REGIONS } from './regions.ts'
import { HOME_TAGLINE, homeCopy } from './home-copy.ts'
import { SUPPORT_COPY } from './support-copy.ts'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const jsxRuntime = require('react/jsx-runtime')
const expectedTagline = 'European research-grade peptides, delivered with precision.'
const expectedReviewHeading = 'Cerita tentang Regen'


// Exercise the actual components with a regional context. Animation, icon and
// button boundaries are substituted; the copy and conditional UI are real.
function compileComponent(path) {
  return ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
}

const heroSource = compileComponent('../components/hero.tsx')
const reviewsSource = compileComponent('../components/reviews.tsx')

function loadComponent(source, region) {
  const componentModule = { exports: {} }
  const dependencies = {
    'react/jsx-runtime': jsxRuntime,
    'lucide-react': { FlaskConical: 'LabIcon', Headset: 'SupportIcon', Truck: 'ShippingIcon', Star: 'RatingStar' },
    'framer-motion': { motion: { div: 'div', h1: 'h1', p: 'p', ul: 'ul' } },
    '@/components/ui/button': { Button: 'Button' },
    '@/components/consultation-button': { ConsultationButton: 'ConsultationButton' },
    '@/components/trust-carousel': { TrustCarousel: 'TrustCarousel' },
    '@/components/reveal': { Reveal: 'Reveal', Stagger: 'Stagger', StaggerItem: 'StaggerItem' },
    '@/components/region-provider': { useRegion: () => ({ region, language: region.language }) },
    '@/lib/home-copy': { HOME_TAGLINE, homeCopy },
  }
  vm.runInNewContext(source, {
    module: componentModule,
    exports: componentModule.exports,
    Intl,
    require(id) {
      if (!Object.hasOwn(dependencies, id)) throw new Error(`Unexpected component dependency: ${id}`)
      return dependencies[id]
    },
  })
  return componentModule.exports
}

function descendants(node) {
  if (node == null || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(descendants)
  return [node, ...descendants(node.props?.children)]
}

function content(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(content).join('')
  return content(node.props?.children)
}

test('every regional hero renders the exact shared English tagline with English language markup', () => {
  assert.equal(`${HOME_TAGLINE.headline} ${HOME_TAGLINE.accent}`, expectedTagline)
  for (const region of REGIONS) {
    const { Hero } = loadComponent(heroSource, region)
    const tree = Hero()
    const headings = descendants(tree).filter((node) => node.type === 'h1')
    assert.equal(headings.length, 1, region.id)
    assert.equal(content(headings[0]), expectedTagline, region.id)
    assert.equal(headings[0].props.lang, 'en', region.id)
    assert.ok(content(tree).includes(homeCopy[region.language].hero.body), region.id)
  }
})

test('each hero ends with one full-width trust carousel while retaining its regional copy, catalog CTA, consultation and video', () => {
  for (const region of REGIONS) {
    const { Hero } = loadComponent(heroSource, region)
    const tree = Hero()
    const nodes = descendants(tree)
    const copy = homeCopy[region.language]
    const carousels = nodes.filter((node) => node.type === 'TrustCarousel')
    assert.equal(tree.type, 'section')
    assert.equal(tree.props.id, 'beranda')
    assert.equal(carousels.length, 1, region.id)
    const rootChildren = [tree.props.children].flat(Infinity).filter(Boolean)
    assert.equal(rootChildren.at(-1), carousels[0], 'the carousel is a direct, final child outside the constrained hero copy')
    const copyWrappers = rootChildren.filter((node) => /\bmax-w-6xl\b/.test(node.props?.className ?? ''))
    assert.equal(copyWrappers.length, 1)
    assert.equal(descendants(copyWrappers[0]).includes(carousels[0]), false)
    assert.ok(content(tree).includes(copy.hero.body))
    assert.ok(content(tree).includes(copy.hero.trusted))
    assert.ok(content(tree).includes(region.nativeName))
    assert.ok(content(tree).includes(`${region.currency} · ${region.languageName}`))
    for (const removedBadge of copy.hero.trust) {
      assert.ok(!content(tree).includes(removedBadge), `${region.id}: the previous three-card trust row is removed`)
    }

    const catalogButtons = nodes.filter((node) => node.type === 'Button')
    assert.equal(catalogButtons.length, 1)
    assert.equal(content(catalogButtons[0]), copy.viewCatalog)
    assert.equal(catalogButtons[0].props.render.type, 'a')
    assert.equal(catalogButtons[0].props.render.props.href, '#katalog')
    const consultationButtons = nodes.filter((node) => node.type === 'ConsultationButton')
    assert.equal(consultationButtons.length, 1)
    assert.equal(content(consultationButtons[0]), copy.freeConsultation)

    const videos = nodes.filter((node) => node.type === 'video')
    assert.equal(videos.length, 1)
    for (const flag of ['autoPlay', 'muted', 'loop', 'playsInline']) assert.equal(videos[0].props[flag], true)
    assert.equal(videos[0].props.poster, '/hero-pen-poster.jpg')
    const sources = descendants(videos[0]).filter((node) => node.type === 'source')
    assert.equal(sources.length, 1)
    assert.equal(sources[0].props.src, '/hero-pen.mp4')
    assert.equal(sources[0].props.type, 'video/mp4')
  }
})

test('the brand tagline stays in English in all regional footers', () => {
  for (const language of ['en', 'ms', 'id']) {
    assert.equal(SUPPORT_COPY[language].footer.tagline, expectedTagline, language)
  }
})

test('Indonesian review adaptations disclose their European source and fictional profiles without claiming local testimonials or healthcare endorsements', () => {
  const reviews = homeCopy.id.reviews
  assert.equal(reviews.isSample, true)
  assert.equal(reviews.rating, '')
  assert.equal(reviews.heading, expectedReviewHeading)
  assert.equal(reviews.sampleNotice, expectedReviewNotice)
  assert.match(reviews.sampleNotice, /ulasan.*Eropa/i)
  for (const disclosure of [/\bnama\b/i, /\b(?:usia|umur)\b/i, /\b(?:profesi(?:nya)?|pekerjaan)\b/i, /\brekaan\b/i]) {
    assert.match(reviews.sampleNotice, disclosure)
  }
  assert.match(reviews.sampleNotice, /bukan[^.;]*(?:testimoni|ulasan)[^.;]*Indonesia/i)
  assert.match(reviews.sampleNotice, /bukan[^.;]*(?:rekomendasi|dukungan|endorsement)[^.;]*(?:tenaga kesehatan|dokter)/i)
  assert.equal(Object.hasOwn(reviews, 'sampleLabel'), false)
  assert.doesNotMatch(readFileSync(new URL('./home-copy.ts', import.meta.url), 'utf8'), /\bsampleLabel\b/,
    'the obsolete per-card label is removed from the copy type as well as the data')
})

test('all nine Indonesian fictional profiles have new names, matching initials, changed adult ages and localized professional roles', () => {
  const reviews = homeCopy.id.reviews
  assert.equal(reviews.items.length, 9)
  assert.equal(new Set(reviews.items.map((item) => item.name)).size, reviews.items.length)
  assert.equal(new Set(reviews.items.map((item) => item.detail)).size, reviews.items.length)
  assert.equal(new Set(reviews.items.map((item) => item.body)).size, reviews.items.length)
  const otherNames = new Set([...homeCopy.en.reviews.items, ...homeCopy.ms.reviews.items].map((item) => item.name))
  for (const [index, item] of reviews.items.entries()) {
    assert.match(item.name, /^\p{L}[\p{L}\p{M} .'-]*$/u)
    assert.doesNotMatch(item.name, /contoh|\d/i, 'the profile name is no longer an ordinal UI placeholder')
    assert.ok(!otherNames.has(item.name), `${item.name} must not reuse a source profile`)
    assert.equal(item.initial, Array.from(item.name.trim())[0].toLocaleUpperCase('id-ID'), item.name)

    const profile = /^(\d{2}) tahun · (.+)$/.exec(item.detail)
    assert.ok(profile, `${item.name}: display a localized age and profession`)
    const age = Number(profile[1])
    const sourceAge = Number(/^\d+/.exec(homeCopy.en.reviews.items[index].detail)?.[0])
    assert.ok(age >= 18 && age <= 90, `${item.name}: the fictional age is an adult age`)
    assert.notEqual(age, sourceAge, `${item.name}: change the corresponding source age`)
    assert.match(profile[2], /klinik|perawat|laboratorium|gizi|apoteker|fisioterapis|pasien|dokter|praktisi wellness|instruktur binaraga/i)
    assert.ok(item.body.length > 35)
  }
})

test('the nine Indonesian paraphrases preserve the ordered European review contexts instead of generic website-only sample comments', () => {
  // Anchor each pair to its subject, not an exact sentence, so natural Indonesian
  // edits remain possible without silently replacing or reordering the source stories.
  const contexts = [
    { topic: 'consultation clarifies questions before ordering', source: [/consultation/i, /questions/i, /understanding/i, /ordering/i], translated: [/konsultasi/i, /pertanyaan/i, /paham|ngerti|memahami/i, /pesan|order|beli/i] },
    { topic: 'cold arrival with frozen ice packs and sealed packaging', source: [/cold/i, /ice packs/i, /solid/i, /sealed/i], translated: [/dingin/i, /ice\s*pack/i, /beku/i, /segel|sealed/i] },
    { topic: 'supplier follows up after payment and delivery', source: [/suppliers/i, /pay/i, /checking in/i, /landed/i], translated: [/supplier|pemasok/i, /bayar/i, /follow[ -]?up|menghubungi/i, /sampai|tiba/i] },
    { topic: 'initial skepticism answered by verification and a guide', source: [/skeptical/i, /verification code/i, /guide book/i], translated: [/skeptis|ragu/i, /kode verifikasi/i, /buku panduan|guide\s*book/i] },
    { topic: 'practitioner receives COA documentation rather than marketing', source: [/practitioner/i, /documentation/i, /marketing/i, /Certificate of Analysis/i], translated: [/praktisi/i, /dokumen/i, /marketing/i, /\bCOA\b|Certificate of Analysis/i] },
    { topic: 'easy pen setup with precise clicks for the dose setting', source: [/pen setup/i, /easy/i, /clicks/i, /precise/i, /dose/i], translated: [/\bpen\b/i, /mudah|gampang/i, /klik/i, /presisi|tepat/i, /dosis/i] },
    { topic: 'quick support and continuing updates resolve a held shipment', source: [/support/i, /minutes/i, /shipment.*held up/i, /kept me posted/i, /sorted it out/i], translated: [/support/i, /menit/i, /pengiriman.*tertahan/i, /dikabari|update/i, /beres|selesai/i] },
    { topic: 'months following a protocol with batch-to-batch consistency', source: [/protocol/i, /couple months/i, /consistency/i, /batch to batch/i], translated: [/protokol/i, /beberapa bulan/i, /konsisten/i, /batch ke batch/i] },
    { topic: 'clean, uncomplicated, on-time cold-chain delivery', source: [/clean/i, /no fuss/i, /on time/i, /cold-chain/i], translated: [/bersih/i, /(?:nggak|tidak|tanpa).*ribet/i, /tepat waktu/i, /cold-chain/i] },
  ]
  assert.equal(homeCopy.en.reviews.items.length, contexts.length)
  assert.equal(homeCopy.id.reviews.items.length, contexts.length)
  for (const [index, context] of contexts.entries()) {
    const source = homeCopy.en.reviews.items[index].body
    const translated = homeCopy.id.reviews.items[index].body
    for (const keyword of context.source) assert.match(source, keyword, `European source ${index + 1}: ${context.topic}`)
    for (const keyword of context.translated) assert.match(translated, keyword, `Indonesian adaptation ${index + 1}: ${context.topic}`)
    assert.notEqual(translated, source, `${context.topic}: the English text must be paraphrased into Indonesian`)
  }

  const previousGenericSnippets = [
    'baru lihat-lihat dulu',
    'suka ada pilihan region',
    'foto produk saja belum cukup',
    'kalau banyak istilah baru',
    'bukan tipe yang langsung checkout',
    'tampilan webnya rapi',
    'pengin tahu cara bacanya',
    'enaknya bisa mulai dari katalog',
    'bagian pertanyaan umum',
  ]
  const allComments = homeCopy.id.reviews.items.map((item) => item.body).join('\n').toLowerCase()
  for (const snippet of previousGenericSnippets) assert.ok(!allComments.includes(snippet), `replace the old generic comment: ${snippet}`)
})

test('the requested Indonesian surprise wording and Maya profession change do not alter their source reviews in English or Malay', () => {
  const reza = homeCopy.id.reviews.items.find((review) => review.name === 'Reza')
  const maya = homeCopy.id.reviews.items.find((review) => review.name === 'Maya')
  assert.equal(reza?.body, 'Saya sudah menjalankan protokol ini selama beberapa bulan. Yang bikin saya tetap memilih Regen adalah konsistensi dari batch ke batch. Nggak ada surprise.')
  assert.equal(reza.detail, '40 tahun · Dokter umum')
  assert.equal(maya?.detail, '35 tahun · Instruktur binaraga (PT)')
  assert.equal(maya.body, 'Waktu pengiriman saya tertahan, support membalas dalam hitungan menit. Saya terus dikabari sampai masalahnya beres. Buat saya, hal kecil seperti ini penting.')
  assert.equal(homeCopy.en.reviews.items[7].body, 'Been running my protocol for a couple months now and the consistency batch to batch is what keeps me here. No surprises.')
  assert.equal(homeCopy.ms.reviews.items[7].body, 'Saya dah ikut protokol selama beberapa bulan. Konsistensi dari batch ke batch buat saya terus pilih Regen. Tak ada kejutan.')
})

test('the actual Indonesian review section presents one upfront accessible notice and no repeated card badges, stars or aggregate ratings', () => {
  const region = REGIONS.find((item) => item.id === 'id')
  const { Reviews } = loadComponent(reviewsSource, region)
  const tree = Reviews()
  const nodes = descendants(tree)
  const copy = homeCopy.id.reviews
  const notes = nodes.filter((node) => node.props?.role === 'note')
  assert.equal(notes.length, 1)
  const note = notes[0]
  assert.equal(tree.type, 'section')
  assert.equal(tree.props.id, 'ulasan')
  assert.equal(tree.props['aria-describedby'], 'reviews-notice')
  assert.equal(note.type, 'p')
  assert.equal(note.props.id, tree.props['aria-describedby'])
  assert.equal(nodes.filter((node) => node.props?.id === 'reviews-notice').length, 1)
  assert.equal(content(note), expectedReviewNotice)
  assert.equal(content(tree).split(expectedReviewNotice).length - 1, 1, 'show the notice once, not on every card')
  const heading = nodes.find((node) => node.type === 'h2')
  assert.equal(content(heading), expectedReviewHeading)
  assert.equal(heading.props.id, tree.props['aria-labelledby'])
  const intro = nodes.find((node) => node.type === 'Reveal' && descendants(node).includes(heading))
  assert.ok(intro && descendants(intro).includes(note), 'the notice stays upfront with the section heading')
  assert.ok(nodes.indexOf(heading) < nodes.indexOf(note))
  for (const ancestor of nodes.filter((node) => descendants(node).includes(note))) {
    const props = ancestor.props ?? {}
    assert.ok(props.hidden == null || props.hidden === false, 'the notice must not have a hidden ancestor')
    assert.notEqual(String(props['aria-hidden']), 'true')
    assert.doesNotMatch(props.className ?? '', /(?:^|[\s:])(?:hidden|invisible|sr-only|opacity-0|h-0|max-h-0|text-transparent)(?:\s|$)/)
    assert.notEqual(props.style?.display, 'none')
    assert.notEqual(props.style?.visibility, 'hidden')
    if (props.style?.opacity != null) assert.notEqual(Number(props.style.opacity), 0)
    if (ancestor.type === 'details') assert.equal(props.open, true)
  }
  const cards = nodes.filter((node) => node.type === 'StaggerItem')
  assert.equal(cards.length, 9)
  assert.ok(nodes.indexOf(note) < nodes.indexOf(cards[0]), 'read the disclosure before any review text')
  for (const [index, card] of cards.entries()) {
    const review = copy.items[index]
    const cardNodes = descendants(card)
    const cardChildren = [card.props.children].flat(Infinity).filter(Boolean)
    assert.equal(cardChildren[0].type, 'p', `${review.name}: begin with the quote, not an empty badge or label`)
    assert.equal(content(cardChildren[0]), review.body)
    const spans = cardNodes.filter((node) => node.type === 'span')
    assert.equal(spans.length, 1, `${review.name}: the avatar initial is the only remaining span, with no per-card badge`)
    assert.equal(content(spans[0]), review.initial)
    assert.equal(cardNodes.some((node) => node.props?.role === 'note'), false)
    for (const detail of [review.body, review.name, review.detail]) {
      assert.equal(cardNodes.filter((node) => node.type === 'p' && content(node) === detail).length, 1, `${review.name}: render ${detail}`)
    }
    assert.equal(cardNodes.filter((node) => node.type === 'span' && content(node) === review.initial).length, 1)
  }
  assert.equal(nodes.filter((node) => node.type === 'RatingStar').length, 0)
  assert.equal(nodes.filter((node) => node.type === 'strong').length, 0, 'do not render the numeric aggregate rating')
  assert.equal(nodes.some((node) => /AggregateRating/i.test(node.props?.itemType ?? '')), false)
  assert.doesNotMatch(content(tree), /Contoh Adaptasi Ulasan Eropa|Contoh adaptasi|Profil fiktif/i)
  assert.doesNotMatch(content(tree), /\b4[.,]9\b|\b107\b|verified\s+reviews?|ulasan(?:\s+pelanggan)?\s+terverifikasi/i)
})

test('other regional review sections retain their existing content and are not relabeled as Indonesian samples', () => {
  const sourceNames = ['Marcus', 'Chloe', 'Daniel', 'Kayla', 'Dr. Hannah', 'Ryan', 'Grace', 'Nathan', 'Emma']
  const sourceInitials = ['M', 'C', 'D', 'K', 'H', 'R', 'G', 'N', 'E']
  const sourceDetails = {
    en: ['43, Operations Manager', '29, Brand Strategist', '47, Sales Director', '26, Content Creator', '39, Physician', '34, Personal Trainer', '37, Project Manager', '41, Software Engineer', '24, Nutritionist'],
    ms: ['43, Pengurus Operasi', '29, Pakar Strategi Jenama', '47, Pengarah Jualan', '26, Pencipta Kandungan', '39, Doktor', '34, Jurulatih Peribadi', '37, Pengurus Projek', '41, Jurutera Perisian', '24, Pakar Pemakanan'],
  }
  const sourceRatings = { en: 'from 107 verified reviews', ms: 'daripada 107 ulasan yang disahkan' }
  for (const region of REGIONS.filter((item) => item.id !== 'id')) {
    const { Reviews } = loadComponent(reviewsSource, region)
    const tree = Reviews()
    const nodes = descendants(tree)
    const copy = homeCopy[region.language].reviews
    assert.deepEqual(copy.items.map((review) => review.name), sourceNames, region.id)
    assert.deepEqual(copy.items.map((review) => review.initial), sourceInitials, region.id)
    assert.deepEqual(copy.items.map((review) => review.detail), sourceDetails[region.language], region.id)
    assert.equal(copy.rating, sourceRatings[region.language], region.id)
    assert.equal(copy.isSample, undefined, region.id)
    assert.equal(copy.sampleNotice, undefined, region.id)
    assert.equal(copy.sampleLabel, undefined, region.id)
    assert.equal(nodes.some((node) => node.props?.role === 'note'), false)
    assert.equal(tree.props['aria-describedby'], undefined, region.id)
    assert.equal(nodes.some((node) => node.props?.id === 'reviews-notice'), false)
    assert.equal(nodes.filter((node) => node.type === 'RatingStar').length, 5 + copy.items.length * 5)
    assert.ok(content(tree).includes(copy.rating))
    assert.ok(!content(tree).includes(expectedReviewNotice))
    const cards = nodes.filter((node) => node.type === 'StaggerItem')
    assert.equal(cards.length, sourceNames.length)
    for (const [index, card] of cards.entries()) {
      const review = copy.items[index]
      for (const detail of [review.body, review.name, review.detail]) assert.ok(content(card).includes(detail), region.id)
      assert.equal(descendants(card).filter((node) => node.type === 'RatingStar').length, 5)
    }
  }
})
