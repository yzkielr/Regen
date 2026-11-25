import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { currentAdmin } from '@/lib/admin-gateway'
import { boundedAdminBody, sameOrigin } from '@/lib/admin-gateway-policy'
import { readCover, storeCover } from '@/lib/article-store'
import { coverUploadLimit } from '@/lib/articles'

const fail = (error: string, status: number) => Response.json({ error }, { status })

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail('Asal permintaan ditolak.', 403)
  if (!(await currentAdmin())) return fail('Silakan masuk kembali.', 401)
  let image: Buffer
  try {
    const bytes = await boundedAdminBody(request, coverUploadLimit)
    const input = sharp(bytes, { limitInputPixels: 48_000_000 })
    const { format } = await input.metadata()
    if (!['jpeg', 'png', 'webp'].includes(format ?? '')) return fail('Pilih gambar JPG, PNG, atau WebP.', 415)
    image = await input
      .rotate()
      .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer()
  } catch (error) {
    if (error instanceof Error && error.message === 'too_large')
      return fail('Ukuran file maksimal 4 MB.', 413)
    return fail('Gambar tidak dapat dibaca. Pilih JPG, PNG, atau WebP hingga 48 megapiksel.', 422)
  }
  const file = createHash('sha256').update(image).digest('hex') + '.webp'
  try {
    await storeCover(file, image)
    return Response.json({ url: '/article-covers/' + file })
  } catch {
    return fail('Gambar gagal disimpan. Coba unggah kembali.', 503)
  }
}

export async function GET(request: Request) {
  if (!(await currentAdmin())) return fail('Silakan masuk kembali.', 401)
  const image = await readCover(new URL(request.url).searchParams.get('file') ?? '', false)
  return image
    ? new Response(new Uint8Array(image), {
        headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'private, no-store' },
      })
    : new Response(null, { status: 404 })
}
