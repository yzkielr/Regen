import Link from 'next/link'
import { ArrowUpRight, Globe2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { RegionSuggestion } from '@/components/region-suggestion'
import { REGIONS, regionPath, type RegionId } from '@/lib/regions'
import { SITE_IDENTITY, SITE_NAME } from '@/lib/site-seo'

export function RegionLanding({ suggestedRegionId = null }: { suggestedRegionId?: RegionId | null }) {
  return (
    <main className="min-h-dvh bg-secondary p-4 sm:p-8 lg:flex lg:items-center lg:justify-center lg:p-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_IDENTITY).replace(/</g, '\\u003c') }} />
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-xl shadow-primary/5 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="relative flex flex-col overflow-hidden bg-primary p-7 text-white sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -bottom-40 -left-40 size-[32rem] rounded-full border border-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-[24rem] rounded-full border border-white/10" aria-hidden="true" />
          <Logo variant="light" />
          <div className="relative mt-12 lg:my-auto lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">RESEARCH PEPTIDES</p>
            <h1 className="mt-5 max-w-md text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">{SITE_NAME}</h1>
            <p className="mt-6 max-w-sm text-pretty text-sm leading-relaxed text-white/75 sm:text-base">Regen Longevity Lab offers research peptides and product information across seven regions. Choose your region for local language, currency and support.</p>
          </div>
          <p className="relative mt-10 flex items-center gap-2 text-xs text-white/60"><Globe2 className="size-4" aria-hidden="true" /> 7 regions. One research standard.</p>
        </section>
        <section className="p-6 sm:p-10 lg:p-12" aria-labelledby="choose-region-title">
          <RegionSuggestion suggestedRegionId={suggestedRegionId} focusTargetId="choose-region-title" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">WELCOME TO REGEN</p>
          <h2 id="choose-region-title" tabIndex={-1} className="mt-3 rounded-sm font-display text-2xl font-bold tracking-tight text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-3xl">Choose your region</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">We’ll remember your choice. You can switch anytime.</p>
          <nav aria-label="Regional websites" className="mt-7 grid gap-3 sm:grid-cols-2">
            {REGIONS.map((region) => (
              <Link key={region.id} href={regionPath(region.id)} hrefLang={region.id === 'eu' ? 'en' : region.locale} prefetch={false}
                className="group flex h-24 items-center gap-3 rounded-xl border border-border bg-white p-4 transition-all hover:border-primary/50 hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <span className="shrink-0 text-2xl" aria-hidden="true">{region.flag}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-primary">{region.nativeName}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{region.languageName} · {region.currency}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-primary/40 transition-colors group-hover:text-primary" aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">For laboratory research only. Product availability, shipping and final pricing are confirmed by our team for your region.</p>
        </section>
      </div>
    </main>
  )
}
