import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { DEFAULT_REGION, REGION_COOKIE, getRegion } from '@/lib/regions'

// This page must check the server-side access code on every request.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Retatrutide · Certificate of Analysis | Regen',
  description: 'Retatrutide laboratory report links supplied with Regen products.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: 'no-referrer',
}

type Language = 'id' | 'en' | 'ms'
type PageProps = {
  params: Promise<{ code: string }>
  searchParams: Promise<{
    lang?: string | string[]
    region?: string | string[]
  }>
}

// Source labels are preserved exactly. Do not infer a strength or batch
// from "RT60", or present these links as proof of every Regen product.
const reports = [
  {
    id: '216978',
    sample: 'LORENIC_RT60',
    href: 'https://verify.janoshik.com/tests/216978-LORENIC_RT60_2EYCBQPL5YFC',
  },
  {
    id: '216979',
    sample: 'LORENIC_RT60',
    href: 'https://verify.janoshik.com/tests/216979-LORENIC_RT60_BBWJ9VNLP5ML',
  },
] as const

const copy = {
  id: {
    eyebrow: 'Dokumen laboratorium',
    title: 'Certificate of Analysis',
    intro: 'Buka laporan pengujian Retatrutide langsung melalui halaman verifikasi Janoshik.',
    report: 'Laporan uji',
    sample: 'Nama sampel pada tautan sumber',
    provider: 'Sumber laporan',
    open: 'Buka laporan Janoshik',
    newTab: 'Terbuka di tab baru',
    noteTitle: 'Cocokkan dengan produk Anda',
    note: 'Cocokkan informasi sampel dan batch pada laporan dengan label produk Anda. Hubungi tim Regen jika memerlukan bantuan mencocokkannya.',
    contact: 'Hubungi tim Regen',
    language: 'Pilih bahasa',
  },
  en: {
    eyebrow: 'Laboratory documentation',
    title: 'Certificate of Analysis',
    intro: 'Open the Retatrutide test reports directly on the Janoshik verification website.',
    report: 'Test report',
    sample: 'Sample name in the source link',
    provider: 'Report source',
    open: 'Open Janoshik report',
    newTab: 'Opens in a new tab',
    noteTitle: 'Match the report to your product',
    note: 'Check the sample and batch information in the report against your product label. Contact the Regen team if you need help matching them.',
    contact: 'Contact the Regen team',
    language: 'Choose language',
  },
  ms: {
    eyebrow: 'Dokumen makmal',
    title: 'Certificate of Analysis',
    intro: 'Buka laporan ujian Retatrutide terus melalui laman pengesahan Janoshik.',
    report: 'Laporan ujian',
    sample: 'Nama sampel dalam pautan sumber',
    provider: 'Sumber laporan',
    open: 'Buka laporan Janoshik',
    newTab: 'Dibuka dalam tab baharu',
    noteTitle: 'Padankan dengan produk anda',
    note: 'Padankan maklumat sampel dan kelompok dalam laporan dengan label produk anda. Hubungi pasukan Regen jika anda memerlukan bantuan.',
    contact: 'Hubungi pasukan Regen',
    language: 'Pilih bahasa',
  },
} satisfies Record<Language, Record<string, string>>

function isLanguage(value: unknown): value is Language {
  return value === 'id' || value === 'en' || value === 'ms'
}

export default async function CoaPage({ params, searchParams }: PageProps) {
  const { code } = await params
  const expectedCode = process.env.REGEN_RETATRUTIDE_COA_CODE

  // Fail closed: missing/malformed configuration and unknown codes reveal
  // no report links. Keep this variable server-only (never NEXT_PUBLIC_*).
  if (
    !expectedCode ||
    !/^[A-Za-z0-9_-]{32,128}$/.test(expectedCode) ||
    code !== expectedCode
  ) {
    notFound()
  }

  const query = await searchParams
  const cookieStore = await cookies()
  const region =
    getRegion(query.region) ??
    getRegion(cookieStore.get(REGION_COOKIE)?.value) ??
    getRegion(DEFAULT_REGION)!
  const language = isLanguage(query.lang) ? query.lang : region.language
  const text = copy[language]

  return (
    <article lang={language} className="min-h-screen bg-[#f4f8f5] text-[#003F35]">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#003F35]/10 pb-6">
          <p className="font-display text-3xl font-semibold tracking-tight">
            Regen<span className="text-[#F26A21]">.</span>
          </p>
          <nav aria-label={text.language} className="flex gap-1 rounded-full border border-[#003F35]/10 bg-white p-1">
            {(['id', 'en', 'ms'] as const).map((lang) => (
              <a
                key={lang}
                href={`?lang=${lang}`}
                hrefLang={lang}
                lang={lang}
                aria-current={language === lang ? 'page' : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26A21] ${
                  language === lang
                    ? 'bg-[#003F35] text-white'
                    : 'text-[#003F35]/70 hover:bg-[#eef5f0]'
                }`}
              >
                {{ id: 'Indonesia', en: 'English', ms: 'Melayu' }[lang]}
              </a>
            ))}
          </nav>
        </header>

        <div className="pb-8 pt-10 sm:pt-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b6470e]">
            {text.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {text.title}
          </h1>
          <p className="mt-4 font-display text-xl font-semibold">Retatrutide</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#003F35]/75 sm:text-base">
            {text.intro}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {reports.map((report, index) => (
            <section key={report.id} aria-labelledby={`report-${report.id}`} className="flex flex-col rounded-3xl border border-[#003F35]/10 bg-white p-6 shadow-sm sm:p-7">
              <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-2xl bg-[#F26A21]/10 font-display text-lg font-bold text-[#b6470e]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 id={`report-${report.id}`} className="mt-6 font-display text-xl font-bold">
                {text.report} #{report.id}
              </h2>
              <dl className="mb-7 mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-[#003F35]/65">{text.provider}</dt>
                  <dd className="mt-1 font-semibold">Janoshik</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#003F35]/65">{text.sample}</dt>
                  <dd className="mt-1 break-words font-semibold">{report.sample}</dd>
                </div>
              </dl>
              <a
                href={report.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                referrerPolicy="no-referrer"
                aria-label={`${text.open} #${report.id} — ${text.newTab}`}
                className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#003F35] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#005447] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26A21]"
              >
                {text.open}<span aria-hidden="true">↗</span>
              </a>
              <p className="mt-3 text-center text-xs text-[#003F35]/60">{text.newTab}</p>
            </section>
          ))}
        </div>

        <aside className="mt-6 rounded-2xl border border-[#003F35]/10 bg-[#e9f1ec] p-5 text-sm leading-6">
          <h2 className="font-semibold">{text.noteTitle}</h2>
          <p className="mt-1 text-[#003F35]/75">{text.note}</p>
        </aside>
        <footer className="mt-10 border-t border-[#003F35]/10 pt-6">
          <a href="mailto:contact@regenlongevitylab.com" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:text-[#b6470e]">
            {text.contact}<span aria-hidden="true">↗</span>
          </a>
        </footer>
      </div>
    </article>
  )
}
