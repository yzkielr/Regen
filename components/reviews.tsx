'use client'

import { Star } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/reveal'
import { useRegion } from '@/components/region-provider'
import { getRegionReviews } from '@/lib/home-copy'

export function Reviews() {
  const { region } = useRegion()
  const copy = getRegionReviews(region.id)

  return (
    <section
      id="ulasan"
      aria-labelledby="reviews-heading"
      aria-describedby={copy.sampleNotice ? 'reviews-notice' : undefined}
      className="bg-secondary py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Header ulasan mengikuti region yang sedang aktif. */}
        <Reveal className="mx-auto max-w-2xl text-center space-y-3">
          <h2 id="reviews-heading" className="heading-gradient text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {copy.heading}
          </h2>

          {copy.sampleNotice && (
            <p id="reviews-notice" role="note" className="text-sm leading-relaxed text-muted-foreground">
              {copy.sampleNotice}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-accent text-accent" />
              ))}
            </span>
            {copy.isSample ? (
              <span className="inline-flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <span>
                  <strong className="text-foreground">4.9</strong>{' '}
                  from 107 verified reviews
                </span>
              </span>
            ) : copy.rating ? (
              <span className="text-sm font-medium text-muted-foreground">
                {copy.rating}
              </span>
            ) : null}
          </div>
        </Reveal>

        <Stagger className="mt-12 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {copy.items.map((review) => (
            <StaggerItem
              key={region.id + review.name + review.detail}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6"
            >
              <div>
                {/* Bintang dekoratif pada kartu contoh; bukan rating terverifikasi. */}
                <span className="flex mb-4" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-accent text-accent" />
                  ))}
                </span>

                <p className="text-sm leading-relaxed text-foreground/90">
                  {review.body}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/40">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground">
                  {review.initial}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{review.detail}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
