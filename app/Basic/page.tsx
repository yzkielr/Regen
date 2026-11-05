import type { Metadata, Viewport } from 'next'
import { TutorialGallery } from '@/components/tutorial-gallery'
import { loadTutorialImages } from '@/lib/tutorial-images'

const title = 'Basic | Regen Longevity Lab'
const description = 'Tutorial Basic Regen Longevity Lab.'
const url = 'https://www.regenlongevitylab.com/Basic'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: { title, description, url, type: 'website' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 5, userScalable: true,
}

export default async function BasicPage() {
  return <TutorialGallery title="Basic" images={await loadTutorialImages('basic', 4)} />
}
