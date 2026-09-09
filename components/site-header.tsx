'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRegion } from '@/components/region-provider'
import { RegionSwitcher } from '@/components/region-switcher'

const copy = {
  en: { home: 'Home', quality: 'Quality', reviews: 'Reviews', faq: 'FAQ', catalog: 'View Catalog', main: 'Main navigation', mobile: 'Mobile navigation', close: 'Close menu', open: 'Open menu' },
  ms: { home: 'Home', quality: 'Kualiti', reviews: 'Review', faq: 'FAQ', catalog: 'Lihat Katalog', main: 'Menu utama', mobile: 'Menu mobile', close: 'Tutup menu', open: 'Buka menu' },
  id: { home: 'Home', quality: 'Kualitas', reviews: 'Review', faq: 'FAQ', catalog: 'Lihat Katalog', main: 'Menu utama', mobile: 'Menu mobile', close: 'Tutup menu', open: 'Buka menu' },
}

export function SiteHeader({ forceSolid = false }: { forceSolid?: boolean }) {
  const { language, href } = useRegion()
  const pathname = usePathname()
  const text = copy[language]
  const navLinks = [
    { label: text.home, href: href() },
    { label: text.quality, href: href('#kualitas') },
    { label: text.reviews, href: href('#ulasan') },
    { label: text.faq, href: href('#faq') },
  ]
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = forceSolid || scrolled || hovered || open

  return (
    <header
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    >
      {/* Background Layer Glassmorphism */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 transition-all duration-300 ease-out',
          solid
            ? 'bg-black/40 backdrop-blur-xl border-b border-white/15 shadow-lg shadow-black/10'
            : 'bg-black/20 backdrop-blur-md border-b border-white/10'
        )}
      />

      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={href()} className="relative flex shrink-0 items-center" aria-label={`Regen — ${text.home}`}>
          <Logo variant="light" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label={text.main}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <RegionSwitcher variant="light" />
          <Button
            render={<Link href={href('#katalog')} />}
            className="hidden bg-accent text-accent-foreground hover:bg-accent/90 lg:inline-flex"
          >
            {text.catalog}
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-lg text-white transition-colors lg:hidden"
            aria-label={open ? text.close : text.open}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black/60 backdrop-blur-xl lg:hidden" id="mobile-navigation">
          <nav
            className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2"
            aria-label={text.mobile}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center border-b border-white/10 text-base font-medium text-white last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            <Button
              render={<Link href={href('#katalog')} />}
              onClick={() => setOpen(false)}
              className="my-3 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {text.catalog}
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}