import { Search } from 'lucide-react'
import { cache } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { SiteHeader } from '@/components/site-header'
import { RegionProvider } from '@/components/region-provider'
import { DEFAULT_REGION, REGION_COOKIE, getRegion } from '@/lib/regions'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArticleMotion } from '@/components/article-motion'
import { ArticleBody } from '@/components/article-body'
import { ArticleCover } from '@/components/article-cover'
import { Logo } from '@/components/logo'
import {
  articleLanguages,
  articlePath,
  coverImage,
  languageNames,
  type ArticleLanguage,
} from '@/lib/articles'
import { publishedArticles, redirectedSlug, relatedPublications } from '@/lib/article-store'
import { buildConsultationWhatsAppUrl } from '@/lib/support-copy'
import { SITE_NAME, SITE_URL } from '@/lib/site-seo'
import '../article.css'

export const dynamic = 'force-dynamic'
const copy = {
  en: { title: 'Articles', empty: 'No articles published yet.' },
  ms: { title: 'Artikel', empty: 'Belum ada artikel diterbitkan.' },
  id: { title: 'Artikel', empty: 'Belum ada artikel yang terbit.' },
}
type Props = {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>
  params: Promise<{ path?: string[] }>
}
function route(path: string[] = []) {
  const [first, ...rest] = path
  const localized = first === 'id' || first === 'ms'
  const parts = localized ? rest : path
  if (parts.length > 1 || first === 'en') notFound()
  return { lang: (localized ? first : 'en') as ArticleLanguage, slug: parts[0] }
}
const read = cache(publishedArticles)
async function content(props: Props) {
  const { lang, slug } = route((await props.params).path)
  const articles = await read(lang, slug)
  const article = slug ? articles[0] : undefined
  if (slug && !article) {
    const current = await redirectedSlug(lang, slug)
    if (current && current !== slug) permanentRedirect(articlePath(lang, current))
    notFound()
  }
  const translations = article
    ? (await read(undefined, undefined, article.topic)).map(
        (a) => [a.language, articlePath(a.language, a.slug)] as const,
      )
    : articleLanguages.map((l) => [l, articlePath(l)] as const)
  return { lang, articles, article, translations }
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, article, translations } = await content(props)
  const title = (article?.seoTitle || article?.title || copy[lang].title) + ' | ' + SITE_NAME
  const canonical = articlePath(lang, article?.slug)
  const description = article?.description || article?.summary
  return {
    title,
    description,
    alternates: { canonical, languages: Object.fromEntries(translations) },
    openGraph: {
      type: article ? 'article' : 'website',
      title,
      description,
      url: canonical,
      ...(article && coverImage(article) ? { images: [coverImage(article)] } : {}),
    },
  }
}
export default async function ArticlesPage(props: Props) {
  const { lang, articles, article, translations } = await content(props)
  const schema = article && {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    author: { '@type': 'Person', name: article.author },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    inLanguage: lang,
    mainEntityOfPage: SITE_URL + articlePath(lang, article.slug),
    ...(coverImage(article) ? { image: new URL(coverImage(article), SITE_URL).href } : {}),
  }
  const savedRegion = getRegion((await cookies()).get(REGION_COOKIE)?.value)
  const region =
    savedRegion?.language === lang
      ? savedRegion.id
      : ({ id: 'id', ms: 'my', en: DEFAULT_REGION } as const)[lang]
  const labels = {
    en: ['Categories', 'All articles', 'Read more', 'No articles in this category.'],
    id: ['Kategori', 'Semua artikel', 'Baca selengkapnya', 'Belum ada artikel dalam kategori ini.'],
    ms: ['Kategori', 'Semua artikel', 'Baca selanjutnya', 'Tiada artikel dalam kategori ini.'],
  }[lang]
  const filters = article ? {} : await props.searchParams
  const category = typeof filters.category === 'string' ? filters.category : ''
  const query = typeof filters.q === 'string' ? filters.q.trim() : ''
  const term = query.toLocaleLowerCase(lang)
  const categories = [...new Set(articles.map((item) => item.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, lang),
  )
  const visible = articles.filter(
    (item) =>
      (!category || item.category === category) &&
      (!term ||
        [item.title, item.summary, item.tags, item.category]
          .join(' ')
          .toLocaleLowerCase(lang)
          .includes(term)),
  )
  const searchLabel = {
    id: 'Cari artikel atau topik',
    ms: 'Cari artikel atau topik',
    en: 'Search articles or topics',
  }[lang]
  const related = article ? await relatedPublications(article) : []
  return (
    <div lang={lang} className="article-site">
      <RegionProvider initialRegion={region}>
        <SiteHeader forceSolid />
      </RegionProvider>
      <ArticleMotion key={article?.id ?? lang}>
        {article ? (
          <>
            <ArticleBody article={article} related={related} datePublished={article.datePublished} />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
            />
          </>
        ) : (
          <>
            <header className="journal-banner" lang="en">
              <Logo variant="light" />
              <h1>
                <span className="sr-only">Regen — </span>European Research Peptides
              </h1>
            </header>
            <div className="journal-layout">
              <section className="journal-categories">
                <div className="journal-tools">
                  <div lang="en">
                    <small>Regen Journal</small>
                    <h2>Peptide Research &amp; Potential Benefits</h2>
                  </div>
                  <form role="search" method="get" action={articlePath(lang)} key={query}>
                    {category && <input type="hidden" name="category" value={category} />}
                    <button type="submit" aria-label={searchLabel}>
                      <Search size={18} />
                    </button>
                    <input
                      type="search"
                      name="q"
                      defaultValue={query}
                      aria-label={searchLabel}
                      placeholder={searchLabel + '…'}
                    />
                  </form>
                </div>
                <nav aria-label={labels[0]}>
                  {['', ...categories].map((name) => (
                    <Link
                      key={name}
                      href={{
                        pathname: articlePath(lang),
                        query: { ...(name ? { category: name } : {}), ...(query ? { q: query } : {}) },
                      }}
                      aria-current={category === name ? 'page' : undefined}
                    >
                      {name || labels[1]}
                    </Link>
                  ))}
                </nav>
              </section>
              <div className="journal-results">
                {visible.length === 0 && (
                  <p>
                    {!articles.length
                      ? copy[lang].empty
                      : query
                        ? {
                            id: 'Tidak ada artikel yang cocok dengan pencarian ini.',
                            ms: 'Tiada artikel yang sepadan dengan carian ini.',
                            en: 'No articles match this search.',
                          }[lang]
                        : labels[3]}
                  </p>
                )}
                {visible.map((a) => (
                  <Link className="journal-row" key={a.id} href={articlePath(lang, a.slug)}>
                    <div className="journal-image">
                      {coverImage(a) ? <ArticleCover article={a} /> : <Logo />}
                      {a.category && <span className="journal-badge">{a.category}</span>}
                    </div>
                    <div className="journal-excerpt">
                      <h2>{a.title}</h2>
                      <time dateTime={a.datePublished}>
                        {new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(
                          new Date(a.datePublished),
                        )}
                      </time>
                      <p>{a.summary}</p>
                      <strong>{labels[2]} →</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </ArticleMotion>
      <footer className="article-footer">
        <div>
          <Link href="/" aria-label={SITE_NAME}>
            <Logo variant="light" />
          </Link>
          {translations.length > 1 && (
            <nav aria-label={lang === 'en' ? 'Language' : 'Bahasa'} className="article-languages">
              {translations.map(([l, url]) => (
                <Link
                  key={l}
                  href={url}
                  hrefLang={l}
                  lang={l}
                  aria-current={lang === l ? 'page' : undefined}
                  className={lang === l ? 'font-semibold underline' : ''}
                >
                  <span lang={l} title={languageNames[l]}>
                    {l.toUpperCase()}
                  </span>
                </Link>
              ))}
            </nav>
          )}
          <span>© {new Date().getUTCFullYear()} Regen Longevity Lab</span>
          <nav>
            <Link href="/privacy-policy">
              {lang === 'en' ? 'Privacy policy' : lang === 'ms' ? 'Dasar privasi' : 'Kebijakan privasi'}
            </Link>
            <a
              href={buildConsultationWhatsAppUrl({ language: lang })}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
