import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CoaPage from '@/app/coa/[code]/page'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Retatrutide — COA & Lab Reports | Regen',
  description: 'Retatrutide batch documentation and laboratory reports.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  referrer: 'no-referrer',
}

export default function RetatrutideVerificationPage() {
  const code = process.env.REGEN_RETATRUTIDE_COA_CODE

  if (!code || !/^[A-Za-z0-9_-]{32,128}$/.test(code)) {
    notFound()
  }

  return <CoaPage params={Promise.resolve({ code })} />
}