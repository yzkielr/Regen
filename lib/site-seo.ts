export const SITE_URL = 'https://www.regenlongevitylab.com'
export const SITE_NAME = 'Regen Longevity Lab'
export const SITE_TITLE = `${SITE_NAME} | Research Peptides`
export const SITE_DESCRIPTION = 'Explore research peptides, product information and regional support from Regen Longevity Lab. Choose your region for local language and pricing.'

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
      alternateName: 'Regen',
      logo: `${SITE_URL}/brand/regen-logo-green.png`,
      sameAs: SITE_SOCIAL_PROFILES.map((profile) => profile.url),
    },
  ],
}
