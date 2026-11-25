import { regionPath, type Region } from './regions'
import { CONTACT_EMAIL } from './support-copy'

export const SITE_URL = 'https://www.regenlongevitylab.com'
export const SITE_NAME = 'Regen Longevity Lab'
export const SITE_TITLE = `${SITE_NAME} | Research Peptides`
export const SITE_DESCRIPTION = 'The official research peptide catalog of Regen Longevity Lab, also known as Regen Longevity. Explore product information, regional pricing and support.'

// Official profiles supplied by the site owner.
export const SITE_SOCIAL_PROFILES = [
  { name: 'Instagram', url: 'https://www.instagram.com/regenlongevity.id/' },
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61595860736680' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@regentides' },
] as const

// Identify the brand without inventing reviews, certifications or medical claims.
export const SITE_IDENTITY = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: ['Regen Longevity', 'Regen'],
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: ['Regen Longevity', 'Regen'],
      description: 'Regen Longevity Lab provides a regional research peptide catalog, product information and customer support.',
      email: CONTACT_EMAIL,
      logo: `${SITE_URL}/brand/regen-logo-green.png`,
      sameAs: SITE_SOCIAL_PROFILES.map((profile) => profile.url),
    },
  ],
}
// All regional pages describe the same organization, using one stable identity.
export function regionalIdentity(region: Region, path: '' | '/about' = '', title?: string) {
  const url = `${SITE_URL}${regionPath(region.id, path)}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...SITE_IDENTITY['@graph'],
      {
        '@type': path === '/about' ? 'AboutPage' : 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title ?? `${SITE_NAME} | ${region.name}`,
        inLanguage: region.locale,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        ...(path === '/about' ? { mainEntity: { '@id': `${SITE_URL}/#organization` } } : {}),
      },
    ],
  }
}
