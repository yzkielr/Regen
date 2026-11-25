export const articleLanguages = ['en', 'ms', 'id'] as const
export type ArticleLanguage = (typeof articleLanguages)[number]
export const languageNames = { en: 'English', ms: 'Bahasa Melayu', id: 'Bahasa Indonesia' }
export type BlockType = 'paragraph' | 'heading' | 'list' | 'image' | 'link' | 'table'
export type ArticleBlock = { type: BlockType; text: string; url: string; source?: string }
export type Article = {
  id: string
  topic: string
  language: ArticleLanguage
  title: string
  slug: string
  summary: string
  author: string
  authorAvatar?: string
  category: string
  tags?: string
  cover: string
  coverMobile?: string
  coverTablet?: string
  coverSource?: string
  coverAlt: string
  seoTitle: string
  description: string
  blocks: ArticleBlock[]
}
export type ArticleStatus = 'draft' | 'review' | 'published'
export type ArticleRecord = {
  draft: Article
  revision: number
  status: ArticleStatus
  published: boolean
  publishedCard?: ArticleCard | null
  publishedSlug?: string
}
export type Publication = Article & { datePublished: string; dateModified: string }
export type ArticleCard = Pick<
  Publication,
  | 'id'
  | 'language'
  | 'slug'
  | 'title'
  | 'category'
  | 'cover'
  | 'coverAlt'
  | 'coverMobile'
  | 'coverTablet'
  | 'datePublished'
>
export function relatedCards(a: Article, cards: ArticleCard[]) {
  return cards
    .filter((card) => card.language === a.language && card.id !== a.id)
    .sort(
      (left, right) =>
        Number(right.category === a.category) - Number(left.category === a.category) ||
        right.datePublished.localeCompare(left.datePublished),
    )
    .slice(0, 4)
}
export type AuthorProfile = { name: string; avatar: string }
export type ArticleSettings = {
  authors?: AuthorProfile[]
  minimumWords: number
  categories: string
  language: ArticleLanguage
}
export const defaultSettings: ArticleSettings = {
  authors: [],
  minimumWords: 300,
  categories: 'Panduan, Kualitas, Katalog',
  language: 'en',
}
export const emptyBlock = (): ArticleBlock => ({ type: 'paragraph', text: '', url: '' })
export function newArticle(
  author: string,
  language: ArticleLanguage,
  topic = crypto.randomUUID() as string,
  profile?: AuthorProfile,
): Article {
  return {
    id: crypto.randomUUID(),
    topic,
    language,
    title: '',
    slug: '',
    summary: '',
    author: profile?.name || author,
    authorAvatar: profile?.avatar || '',
    category: '',
    cover: '',
    coverAlt: '',
    seoTitle: '',
    description: '',
    blocks: [emptyBlock()],
  }
}
export function articleSlug(title: string) {
  const slug = title
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 180)
    .replace(/^-+|-+$/g, '')
  return ['en', 'ms', 'id'].includes(slug) ? slug + '-artikel' : slug
}
export const coverUploadLimit = 4_000_000
const uploadedCover = /^\/article-covers\/[a-f0-9]{64}\.webp$/
export function validCover(url: string) {
  return uploadedCover.test(url) || safeUrl(url)
}
export function previewCover(url: string) {
  return uploadedCover.test(url) ? '/admin/api/articles/covers?file=' + url.split('/').pop() : url
}
export function coverImage(a: Pick<Article, 'cover' | 'coverMobile' | 'coverTablet'>) {
  return a.cover || a.coverTablet || a.coverMobile || ''
}
export function articlePath(language: ArticleLanguage, slug = '') {
  return '/articles' + (language === 'en' ? '' : '/' + language) + (slug ? '/' + slug : '')
}
export function wordCount(article: Article) {
  return article.blocks
    .map((b) => b.text)
    .join(' ')
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length
}
export function safeUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
export function publishErrors(article: Article): string[] {
  const errors: string[] = []
  if (!article.title.trim() || !article.author.trim() || !(article.description || article.summary).trim())
    errors.push('Lengkapi judul, penulis, dan ringkasan atau deskripsi SEO.')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) || ['id', 'ms', 'en'].includes(article.slug))
    errors.push('Isi judul dengan huruf atau angka agar alamat artikel dapat dibuat.')
  if (!article.blocks.some((b) => ['paragraph', 'list', 'table'].includes(b.type) && b.text.trim()))
    errors.push('Tambahkan isi artikel.')
  if (
    coverImage(article) &&
    ([article.cover, article.coverMobile, article.coverTablet].some((v) => v && !validCover(v)) ||
      !article.coverAlt.trim())
  )
    errors.push('Periksa file dan lengkapi teks alternatif gambar sampul.')
  if (article.blocks.some((b) => ['image', 'link'].includes(b.type) && (!safeUrl(b.url) || !b.text.trim())))
    errors.push('Lengkapi alamat HTTPS dan keterangan setiap gambar atau tautan.')
  if (
    [
      article.authorAvatar,
      article.coverSource,
      ...article.blocks.filter((b) => b.type === 'image').map((b) => b.source),
    ].some((v) => v && !safeUrl(v))
  )
    errors.push('Gunakan URL HTTPS untuk avatar dan sumber gambar.')
  return errors
}
export function validArticle(value: unknown): value is Article {
  if (!value || typeof value !== 'object') return false
  const a = value as Article
  const uuid = /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i
  return (
    typeof a.id === 'string' &&
    uuid.test(a.id) &&
    typeof a.topic === 'string' &&
    uuid.test(a.topic) &&
    articleLanguages.includes(a.language) &&
    [a.title, a.slug, a.author, a.category, a.cover, a.coverAlt, a.seoTitle, a.description, a.summary].every(
      (v) => typeof v === 'string' && v.length <= 4000,
    ) &&
    (a.tags === undefined || (typeof a.tags === 'string' && a.tags.length <= 500)) &&
    [a.authorAvatar, a.coverMobile, a.coverTablet, a.coverSource].every(
      (v) => v === undefined || (typeof v === 'string' && v.length <= 4000),
    ) &&
    Array.isArray(a.blocks) &&
    a.blocks.length <= 300 &&
    a.blocks.every(
      (b) =>
        b &&
        ['paragraph', 'heading', 'list', 'image', 'link', 'table'].includes(b.type) &&
        typeof b.text === 'string' &&
        typeof b.url === 'string' &&
        (b.source === undefined || (typeof b.source === 'string' && b.source.length <= 4000)) &&
        b.url.length <= 4000,
    )
  )
}
