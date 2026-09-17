import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { RegionLanding } from '@/components/region-landing'
import { REGION_COOKIE, getRegion, regionPath } from '@/lib/regions'
import { COUNTRY_HEADER, REGION_SUGGESTION_DISMISSED_COOKIE, suggestedRegion } from '@/lib/region-detection'

// Country suggestions and saved preferences are specific to each visitor.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Choose your region — Regen',
  description: 'Choose your Regen regional website, language and currency.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const region = getRegion(cookieStore.get(REGION_COOKIE)?.value)
  if (region) redirect(regionPath(region.id))

  const suggestion = suggestedRegion({
    country: (await headers()).get(COUNTRY_HEADER),
    isVercel: process.env.VERCEL === '1',
    dismissed: cookieStore.get(REGION_SUGGESTION_DISMISSED_COOKIE)?.value === '1',
  })
  return <RegionLanding suggestedRegionId={suggestion} />
}