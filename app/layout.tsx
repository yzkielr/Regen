import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import { LoadingScreen } from '@/components/loading-screen'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ConsultationProvider } from '@/components/consultation-modal'
import { RegionProvider } from '@/components/region-provider'
import { DEFAULT_REGION, REGION_HEADER, getRegion } from '@/lib/regions'
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/site-seo'
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  generator: 'v0.app',
  verification: {
    other: {
      'facebook-domain-verification': 'zeq22fpyjpvy6zb2tgpsvs10fzaddt',
    },
  },
  keywords: [
    SITE_NAME,
    'Regen',
    'peptide',
    'research peptides',
    'retatrutide',
    'tirzepatide',
    'semaglutide',
    'European Pharmacopoeia',
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
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
  const requestHeaders = await headers()
  const region = getRegion(requestHeaders.get(REGION_HEADER))
  const admin = requestHeaders.get('x-regen-admin-route') === '1'
  return (
    <html
      lang={region?.locale ?? 'en'}
      className={`light bg-background ${ibmPlexSans.variable} ${archivo.variable}`}
    >
      <body className="font-sans antialiased">
        {!admin && <LoadingScreen />}
        {!admin && <SmoothScroll />}
        {admin ? children : <RegionProvider initialRegion={region?.id ?? DEFAULT_REGION}>
          <ConsultationProvider>{children}</ConsultationProvider>
        </RegionProvider>}
        {!admin && process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
