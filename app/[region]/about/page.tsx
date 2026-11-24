import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Mail } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SocialIcon } from '@/components/social-icon'
import { BRAND_PROFILE } from '@/lib/brand-profile'
import { getRegion, regionPath } from '@/lib/regions'
import { regionAlternates } from '@/lib/region-metadata'
import { CONTACT_EMAIL } from '@/lib/support-copy'
import { regionalIdentity, SITE_NAME, SITE_SOCIAL_PROFILES, SITE_URL } from '@/lib/site-seo'

type Props = { params: Promise<{ region: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const region = getRegion((await params).region)
  if (!region) notFound()
  const copy = BRAND_PROFILE[region.language]
  const title = `${copy.title} | ${region.nativeName}`
  return {
    title,
    description: copy.description,
    alternates: regionAlternates(region, '/about'),
    openGraph: {
      title, description: copy.description, siteName: SITE_NAME, type: 'website',
      url: regionPath(region.id, '/about'), locale: region.locale.replace('-', '_'),
    },
  }
}

export default async function AboutRegenPage({ params }: Props) {
  const region = getRegion((await params).region)
  if (!region) notFound()
  const copy = BRAND_PROFILE[region.language]
  const sections = [
    { title: copy.catalogTitle, text: copy.catalogText },
    { title: copy.informationTitle, text: copy.informationText },
    { title: copy.supportTitle, text: copy.supportText.replace('{region}', region.nativeName).replace('{currency}', region.currency) },
  ]
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(regionalIdentity(region, '/about', `${copy.title} | ${region.nativeName}`)).replace(/</g, '\\u003c') }} />
      <SiteHeader forceSolid />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-20 pt-32 sm:px-8 sm:pt-40">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{copy.eyebrow} · {region.nativeName}</p>
          <h1 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-primary sm:text-5xl">{copy.title}</h1>
          <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{copy.introduction}</p>
          <Link href={regionPath(region.id, '#katalog')} className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            {copy.catalogLink}<ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </header>
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-border pt-6">
                <h2 className="font-display text-xl font-semibold tracking-tight text-primary">{section.title}</h2>
                <p className="mt-3 text-pretty text-sm leading-7 text-muted-foreground sm:text-base">{section.text}</p>
              </section>
            ))}
            <p className="rounded-2xl bg-secondary p-5 text-sm leading-relaxed text-muted-foreground">{copy.researchOnly}</p>
          </div>
          <aside className="min-w-0 rounded-3xl border border-border bg-secondary/50 p-6 sm:p-8" aria-labelledby="official-regen-contact">
            <h2 id="official-regen-contact" className="font-display text-xl font-semibold text-primary">{copy.contactTitle}</h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div><dt className="text-muted-foreground">{copy.websiteLabel}</dt><dd className="mt-1"><a href={SITE_URL} className="break-words font-medium text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary">regenlongevitylab.com</a></dd></div>
              <div><dt className="text-muted-foreground">{copy.emailLabel}</dt><dd className="mt-1 flex items-start gap-2"><Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><a href={`mailto:${CONTACT_EMAIL}`} className="break-all font-medium text-primary underline decoration-primary/25 underline-offset-4 hover:decoration-primary">{CONTACT_EMAIL}</a></dd></div>
            </dl>
            <h3 className="mt-8 border-t border-border pt-6 font-semibold text-primary">{copy.socialTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.socialText}</p>
            <nav className="mt-4 flex flex-col gap-2" aria-label={copy.socialTitle}>
              {SITE_SOCIAL_PROFILES.map((profile) => (
                <a key={profile.name} href={profile.url} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-primary transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  <SocialIcon platform={profile.name} />{profile.name}<ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
