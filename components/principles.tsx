'use client'

import { Button } from '@/components/ui/button'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'
import { useRegion } from '@/components/region-provider'
import { homeCopy } from '@/lib/home-copy'

export function Principles() {
  const { language } = useRegion()
  const copy = homeCopy[language]

  return (
    <section className="bg-primary py-16 text-primary-foreground md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="heading-gradient-light max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {copy.principles.heading}
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-10 md:grid-cols-3">
          {copy.principles.items.map((item, index) => (
            <StaggerItem key={item.title}>
              <span className="font-display text-4xl font-bold text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-background/70">
                {item.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-12">
          <Button
            render={<a href="#katalog" />}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {copy.viewCatalog}
          </Button>
        </div>
      </div>
    </section>
  )
}
