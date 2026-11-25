export const REGION_IDS = ['au', 'eu', 'us', 'uk', 'sg', 'my', 'id'] as const

export type RegionId = (typeof REGION_IDS)[number]
export type Language = 'en' | 'ms' | 'id'
export type Currency = 'AUD' | 'EUR' | 'USD' | 'GBP' | 'SGD' | 'MYR' | 'IDR'

export interface Region {
  id: RegionId
  name: string
  shortName: string
  nativeName: string
  flag: string
  currency: Currency
  language: Language
  languageName: string
  locale: string
  dialCode: string
}

export const REGIONS: readonly Region[] = [
  { id: 'au', name: 'Australia', shortName: 'AU', nativeName: 'Australia', flag: '🇦🇺', currency: 'AUD', language: 'en', languageName: 'English', locale: 'en-AU', dialCode: '+61' },
  { id: 'eu', name: 'European Union', shortName: 'EU', nativeName: 'European Union', flag: '🇪🇺', currency: 'EUR', language: 'en', languageName: 'English', locale: 'en-IE', dialCode: '+49' },
  { id: 'us', name: 'United States', shortName: 'USA', nativeName: 'United States', flag: '🇺🇸', currency: 'USD', language: 'en', languageName: 'English', locale: 'en-US', dialCode: '+1' },
  { id: 'uk', name: 'United Kingdom', shortName: 'UK', nativeName: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', language: 'en', languageName: 'English', locale: 'en-GB', dialCode: '+44' },
  { id: 'sg', name: 'Singapore', shortName: 'SG', nativeName: 'Singapore', flag: '🇸🇬', currency: 'SGD', language: 'en', languageName: 'English', locale: 'en-SG', dialCode: '+65' },
  { id: 'my', name: 'Malaysia', shortName: 'MY', nativeName: 'Malaysia', flag: '🇲🇾', currency: 'MYR', language: 'ms', languageName: 'Bahasa Melayu', locale: 'ms-MY', dialCode: '+60' },
  { id: 'id', name: 'Indonesia', shortName: 'ID', nativeName: 'Indonesia', flag: '🇮🇩', currency: 'IDR', language: 'id', languageName: 'Bahasa Indonesia', locale: 'id-ID', dialCode: '+62' },
]

// The previous catalog used EUR. Legacy links retain that default until a
// visitor chooses a region; first-time visits to / show the region chooser.
export const DEFAULT_REGION: RegionId = 'eu'
export const REGION_COOKIE = 'regen-region'
export const REGION_HEADER = 'x-regen-region'

export function isRegionId(value: unknown): value is RegionId {
  return typeof value === 'string' && REGION_IDS.some((id) => id === value)
}

export function getRegion(value: unknown): Region | undefined {
  return REGIONS.find((region) => region.id === value)
}

export function getRegionFromPath(pathname: string): Region | undefined {
  return getRegion(pathname.split('/')[1])
}

export function regionPath(region: RegionId, path = ''): string {
  const normalized = path === '/' ? '' : path
  if (!normalized) return `/${region}`
  if (normalized.startsWith('#') || normalized.startsWith('?')) return `/${region}${normalized}`
  return `/${region}${normalized.startsWith('/') ? '' : '/'}${normalized}`
}

/** Keep a product or section open when switching markets. Never prefix assets,
 * API routes, or the original unlisted authenticity URLs with a region. */
export function switchRegionPath(pathname: string, nextRegion: RegionId): string {
  const current = getRegionFromPath(pathname)
  const suffix = current ? pathname.slice(current.id.length + 1) : pathname
  if (suffix === '' || suffix === '/') return regionPath(nextRegion)
  if (current && /^\/about\/?$/.test(suffix)) return regionPath(nextRegion, '/about')
  if (/^\/product\/[^/]+\/?$/.test(suffix)) return regionPath(nextRegion, suffix)
  return regionPath(nextRegion)
}
