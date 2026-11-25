import { coverImage, previewCover, validCover, type ArticleCard } from '@/lib/articles'

export type CoverDevice = 'desktop' | 'tablet' | 'mobile'
export function ArticleCover({
  article,
  device,
}: {
  article: Pick<ArticleCard, 'cover' | 'coverMobile' | 'coverTablet' | 'coverAlt'>
  device?: CoverDevice
}) {
  const fallback = coverImage(article)
  if (!validCover(fallback)) return null
  const mobile = validCover(article.coverMobile || '') ? article.coverMobile : fallback
  const tablet = validCover(article.coverTablet || '') ? article.coverTablet : fallback
  return (
    <picture className="article-cover" data-device={device}>
      {!device && (
        <>
          <source media="(max-width: 639px)" srcSet={mobile} />
          <source media="(max-width: 1023px)" srcSet={tablet} />
        </>
      )}
      <img
        src={
          device
            ? previewCover(
                (device === 'mobile' ? mobile : device === 'tablet' ? tablet : fallback) || fallback,
              )
            : fallback
        }
        alt={article.coverAlt}
      />
    </picture>
  )
}
