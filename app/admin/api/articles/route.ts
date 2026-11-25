import { currentAdmin } from '@/lib/admin-gateway'
import { boundedAdminBody, sameOrigin } from '@/lib/admin-gateway-policy'
import { canSupervise } from '@/app/admin/lib/admin-roles'
import { articleLanguages, articleSlug, safeUrl, publishErrors, validArticle } from '@/lib/articles'
import { readSettings, saveDraft, saveSettings, workspace } from '@/lib/article-store'
export const dynamic = 'force-dynamic'
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } })
const fail = (error: string, status: number) => json({ error }, status)
export async function GET() {
  if (!(await currentAdmin())) return fail('Silakan masuk kembali.', 401)
  try {
    return json(await workspace())
  } catch {
    return fail('Database artikel belum tersedia.', 503)
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail('Asal permintaan ditolak.', 403)
  const user = await currentAdmin()
  if (!user) return fail('Silakan masuk kembali.', 401)
  let input
  try {
    input = JSON.parse(new TextDecoder().decode(await boundedAdminBody(request, 500_000)))
  } catch (error) {
    return fail(
      'Isi permintaan tidak valid atau terlalu besar.',
      error instanceof Error && error.message === 'too_large' ? 413 : 400,
    )
  }
  if (!input || !Number.isSafeInteger(input.revision) || input.revision < 0)
    return fail('Revisi tidak valid.', 400)
  const { action, revision } = input
  try {
    let next
    if (action === 'settings') {
      const s = input.settings
      if (
        !s ||
        !Number.isInteger(s.minimumWords) ||
        s.minimumWords < 0 ||
        s.minimumWords > 10000 ||
        !articleLanguages.includes(s.language) ||
        typeof s.categories !== 'string' ||
        s.categories.length > 2000
      )
        return fail('Pengaturan tidak valid.', 400)
      if (
        s.authors !== undefined &&
        (!Array.isArray(s.authors) ||
          s.authors.length > 80 ||
          s.authors.some(
            (p: { name?: unknown; avatar?: unknown }) =>
              !p ||
              typeof p.name !== 'string' ||
              !p.name.trim() ||
              p.name.length > 160 ||
              typeof p.avatar !== 'string' ||
              p.avatar.length > 4000 ||
              (p.avatar && !safeUrl(p.avatar)),
          ))
      )
        return fail('Isi nama penulis dan gunakan URL HTTPS untuk avatar.', 400)
      if (s.authors) {
        s.authors = s.authors.map((p: { name: string; avatar: string }) => ({
          name: p.name.trim(),
          avatar: p.avatar.trim(),
        }))
        if (new Set(s.authors.map((p: { name: string }) => p.name.toLowerCase())).size !== s.authors.length)
          return fail('Nama penulis harus unik.', 400)
      }
      if (canSupervise(user.role)) {
        next = await saveSettings(s, revision)
      } else {
        const { settings, settingsRevision } = await readSettings()
        if (revision !== settingsRevision)
          return fail('Pengaturan sudah berubah. Muat ulang sebelum menyimpan.', 409)
        if (s.language !== settings.language || s.minimumWords !== settings.minimumWords)
          return fail('Bahasa awal dan target kata memerlukan izin supervisor.', 403)
        next = await saveSettings({ ...settings, authors: s.authors, categories: s.categories }, revision)
      }
    } else {
      const a = input.article
      if (!['save', 'review', 'publish'].includes(action) || !validArticle(a))
        return fail('Data artikel tidak valid.', 400)
      a.slug = articleSlug(a.title)
      a.summary = a.summary || a.description
      a.description = a.summary
      const errors = publishErrors(a)
      if (action !== 'save' && errors.length) return fail(errors.join(' '), 422)
      next = await saveDraft(
        a,
        revision,
        action === 'publish' ? 'published' : action === 'review' ? 'review' : 'draft',
      )
    }
    return next
      ? json({ revision: next })
      : fail('Data sudah berubah atau terjemahan sudah ada. Muat ulang sebelum menyimpan.', 409)
  } catch (error) {
    return (error as { code?: string }).code === '23505'
      ? fail('Alamat artikel atau versi bahasa sudah digunakan. Untuk alamat yang sama, bedakan judul artikelnya.', 409)
      : fail('Gagal menyimpan ke database artikel.', 503)
  }
}
