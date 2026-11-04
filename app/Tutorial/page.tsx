import type { Metadata, Viewport } from 'next'
import Image from 'next/image'
import { Logo } from '@/components/logo'

const title = 'Tutorial | Regen Longevity Lab'
const url = 'https://www.regenlongevitylab.com/Tutorial'
const pages = [
  { id: '01', width: 1165, height: 1655, version: '035d155ca1dd' },
  { id: '02', width: 1655, height: 1165, version: '6b7f6e7ea842' },
  { id: '03', width: 1655, height: 1165, version: '3882237966a4' },
  { id: '04', width: 1654, height: 1166, version: 'f749f8f0f5b7' },
  { id: '05', width: 1166, height: 1654, version: '4573849958a8' },
  { id: '06', width: 1166, height: 1654, version: '952fcffdea57' },
] as const

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
          <li key={page.id} id={`halaman-${page.id}`} className="overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-black/5">
            <Image
              src={`/tutorial/${page.id}.png?v=${page.version}`}
              alt={`Tutorial Regen Longevity Lab, halaman ${index + 1} dari ${pages.length}`}
              width={page.width}
              height={page.height}
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
