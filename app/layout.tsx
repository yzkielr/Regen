import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import { LoadingScreen } from '@/components/loading-screen'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ConsultationProvider } from '@/components/consultation-modal'
import { RegionProvider } from '@/components/region-provider'
import { DEFAULT_REGION, REGION_HEADER, getRegion } from '@/lib/regions'
import { HOME_TAGLINE } from '@/lib/home-copy'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
})

const brandTitle = `Regen — ${HOME_TAGLINE.headline} ${HOME_TAGLINE.accent}`

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
      : 'http://localhost:3000'),
  ),
  title: brandTitle,
  description:
    'Regen develops and delivers advanced peptide therapies with uncompromising quality, traceability, and clinical precision.',
  generator: 'v0.app',
  verification: {
    other: {
      'facebook-domain-verification': 'zeq22fpyjpvy6zb2tgpsvs10fzaddt',
    },
  },
  keywords: [
    'Regen',
    'peptide',
    'research peptides',
    'retatrutide',
    'tirzepatide',
    'semaglutide',
    'European Pharmacopoeia',
  ],
  openGraph: {
    title: brandTitle,
    description:
      'Laboratory-grade research peptides with independent European lab testing and cold-chain shipping.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#003f35',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const region = getRegion((await headers()).get(REGION_HEADER))
  return (
    <html
      lang={region?.locale ?? 'en'}
      className={`light bg-background ${ibmPlexSans.variable} ${archivo.variable}`}
    >
      <body className="font-sans antialiased">
        <LoadingScreen />
        <SmoothScroll />
        <RegionProvider initialRegion={region?.id ?? DEFAULT_REGION}>
          <ConsultationProvider>{children}</ConsultationProvider>
        </RegionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
