import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Fragment } from 'react'
import { DEFAULT_REGION, REGION_COOKIE, getRegion, regionPath } from '@/lib/regions'
import {
  PRIVACY_EMAIL,
  PRIVACY_IS_DRAFT,
  privacyCopy,
  type PrivacyBlock,
  type PrivacyCopy,
} from '@/lib/privacy-copy'

type PageProps = {
  searchParams: Promise<{ region?: string | string[] }>
}

async function resolveRegion(searchParams: PageProps['searchParams']) {
  const query = await searchParams
  const explicitRegion = getRegion(query.region)
  if (explicitRegion) return explicitRegion

  const cookieStore = await cookies()
  const savedRegion = getRegion(cookieStore.get(REGION_COOKIE)?.value)
  return savedRegion ?? getRegion(DEFAULT_REGION)!
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const region = await resolveRegion(searchParams)
  const copy = privacyCopy[region.language]
  return {
    title: `${copy.title} | Regen Longevity Lab`,
    description: copy.description,
    robots: { index: !PRIVACY_IS_DRAFT, follow: !PRIVACY_IS_DRAFT },
  }
}

function RichText({ text, copy }: { text: string; copy: PrivacyCopy }) {
  const links: Record<string, { href: string; label: string }> = {
    '[[email]]': { href: `mailto:${PRIVACY_EMAIL}`, label: PRIVACY_EMAIL },
    '[[whatsappPrivacy]]': {
      href: 'https://www.whatsapp.com/legal/privacy-policy',
      label: copy.whatsappPrivacy,
    },
    '[[whatsappTerms]]': {
      href: 'https://www.whatsapp.com/legal/business-data-processing-terms',
      label: copy.whatsappTerms,
    },
  }

  return text.split(/(\*\*[^*]+\*\*|\[\[(?:email|whatsappPrivacy|whatsappTerms)\]\])/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    const link = Object.hasOwn(links, part) ? links[part] : undefined
    if (link) {
      return (
        <a key={index} href={link.href} className="break-words font-medium text-[#003F35] underline underline-offset-4">
          {link.label}
        </a>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

function Block({ block, copy }: { block: PrivacyBlock; copy: PrivacyCopy }) {
  switch (block.kind) {
    case 'p':
      return <p><RichText text={block.text} copy={copy} /></p>
    case 'note':
      return <p className="text-xs leading-5 text-slate-500"><RichText text={block.text} copy={copy} /></p>
    case 'request':
      return (
        <a
          href={`mailto:${PRIVACY_EMAIL}?subject=${encodeURIComponent(copy.requestSubject)}`}
          className="inline-flex min-h-12 max-w-full items-center justify-center rounded-xl bg-[#003F35] px-5 py-3 text-center text-sm font-semibold leading-6 text-white hover:bg-[#005447] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26A21]"
        >
          {copy.requestButton}<span aria-hidden="true" className="ml-2">↗</span>
        </a>
      )
    case 'ul':
    case 'ol': {
      const List = block.kind
      return (
        <List className={block.kind === 'ol' ? 'list-decimal space-y-2 pl-5' : 'list-disc space-y-2 pl-5 marker:text-[#F26A21]'}>
          {block.items.map((text, index) => <li key={index}><RichText text={text} copy={copy} /></li>)}
        </List>
      )
    }
  }
}

export default async function PrivacyPolicyPage({ searchParams }: PageProps) {
  const region = await resolveRegion(searchParams)
  const copy = privacyCopy[region.language]

  return (
    <article lang={region.language} className="min-h-screen bg-[#f4f8f5] pb-16 pt-6 text-[#003F35] sm:pt-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <a href={regionPath(region.id)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F26A21]">
          <span aria-hidden="true">←</span> {copy.back}
        </a>

        <header className="mt-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bd480e]">Regen Longevity Lab</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg">{copy.intro}</p>
          <p className="mt-4 text-sm text-slate-600">{PRIVACY_IS_DRAFT ? copy.draftDateLabel : copy.updatedLabel}: {copy.date}</p>
        </header>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-28">
            <nav aria-label={copy.tocAria} className="rounded-2xl border border-[#003F35]/10 bg-white p-5">
              <p className="text-sm font-bold">{copy.tocTitle}</p>
              <ol className="mt-3 space-y-1">
                {copy.sections.map(({ id, title }, index) => (
                  <li key={id}>
                    <a href={`#${id}`} className="flex min-h-10 items-center gap-3 rounded-lg px-2 py-2 text-sm leading-5 hover:bg-[#edf5ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F26A21]">
                      <span aria-hidden="true" className="w-5 shrink-0 text-xs text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                      <span>{title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="rounded-2xl bg-[#003F35] p-5 text-white">
              <p className="font-semibold">{copy.contactTitle}</p>
              <a href={`mailto:${PRIVACY_EMAIL}`} className="mt-3 block break-words text-sm leading-6 underline decoration-white/50 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{PRIVACY_EMAIL}</a>
            </div>
          </aside>

          <div className="min-w-0 space-y-8 rounded-3xl border border-[#003F35]/10 bg-white p-5 sm:p-8 lg:p-10">
            {copy.sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28 border-b border-[#003F35]/10 pb-8 last:border-0">
                <h2 id={`${section.id}-title`} className="font-display text-xl font-bold tracking-tight text-[#003F35] sm:text-2xl">{index + 1}. {section.title}</h2>
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-700">
                  {section.blocks.map((block, blockIndex) => <Block key={blockIndex} block={block} copy={copy} />)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
