import { articlePath, coverImage, safeUrl, wordCount, type ArticleCard, type Article } from '@/lib/articles'

import { buildConsultationWhatsAppUrl } from '@/lib/support-copy'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { ArticleCover, type CoverDevice } from './article-cover'
import { ArticleAvatar } from './article-avatar'

const labels = {
  id: {
    read: 'menit baca',
    back: 'Kembali ke artikel',
    heading: 'Ada yang ingin kamu tanyakan?',
    invite: 'Hubungi tim Regen untuk informasi katalog, kemasan, dan dokumen produk.',
    chat: 'Hubungi Regen via WhatsApp',
    related: 'Rekomendasi artikel',
    tags: 'Topik',
    draft: 'Belum terbit',
  },
  ms: {
    read: 'minit bacaan',
    back: 'Kembali ke artikel',
    heading: 'Ada soalan untuk Regen?',
    invite: 'Hubungi pasukan Regen untuk maklumat katalog, pembungkusan dan dokumen produk.',
    chat: 'Hubungi Regen melalui WhatsApp',
    related: 'Baca juga',
    tags: 'Topik',
    draft: 'Belum diterbitkan',
  },
  en: {
    read: 'min read',
    back: 'Back to articles',
    heading: 'Have a question for Regen?',
    invite: 'Talk with our team about the catalogue, packaging, or product documentation.',
    chat: 'Contact Regen on WhatsApp',
    related: 'Read next',
    tags: 'Topics',
    draft: 'Unpublished',
  },
}

export function ArticleBody({
  article,
  device,
  datePublished,
  related = [],
}: {
  article: Article
  device?: CoverDevice
  datePublished?: string
  related?: ArticleCard[]
}) {
  const c = labels[article.language]
  const tags = Array.from(
    new Set(
      (article.tags ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  )
  const externalPreview = device ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  const credit = (url?: string) =>
    url && safeUrl(url) ? (
      <figcaption>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {{ en: 'Image source', ms: 'Sumber gambar', id: 'Sumber gambar' }[article.language]} ·{' '}
          {new URL(url).hostname}
        </a>
      </figcaption>
    ) : null
  return (
    <article lang={article.language} className="regen-article">
      <a className="article-back" href={articlePath(article.language)} {...externalPreview}>
        ← {c.back}
      </a>
      <header className="article-intro">
        <div className="article-heading">
          <div className="article-meta">
            {article.category && <span>{article.category}</span>}
            {Math.max(1, Math.ceil(wordCount(article) / 200))} {c.read}
          </div>
          <h1>{article.title}</h1>
          {article.summary && <p className="article-summary">{article.summary}</p>}
        </div>
        <div className="article-byline">
          <ArticleAvatar name={article.author} url={article.authorAvatar} />
          <strong>{article.author}</strong>
          {datePublished ? (
            <time dateTime={datePublished}>
              {new Intl.DateTimeFormat(article.language, { dateStyle: 'long', timeZone: 'UTC' }).format(
                new Date(datePublished),
              )}
            </time>
          ) : (
            <small>{c.draft}</small>
          )}
        </div>
      </header>
      <div className="article-columns">
        <div className="article-prose">
          {coverImage(article) && (
            <figure>
              <ArticleCover article={article} device={device} />
              {credit(article.coverSource)}
            </figure>
          )}
          {article.blocks.map((block, index) => {
            switch (block.type) {
              case 'heading':
                return <h2 key={index}>{block.text}</h2>
              case 'list':
                return (
                  <ul key={index}>
                    {block.text
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                  </ul>
                )
              case 'image':
                return (
                  safeUrl(block.url) && (
                    <figure key={index}>
                      <img src={block.url} alt={block.text} loading="lazy" />
                      {credit(block.source)}
                    </figure>
                  )
                )
              case 'link':
                return (
                  safeUrl(block.url) && (
                    <p key={index}>
                      <a href={block.url}>{block.text}</a>
                    </p>
                  )
                )
              case 'table': {
                const [headers, ...rows] = block.text
                  .split('\n')
                  .filter(Boolean)
                  .map((row) => row.split('|'))
                return (
                  headers && (
                    <div key={index} className="article-table">
                      <table>
                        <thead>
                          <tr>
                            {headers.map((cell, i) => (
                              <th key={i}>{cell}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => (
                            <tr key={i}>
                              {row.map((cell, j) => (
                                <td key={j}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )
              }
              default:
                return <p key={index}>{block.text}</p>
            }
          })}
          {tags.length > 0 && (
            <div className="article-tags">
              <span>{c.tags}</span>
              {tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
        <aside className="article-contact">
          <MessageCircle size={22} aria-hidden="true" />
          <h2>{c.heading}</h2>
          <p>{c.invite}</p>
          <a
            href={buildConsultationWhatsAppUrl({ language: article.language })}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.chat}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="article-related">
          <h2>{c.related}</h2>
          <div>
            {related.map((card) => (
              <a key={card.id} href={articlePath(card.language, card.slug)} {...externalPreview}>
                <ArticleCover article={card} />
                <small>{card.category}</small>
                <strong>{card.title}</strong>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
