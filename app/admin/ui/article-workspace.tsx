'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArticleAvatar } from '@/components/article-avatar'
import { ArticleBody } from '@/components/article-body'
import {
  articleLanguages,
  articleSlug,
  coverImage,
  coverUploadLimit,
  previewCover,
  validCover,
  articlePath,
  emptyBlock,
  languageNames,
  newArticle,
  publishErrors,
  wordCount,
  type Article,
  relatedCards,
  type ArticleCard,
  type ArticleLanguage,
  type ArticleRecord,
  type ArticleSettings,
  type BlockType,
} from '@/lib/articles'
import { adminFetch } from './admin-client'
import '../../articles/article.css'
import './article-workspace.css'

export type ArticlePage = 'articles' | 'article-write' | 'article-settings'
type Data = { records: ArticleRecord[]; settings: ArticleSettings; settingsRevision: number }
type Props = { page: ArticlePage; navigate: (p: ArticlePage) => void; author: string; supervisor: boolean }
const labels = { draft: 'Draf', review: 'Menunggu review', published: 'Terbit' }
const blocks: Record<BlockType, string> = {
  paragraph: 'Paragraf',
  heading: 'Subjudul',
  list: 'Daftar',
  image: 'Gambar',
  link: 'Tautan',
  table: 'Tabel',
}
async function api(body?: unknown) {
  const response = await adminFetch(
    '/admin/api/articles',
    body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {},
  )
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Permintaan gagal.')
  return result
}
export default function ArticleWorkspace({ page, navigate, author, supervisor }: Props) {
  const [data, setData] = useState<Data>()
  const [active, setActive] = useState<ArticleRecord>()
  const [settings, setSettings] = useState<ArticleSettings>()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const load = useCallback(async () => {
    try {
      const result: Data = await api()
      setData(result)
      setSettings(result.settings)
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => {
    if (page === 'article-write' && !active && data)
      setActive({
        draft: newArticle(author, data.settings.language, undefined, data.settings.authors?.[0]),
        revision: 0,
        status: 'draft',
        published: false,
      })
  }, [page, active, author, data])
  function edit(record: ArticleRecord) {
    setActive(record)
    setMessage('')
    navigate('article-write')
  }
  function create(lang?: ArticleLanguage, topic?: string) {
    edit({
      draft: newArticle(author, lang ?? data!.settings.language, topic, data!.settings.authors?.[0]),
      revision: 0,
      status: 'draft',
      published: false,
    })
  }
  if (!data || !settings)
    return (
      <section className="cms-panel" aria-live="polite">
        {error || 'Memuat artikel…'} {error && <button onClick={load}>Coba lagi</button>}
      </section>
    )
  const categories = settings.categories
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (page === 'article-write')
    return (
      active && (
        <Editor
          key={active.draft.id}
          initial={active}
          cards={data.records.flatMap((record) => (record.publishedCard ? [record.publishedCard] : []))}
          settings={data.settings}
          supervisor={supervisor}
          onSaved={(record) => {
            setActive((current) => (current?.draft.id === record.draft.id ? record : current))
            setData(
              (d) =>
                d && { ...d, records: [record, ...d.records.filter((r) => r.draft.id !== record.draft.id)] },
            )
          }}
        />
      )
    )
  if (page === 'article-settings')
    return (
      <form
        className="cms-panel"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          setError('')
          setMessage('')
          try {
            const normalized = {
              ...settings,
              authors: (settings.authors ?? []).map(({ name, avatar }) => ({
                name: name.trim(),
                avatar: avatar.trim(),
              })),
            }
            const result = await api({
              action: 'settings',
              revision: data.settingsRevision,
              settings: normalized,
            })
            setSettings(normalized)
            setData({ ...data, settings: normalized, settingsRevision: result.revision })
            setMessage('Pengaturan tersimpan.')
          } catch (e) {
            setError((e as Error).message)
          } finally {
            setBusy(false)
          }
        }}
      >
        <h2>Pengaturan Artikel</h2>
        <fieldset disabled={!supervisor || busy}>
          <label>
            Bahasa awal artikel
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value as ArticleLanguage })}
            >
              {articleLanguages.map((l) => (
                <option key={l} value={l}>
                  {languageNames[l]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Target jumlah kata
            <input
              type="number"
              required
              min="0"
              max="10000"
              value={settings.minimumWords}
              onChange={(e) => setSettings({ ...settings, minimumWords: Number(e.target.value) })}
            />
          </label>
          <section className="cms-settings-group">
            <h3>Penulis artikel</h3>
            <small>Penulis pertama otomatis dipilih untuk artikel baru.</small>
            {(settings.authors ?? []).map((person, i) => {
              const update = (patch: Partial<typeof person>) =>
                setSettings({
                  ...settings,
                  authors: settings.authors!.map((p, j) => (i === j ? { ...p, ...patch } : p)),
                })
              return (
                <div className="cms-author-row" key={i}>
                  <ArticleAvatar name={person.name} url={person.avatar} />
                  <label>
                    Nama penulis
                    <input
                      required
                      maxLength={160}
                      value={person.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </label>
                  <label>
                    URL avatar (opsional)
                    <input
                      type="url"
                      placeholder="https://…"
                      value={person.avatar}
                      onChange={(e) => update({ avatar: e.target.value })}
                    />
                  </label>
                  <button
                    type="button"
                    className="button"
                    onClick={() =>
                      setSettings({ ...settings, authors: settings.authors!.filter((_, j) => j !== i) })
                    }
                  >
                    Hapus penulis
                  </button>
                </div>
              )
            })}
            <button
              className="button"
              type="button"
              onClick={() =>
                setSettings({ ...settings, authors: [...(settings.authors ?? []), { name: '', avatar: '' }] })
              }
            >
              Tambah penulis
            </button>
          </section>
          <section className="cms-settings-group">
            <h3>Kategori artikel</h3>
            <div className="cms-bar">
              {categories.map((c) => (
                <button
                  type="button"
                  className="button"
                  key={c}
                  aria-label={'Hapus kategori ' + c}
                  onClick={() =>
                    setSettings({ ...settings, categories: categories.filter((v) => v !== c).join(', ') })
                  }
                >
                  {c} ×
                </button>
              ))}
            </div>
            <label>
              Nama kategori baru
              <input maxLength={120} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            </label>
            <button
              type="button"
              className="button"
              disabled={
                !newCategory.trim() ||
                newCategory.includes(',') ||
                categories.some((c) => c.toLowerCase() === newCategory.trim().toLowerCase())
              }
              onClick={() => {
                setSettings({ ...settings, categories: [...categories, newCategory.trim()].join(', ') })
                setNewCategory('')
              }}
            >
              Tambah kategori
            </button>
          </section>
          {supervisor && <button className="button primary">Simpan pengaturan</button>}
        </fieldset>
        <p>Admin dapat menulis dan meminta review. Supervisor dapat menerbitkan dan mengubah pengaturan.</p>
        <p role="status">{error || message}</p>
      </form>
    )
  const filtered = data.records.filter(
    ({ draft, status: s }) =>
      (!language || draft.language === language) &&
      (!status || s === status) &&
      (!category || draft.category === category) &&
      draft.title.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <section className="cms-panel">
      <div className="cms-bar">
        <h2>Daftar Artikel</h2>
        <button className="button primary" onClick={() => create()}>
          Tulis artikel baru
        </button>
      </div>
      <div className="cms-bar">
        <input
          aria-label="Cari judul"
          placeholder="Cari judul…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select aria-label="Filter bahasa" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">Semua bahasa</option>
          {articleLanguages.map((l) => (
            <option key={l} value={l}>
              {languageNames[l]}
            </option>
          ))}
        </select>
        <select aria-label="Filter status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          {Object.entries(labels).map(([id, v]) => (
            <option key={id} value={id}>
              {v}
            </option>
          ))}
        </select>
        <select aria-label="Filter kategori" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {filtered.length === 0 && (
        <p>{data.records.length ? 'Tidak ada artikel yang cocok.' : 'Belum ada artikel.'}</p>
      )}
      {filtered.map((r) => (
        <div className="cms-row" key={r.draft.id}>
          <strong>{r.draft.title || 'Tanpa judul'}</strong>
          <span>
            {languageNames[r.draft.language]} · {labels[r.status]}
          </span>
          <button className="button" onClick={() => edit(r)}>
            Edit
          </button>
          {articleLanguages
            .filter(
              (l) => !data.records.some((x) => x.draft.topic === r.draft.topic && x.draft.language === l),
            )
            .map((l) => (
              <button key={l} className="button" onClick={() => create(l, r.draft.topic)}>
                + {l.toUpperCase()}
              </button>
            ))}
          {r.published && (
            <a
              href={articlePath(r.draft.language, r.publishedSlug || r.draft.slug)}
              target="_blank"
              rel="noreferrer"
            >
              Lihat artikel
            </a>
          )}
        </div>
      ))}
    </section>
  )
}

const coverFields = [
  ['coverMobile', 'Ponsel · 4:3'],
  ['coverTablet', 'Tablet · 16:9'],
  ['cover', 'Desktop · 16:9'],
] as const
type CoverField = (typeof coverFields)[number][0]

function Editor({
  initial,
  cards,
  settings,
  supervisor,
  onSaved,
}: {
  initial: ArticleRecord
  cards: ArticleCard[]
  settings: ArticleSettings
  supervisor: boolean
  onSaved: (r: ArticleRecord) => void
}) {
  const [a, setA] = useState(() => {
    const draft = initial.draft
    const profile = initial.revision
      ? settings.authors?.find((person) => person.name === draft.author)
      : settings.authors?.[0]
    const summary = draft.summary || draft.description
    return {
      ...draft,
      slug: articleSlug(draft.title),
      summary,
      description: summary,
      author: profile?.name ?? draft.author,
      authorAvatar: profile?.avatar ?? draft.authorAvatar,
    }
  })
  const preview = useRef<HTMLElement>(null)
  const validation = useRef<HTMLDivElement>(null)
  const authors = [...(settings.authors ?? [])]
  if (!authors.some((p) => p.name === a.author))
    authors.push({ name: a.author, avatar: a.authorAvatar || '' })
  const [showIssues, setShowIssues] = useState(false)
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const saved = useRef(a)
  const revision = useRef(initial.revision)
  const lock = useRef(false)
  const lastAttempt = useRef<Article | null>(null)
  const [uploading, setUploading] = useState<CoverField | null>(null)
  const [uploadError, setUploadError] = useState('')
  const dirty = saved.current !== a
  async function uploadCover(key: CoverField, file: File) {
    setUploadError('')
    if (file.size > coverUploadLimit) {
      setUploadError('Ukuran file maksimal 4 MB.')
      return
    }
    setUploading(key)
    try {
      const response = await adminFetch('/admin/api/articles/covers', { method: 'POST', body: file })
      const data = await response.json()
      if (!response.ok || typeof data.url !== 'string')
        throw new Error(data.error || 'Gambar gagal diunggah.')
      change(key, data.url)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Gambar gagal diunggah.')
    } finally {
      setUploading(null)
    }
  }
  const issues = publishErrors(a)
  function change<K extends keyof Article>(key: K, value: Article[K]) {
    setA((old) => ({ ...old, [key]: value }))
  }
  async function save(action: 'save' | 'review' | 'publish') {
    if (lock.current) return
    lock.current = true
    lastAttempt.current = a
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const result = await api({ action, article: a, revision: revision.current })
      revision.current = result.revision
      saved.current = a
      onSaved({
        draft: a,
        publishedCard:
          action === 'publish'
            ? { ...a, datePublished: initial.publishedCard?.datePublished ?? new Date().toISOString() }
            : initial.publishedCard,
        publishedSlug: action === 'publish' ? a.slug : initial.publishedSlug,
        revision: result.revision,
        status: action === 'publish' ? 'published' : action === 'review' ? 'review' : 'draft',
        published: initial.published || action === 'publish',
      })
      setMessage(
        action === 'publish'
          ? 'Artikel sudah terbit.'
          : action === 'review'
            ? 'Dikirim untuk review.'
            : 'Draf tersimpan.',
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  const autosave = useRef(() => {})
  autosave.current = () => {
    void save('save')
  }
  useEffect(() => {
    if (!dirty || busy || lastAttempt.current === a) return
    const timer = setTimeout(() => autosave.current(), 1200)
    return () => clearTimeout(timer)
  }, [a, dirty, busy])
  useEffect(() => {
    if (!dirty && !uploading) return
    const unload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    const guard = (e: Event) => {
      if (!confirm('Tinggalkan editor sebelum perubahan tersimpan?')) e.preventDefault()
    }
    window.addEventListener('beforeunload', unload)
    window.addEventListener('regen:leave-article', guard)
    return () => {
      window.removeEventListener('beforeunload', unload)
      window.removeEventListener('regen:leave-article', guard)
    }
  }, [dirty, uploading])
  const count = wordCount(a)
  const titleForSearch = a.seoTitle.trim() || a.title.trim()
  const descriptionForSearch = a.summary.trim() || a.description.trim()
  function requestPublication(action: 'review' | 'publish') {
    if (issues.length) {
      setShowIssues(true)
      requestAnimationFrame(() => validation.current?.focus())
    } else {
      void save(action)
    }
  }
  function updateTitle(title: string) {
    setA((old) => ({ ...old, title, slug: articleSlug(title) }))
  }
  const hasPreview = Boolean(a.title || a.summary || coverImage(a) || a.blocks.some((b) => b.text || b.url))
  return (
    <div className="cms-editor">
      <section className="cms-panel cms-sheet" aria-label="Formulir artikel">
        <header className="cms-editor-head">
          <div>
            <small>{labels[initial.status]}</small>
            <h2>Tulis artikel</h2>
          </div>
          <button
            type="button"
            className="button"
            onClick={() => {
              preview.current?.focus()
              preview.current?.scrollIntoView({ block: 'start' })
            }}
          >
            Lihat preview ↓
          </button>
        </header>
        <label>
          Judul artikel
          <input
            className="cms-title-input"
            required
            value={a.title}
            maxLength={4000}
            placeholder="Contoh: Cara membaca COA peptida riset"
            onChange={(e) => updateTitle(e.target.value)}
          />
        </label>
        <label>
          Ringkasan Artikel / Meta Description (SEO)
          <textarea
            rows={2}
            value={a.summary || a.description}
            maxLength={4000}
            placeholder="Apa yang akan dipahami pembaca setelah membaca artikel ini?"
            onChange={(e) => {
              const summary = e.target.value
              setA((old) => ({ ...old, summary, description: summary }))
            }}
          />
        </label>
        <div className="cms-field-grid">
          <label>
            Nama penulis
            {authors.length > 1 ? (
              <select
                value={a.author}
                onChange={(e) => {
                  const person = authors.find((p) => p.name === e.target.value)!
                  setA((old) => ({ ...old, author: person.name, authorAvatar: person.avatar }))
                }}
              >
                {authors.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
              </select>
            ) : (
              <input value={a.author} readOnly />
            )}
          </label>
          <label>
            Bahasa artikel
            <select
              disabled={initial.published}
              value={a.language}
              onChange={(e) => change('language', e.target.value as ArticleLanguage)}
            >
              {articleLanguages.map((l) => (
                <option key={l} value={l}>
                  {languageNames[l]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kategori
            <select value={a.category} onChange={(e) => change('category', e.target.value)}>
              <option value="">Pilih kategori</option>
              {Array.from(
                new Set([...settings.categories.split(','), a.category].map((s) => s.trim()).filter(Boolean)),
              ).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Topik artikel (opsional)
          <input
            value={a.tags ?? ''}
            maxLength={500}
            placeholder="Pisahkan topik dengan koma"
            onChange={(e) => change('tags', e.target.value)}
          />
        </label>

        <section className="cms-section">
          <div className="cms-section-head">
            <h3>Isi artikel</h3>
            <small>{count} kata</small>
          </div>
          {a.blocks.map((b, i) => {
            const update = (patch: Partial<typeof b>) =>
              change(
                'blocks',
                a.blocks.map((v, j) => (j === i ? { ...v, ...patch } : v)),
              )
            return (
              <fieldset key={i} className="cms-content-block">
                <legend className="sr-only">Bagian {i + 1}</legend>
                <div className="cms-section-head">
                  <select
                    aria-label={`Jenis bagian ${i + 1}`}
                    value={b.type}
                    onChange={(e) => update({ type: e.target.value as BlockType })}
                  >
                    {Object.entries(blocks).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="cms-text-button"
                    aria-label={`Hapus bagian ${i + 1}`}
                    onClick={() =>
                      change(
                        'blocks',
                        a.blocks.filter((_, j) => i !== j),
                      )
                    }
                  >
                    Hapus
                  </button>
                </div>
                {['image', 'link'].includes(b.type) && (
                  <label>
                    Alamat {b.type === 'image' ? 'gambar' : 'tautan'} (HTTPS)
                    <input
                      type="url"
                      value={b.url}
                      placeholder="https://…"
                      onChange={(e) => update({ url: e.target.value })}
                    />
                  </label>
                )}
                {b.type === 'image' && (
                  <label>
                    Link sumber gambar
                    <input
                      type="url"
                      value={b.source ?? ''}
                      placeholder="https://…"
                      onChange={(e) => update({ source: e.target.value })}
                    />
                  </label>
                )}
                <label>
                  {b.type === 'image'
                    ? 'Teks alternatif gambar'
                    : b.type === 'link'
                      ? 'Teks tautan'
                      : blocks[b.type]}
                  <textarea
                    rows={b.type === 'paragraph' ? 5 : 2}
                    value={b.text}
                    placeholder={
                      b.type === 'paragraph'
                        ? 'Tulis paragraf di sini…'
                        : b.type === 'table'
                          ? 'Pisahkan kolom dengan |. Gunakan baris pertama untuk judul kolom.'
                          : b.type === 'list'
                            ? 'Tulis satu poin per baris.'
                            : undefined
                    }
                    onChange={(e) => update({ text: e.target.value })}
                  />
                </label>
              </fieldset>
            )
          })}
          <button className="button" onClick={() => change('blocks', [...a.blocks, emptyBlock()])}>
            + Tambah bagian
          </button>
        </section>

        <details className="cms-section cms-cover">
          <summary>
            Gambar sampul <small>Opsional</small>
          </summary>
          <p className="cms-cover-hint">
            Pilih file JPG, PNG, atau WebP hingga 4 MB. Satu gambar bisa digunakan untuk semua ukuran layar.
          </p>
          <div className="cms-cover-inputs">
            {coverFields.map(([key, label]) => (
              <div className="cms-cover-input" key={key}>
                <label>
                  {label}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={Boolean(uploading)}
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0]
                      e.currentTarget.value = ''
                      if (file) void uploadCover(key, file)
                    }}
                  />
                </label>
                {uploading === key && <small role="status">Mengunggah gambar…</small>}
                {a[key] && validCover(a[key]) && (
                  <>
                    <img src={previewCover(a[key])} alt={'Sampul ' + label} />
                    <button
                      type="button"
                      className="cms-text-button"
                      disabled={Boolean(uploading)}
                      onClick={() => change(key, '')}
                    >
                      Hapus sampul {label.split(' · ')[0].toLowerCase()}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          {uploadError && (
            <p role="alert" className="cms-validation">
              {uploadError}
            </p>
          )}
          <label>
            Link sumber gambar sampul
            <input
              type="url"
              value={a.coverSource ?? ''}
              placeholder="https://…"
              onChange={(e) => change('coverSource', e.target.value)}
            />
          </label>
          <label>
            Teks alternatif sampul
            <input
              value={a.coverAlt}
              placeholder="Jelaskan isi gambar untuk pembaca."
              maxLength={4000}
              onChange={(e) => change('coverAlt', e.target.value)}
            />
          </label>
        </details>

        <section className="cms-section">
          <h3>Pengaturan SEO</h3>
          <label>
            Alamat artikel (slug)
            <input value={a.slug} readOnly placeholder="Otomatis dari judul" />
            <small>{articlePath(a.language, a.slug)}</small>
          </label>
          <label>
            Judul SEO{' '}
            <input
              value={a.seoTitle}
              maxLength={4000}
              placeholder={a.title || 'Menggunakan judul artikel'}
              onChange={(e) => change('seoTitle', e.target.value)}
            />
          </label>
          <div className="cms-search-example">
            <small>Perkiraan tampilan di pencarian</small>
            <strong>{titleForSearch || 'Judul artikel'} | Regen Longevity Lab</strong>
            <p>{descriptionForSearch || 'Ringkasan artikel akan muncul di sini.'}</p>
          </div>
          {count < settings.minimumWords && (
            <small>
              Target editorial {settings.minimumWords} kata. Artikel tetap bisa diajukan jika sudah menjawab
              pertanyaan pembaca.
            </small>
          )}
        </section>
        {showIssues && issues.length > 0 && (
          <div ref={validation} tabIndex={-1} role="alert" className="cms-validation">
            <strong>Lengkapi sebelum mengajukan atau menerbitkan</strong>
            <ul>
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="cms-editor-actions">
          <span role="status">
            {error || (busy ? 'Menyimpan…' : dirty ? 'Perubahan belum tersimpan' : message)}
          </span>
          <div className="cms-bar">
            <button className="button" disabled={busy || Boolean(uploading)} onClick={() => save('save')}>
              Simpan draf
            </button>
            <button
              className="button"
              disabled={busy || Boolean(uploading)}
              onClick={() => requestPublication('review')}
            >
              Ajukan review
            </button>
            {supervisor && (
              <button
                className="button primary"
                disabled={busy || Boolean(uploading)}
                onClick={() => requestPublication('publish')}
              >
                Terbitkan
              </button>
            )}
          </div>
        </div>
      </section>
      <section ref={preview} tabIndex={-1} className="cms-live-preview" aria-labelledby="cms-preview-title">
        <header className="cms-section-head">
          <h2 id="cms-preview-title">Preview artikel</h2>
          <div className="cms-view-switch" role="group" aria-label="Lebar preview">
            {(
              [
                ['desktop', 'Desktop'],
                ['tablet', 'Tablet'],
                ['mobile', 'Ponsel'],
              ] as const
            ).map(([mode, label]) => (
              <button key={mode} aria-pressed={device === mode} onClick={() => setDevice(mode)}>
                {label}
              </button>
            ))}
          </div>
        </header>
        <div className="cms-preview-page" data-device={device}>
          {hasPreview ? (
            <ArticleBody
              article={a}
              device={device}
              datePublished={initial.publishedCard?.datePublished}
              related={relatedCards(a, cards)}
            />
          ) : (
            <p className="cms-preview-empty">
              Mulai tulis judul atau paragraf untuk melihat preview artikel.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
