import type { MetadataRoute } from 'next'
import { articleLanguages, articlePath } from '@/lib/articles'
import { publishedArticles } from '@/lib/article-store'
import { SITE_URL } from '@/lib/site-seo'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await publishedArticles()
  return [
    ...articleLanguages.map((language) => ({ url: SITE_URL + articlePath(language) })),
    ...articles.map((a) => ({
      url: SITE_URL + articlePath(a.language, a.slug),
      lastModified: a.dateModified,
    })),
  ]
}
