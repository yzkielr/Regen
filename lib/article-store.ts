import 'server-only'
import { Pool } from 'pg'
import {
  defaultSettings,
  type Article,
  type ArticleCard,
  type ArticleRecord,
  type ArticleSettings,
  type ArticleStatus,
  type Publication,
} from './articles'
const connectionString = () => process.env.REGEN_ARTICLES_DATABASE_URL || process.env.WORKFLOW_POSTGRES_URL
let pool: Pool | undefined
function db() {
  if (!connectionString()) throw new Error('Database artikel belum dikonfigurasi.')
  return (pool ??= new Pool({ connectionString: connectionString(), max: 4, connectionTimeoutMillis: 5000 }))
}
let ready: Promise<unknown> | undefined
async function initialize() {
  // Serialize schema creation across app workers on the first admin request.
  ready ??= (async () => {
    const client = await db().connect()
    try {
      await client.query('BEGIN')
      await client.query('SELECT pg_advisory_xact_lock(43288274)')
      await client.query(`CREATE TABLE IF NOT EXISTS regen_articles (
        id uuid PRIMARY KEY, topic uuid NOT NULL, language text NOT NULL,
        draft jsonb NOT NULL, publication jsonb, status text NOT NULL,
        revision integer NOT NULL DEFAULT 1, UNIQUE(topic,language));
        CREATE UNIQUE INDEX IF NOT EXISTS regen_articles_slug ON regen_articles(language,(publication->>'slug')) WHERE publication IS NOT NULL;
        CREATE TABLE IF NOT EXISTS regen_article_covers (file text PRIMARY KEY, image bytea NOT NULL);
        CREATE TABLE IF NOT EXISTS regen_article_paths (language text NOT NULL, slug text NOT NULL, id uuid NOT NULL REFERENCES regen_articles(id) ON DELETE CASCADE, PRIMARY KEY(language,slug,id), UNIQUE(language,slug));
        INSERT INTO regen_article_paths SELECT language,publication->>'slug',id FROM regen_articles WHERE publication IS NOT NULL ON CONFLICT DO NOTHING;
        CREATE TABLE IF NOT EXISTS regen_article_settings (id integer PRIMARY KEY, settings jsonb NOT NULL, revision integer NOT NULL)`)
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  })().catch((error) => {
    ready = undefined
    throw error
  })
  await ready
}
const cardFields = `publication - 'blocks' - 'summary' - 'description' - 'seoTitle' - 'authorAvatar'`
export async function relatedPublications(article: Publication): Promise<ArticleCard[]> {
  const { rows } = await db().query<{ card: ArticleCard }>(
    `
    SELECT ${cardFields} AS card FROM regen_articles
    WHERE publication IS NOT NULL AND language=$1 AND id<>$2
    ORDER BY (publication->>'category'=$3) DESC, publication->>'datePublished' DESC, id
    LIMIT 4`,
    [article.language, article.id, article.category],
  )
  return rows.map((row) => row.card)
}
export async function workspace() {
  await initialize()
  const records = await db().query<ArticleRecord>(
    `SELECT ${cardFields} AS "publishedCard",draft,revision,status,publication->>'slug' AS "publishedSlug",publication IS NOT NULL AS published FROM regen_articles ORDER BY lower(draft->>'title')`,
  )
  return { records: records.rows, ...(await readSettings()) }
}
export async function readSettings() {
  await initialize()
  const { rows } = await db().query('SELECT settings,revision FROM regen_article_settings WHERE id=1')
  return {
    settings: (rows[0]?.settings ?? defaultSettings) as ArticleSettings,
    settingsRevision: Number(rows[0]?.revision ?? 0),
  }
}
export async function saveSettings(settings: ArticleSettings, revision: number) {
  await initialize()
  const result =
    revision === 0
      ? await db().query(
          'INSERT INTO regen_article_settings VALUES (1,$1,1) ON CONFLICT DO NOTHING RETURNING revision',
          [settings],
        )
      : await db().query(
          'UPDATE regen_article_settings SET settings=$1,revision=revision+1 WHERE id=1 AND revision=$2 RETURNING revision',
          [settings, revision],
        )
  return result.rows[0]?.revision
}
export async function saveDraft(a: Article, revision: number, status: ArticleStatus) {
  await initialize()
  const publish = status === 'published'
  const now = new Date().toISOString()
  const pub = publish ? { ...a, datePublished: now, dateModified: now } : null
  const mutation =
    revision === 0
      ? 'INSERT INTO regen_articles(id,topic,language,draft,publication,status) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING'
      : `UPDATE regen_articles SET draft=$1,status=$2,revision=revision+1,language=$3,
       publication=CASE WHEN $4::jsonb IS NULL THEN publication ELSE $4::jsonb || jsonb_build_object('datePublished',COALESCE(publication->>'datePublished',$4::jsonb->>'datePublished')) END
       WHERE id=$5 AND revision=$6 AND topic=$7 AND (publication IS NULL OR language=$3)`
  const values =
    revision === 0
      ? [a.id, a.topic, a.language, a, pub, status]
      : [a, status, a.language, pub, a.id, revision, a.topic]
  const result = await db().query(
    `WITH changed AS (${mutation} RETURNING revision,id,language,status,publication),
    reserved AS (INSERT INTO regen_article_paths(language,slug,id)
      SELECT language,publication->>'slug',id FROM changed WHERE status='published'
      ON CONFLICT(language,slug,id) DO NOTHING)
    SELECT revision FROM changed`,
    values,
  )
  return result.rows[0]?.revision
}
export async function publishedArticles(
  language?: string,
  slug?: string,
  topic?: string,
): Promise<Publication[]> {
  if (!connectionString()) return []
  try {
    const { rows } = await db().query(
      `SELECT publication FROM regen_articles WHERE publication IS NOT NULL
      AND ($1::text IS NULL OR language=$1) AND ($2::text IS NULL OR publication->>'slug'=$2)
      AND ($3::uuid IS NULL OR topic=$3::uuid) ORDER BY publication->>'datePublished' DESC`,
      [language ?? null, slug ?? null, topic ?? null],
    )
    return rows.map((row) => row.publication)
  } catch (error) {
    if ((error as { code?: string }).code === '42P01') return []
    throw error
  }
}

export async function redirectedSlug(language: string, slug: string): Promise<string | undefined> {
  if (!connectionString()) return
  try {
    const result = await db().query(
      `SELECT a.publication->>'slug' AS slug FROM regen_article_paths p JOIN regen_articles a USING(id)
      WHERE p.language=$1 AND p.slug=$2 AND a.publication IS NOT NULL`,
      [language, slug],
    )
    return result.rows[0]?.slug
  } catch (error) {
    if ((error as { code?: string }).code !== '42P01') throw error
  }
}

export async function storeCover(file: string, image: Buffer) {
  await initialize()
  await db().query('INSERT INTO regen_article_covers(file,image) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
    file,
    image,
  ])
}

export async function readCover(file: string, publishedOnly: boolean) {
  if (!/^[a-f0-9]{64}\.webp$/.test(file) || !connectionString()) return
  const query = publishedOnly
    ? `SELECT image FROM regen_article_covers WHERE file=$1 AND EXISTS
        (SELECT 1 FROM regen_articles WHERE $2 IN (publication->>'cover', publication->>'coverTablet', publication->>'coverMobile'))`
    : 'SELECT image FROM regen_article_covers WHERE file=$1'
  try {
    const { rows } = await db().query<{ image: Buffer }>(
      query,
      publishedOnly ? [file, '/article-covers/' + file] : [file],
    )
    return rows[0]?.image
  } catch (error) {
    if ((error as { code?: string }).code !== '42P01') throw error
  }
}
