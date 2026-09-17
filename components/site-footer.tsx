'use client'

import { Mail, MessageCircle, MapPin } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ConsultationButton } from '@/components/consultation-button'
import { RegionSwitcher } from '@/components/region-switcher'
import { useRegion } from '@/components/region-provider'
import { CONTACT_EMAIL, regionalSupportText, SUPPORT_COPY } from '@/lib/support-copy'

export function SiteFooter() {
  const { region, language, href } = useRegion()
  const copy = SUPPORT_COPY[language].footer
  const privacyLabel = language === 'id'
    ? 'Kebijakan Privasi'
    : language === 'ms'
      ? 'Dasar Privasi'
      : 'Privacy Policy'

  return (
    <footer id="kontak" className="bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 border-b border-primary-foreground/15 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-primary-foreground/80">
              {copy.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ConsultationButton
              size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <MessageCircle className="size-4" />
              {copy.start}
            </ConsultationButton>
            <Button
              render={<a href={`mailto:${CONTACT_EMAIL}`} />}
              size="lg"
              variant="outline"
              className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Mail className="size-4" />
              {copy.email}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="light" />
            <p lang="en" className="mt-2 text-xs font-medium leading-relaxed text-primary-foreground/70">
              {copy.tagline}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
              {copy.about}
            </p>
            <RegionSwitcher variant="light" className="mt-5" />
          </div>

          <nav aria-label={copy.products}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              {copy.products}
            </h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-primary-foreground/80">
              <li>
                <a href={href('#katalog')} className="hover:text-accent">
                  {copy.catalog}
                </a>
              </li>
              <li>
                <a href={href('#format')} className="hover:text-accent">
                  {copy.cartridge}
                </a>
              </li>
              <li>
                <a href={href('#format')} className="hover:text-accent">
                  {copy.pen}
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label={copy.company}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              {copy.company}
            </h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-primary-foreground/80">
              <li>
                <a href={href('#kualitas')} className="hover:text-accent">
                  {copy.quality}
                </a>
              </li>
              <li>
                <a href={href('#pengiriman')} className="hover:text-accent">
                  {copy.shipping}
                </a>
              </li>
              <li>
                <a href={href('#faq')} className="hover:text-accent">
                  {copy.faq}
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground/60">
              {copy.contact}
            </h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="break-all hover:text-accent">{CONTACT_EMAIL}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                {regionalSupportText(copy.regionShipping, region)}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-primary-foreground/15 py-6 text-xs text-primary-foreground/60 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <p>
              &copy; {new Date().getFullYear()} Regen. {copy.copyright}
            </p>
            <a
              href={`/privacy-policy?region=${region.id}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {privacyLabel}
            </a>
          </div>
          <p className="max-w-lg text-pretty lg:text-right">
            {copy.researchOnly}
          </p>
        </div>
      </div>
    </footer>
  )
}
