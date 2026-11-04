import type { Metadata, Viewport } from 'next'
import Image from 'next/image'
import { Logo } from '@/components/logo'

const title = 'Tutorial | Regen Longevity Lab'
const url = 'https://www.regenlongevitylab.com/Tutorial'
const pages = Array.from({ length: 6 }, (_, index) => String(index + 1).padStart(2, '0'))

export const metadata: Metadata = {
  title,
  description: 'Tutorial Regen Longevity Lab.',
  alternates: { canonical: url },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: { title, description: 'Tutorial Regen Longevity Lab.', url, type: 'website' },
}

// Allow pinch-to-zoom so text within the supplied images stays readable on phones.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function TutorialPage() {
  return (
    <main lang="id" className="min-h-screen bg-[#edf2ef] text-primary">
      <header className="mx-auto flex max-w-[1008px] items-center justify-between gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <Logo />
        <div className="text-right">
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Tutorial</h1>
          <p className="mt-1 text-xs text-muted-foreground">Regen Longevity Lab</p>
        </div>
      </header>

      <ol aria-label="Halaman tutorial" className="mx-auto flex max-w-[1008px] list-none flex-col gap-4 px-2 pb-8 sm:gap-6 sm:px-6 sm:pb-12">
        {pages.map((page, index) => (
          <li key={page} id={`halaman-${page}`} className="overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-black/5">
            <Image
              src={`/tutorial/${page}.jpg`}
              alt={`Tutorial Regen Longevity Lab, halaman ${index + 1} dari ${pages.length}`}
              width={1200}
              height={1697}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              className="block h-auto w-full"
            />
          </li>
        ))}
      </ol>
    </main>
  )
}
